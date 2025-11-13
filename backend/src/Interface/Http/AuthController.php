<?php

namespace App\Interface\Http;

use App\Entity\Organization;
use App\Entity\User;
use App\Repository\OrganizationRepository;
use App\Repository\UserRepository;
use App\Service\JwtAuthenticationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthController
{
    public function __construct(
        private UserRepository $userRepository,
        private OrganizationRepository $organizationRepository,
        private JwtAuthenticationService $authService,
        private EntityManagerInterface $entityManager,
    ) {}

    #[Route(path: '/api/auth/register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // For simplicity, create a default organization for new users
        // In production, you'd want more sophisticated organization creation
        $organization = $this->organizationRepository->findOneBySlug('default');
        if (!$organization) {
            $organization = new Organization();
            $organization->setName('Default Organization');
            $organization->setSlug('default');
            $this->entityManager->persist($organization);
        }

        $user = new User();
        $user->setOrganization($organization);
        $user->setEmail($data['email'] ?? '');
        $user->setFirstName($data['firstName'] ?? null);
        $user->setLastName($data['lastName'] ?? null);
        $user->setPasswordHash($this->authService->hashPassword($user, $data['password'] ?? ''));
        $user->setEmailVerified(true); // Skip email verification for demo

        // Basic validation
        if (empty($data['email']) || empty($data['password'])) {
            return new JsonResponse(['error' => 'Email and password are required'], 400);
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['error' => 'Invalid email format'], 400);
        }

        if (strlen($data['password']) < 8) {
            return new JsonResponse(['error' => 'Password must be at least 8 characters'], 400);
        }

        if ($this->userRepository->findOneByEmail($data['email'])) {
            return new JsonResponse(['error' => 'User already exists'], 409);
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'User registered successfully',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
            ]
        ], 201);
    }

    #[Route(path: '/api/auth/login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        $user = $this->userRepository->findActiveByEmail($email);
        if (!$user) {
            throw new BadCredentialsException('Invalid credentials');
        }

        try {
            $this->authService->authenticate($email, $password, $user);
        } catch (BadCredentialsException $e) {
            return new JsonResponse(['error' => $e->getMessage()], 401);
        }

        $user->recordLogin();
        $this->entityManager->flush();

        $token = $this->authService->generateToken($user);

        return new JsonResponse([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => 3600, // 1 hour
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'organization' => [
                    'id' => $user->getOrganization()->getId(),
                    'name' => $user->getOrganization()->getName(),
                    'slug' => $user->getOrganization()->getSlug(),
                ]
            ]
        ]);
    }

    #[Route(path: '/api/auth/logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        // In a more complete implementation, you'd blacklist the token
        // For now, just return success as the client will discard the token
        return new JsonResponse(['message' => 'Logged out successfully']);
    }

    #[Route(path: '/api/auth/me', methods: ['GET'])]
    public function me(Request $request): JsonResponse
    {
        // This would be protected by JWT middleware
        // For now, return a placeholder
        return new JsonResponse(['message' => 'User profile endpoint']);
    }
}