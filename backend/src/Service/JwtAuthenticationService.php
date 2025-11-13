<?php

namespace App\Service;

use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;

class JwtAuthenticationService
{
    public function __construct(
        private JWTTokenManagerInterface $jwtManager,
        private UserPasswordHasherInterface $passwordHasher,
    ) {}

    public function generateToken(User $user): string
    {
        return $this->jwtManager->create($user);
    }

    public function validatePassword(User $user, string $plainPassword): bool
    {
        return $this->passwordHasher->isPasswordValid($user, $plainPassword);
    }

    public function hashPassword(User $user, string $plainPassword): string
    {
        return $this->passwordHasher->hashPassword($user, $plainPassword);
    }

    public function authenticate(string $email, string $password, User $user): void
    {
        if (!$this->validatePassword($user, $password)) {
            throw new BadCredentialsException('Invalid credentials');
        }

        if (!$user->isActive()) {
            throw new BadCredentialsException('Account is not active');
        }

        if (!$user->isEmailVerified()) {
            throw new BadCredentialsException('Email not verified');
        }
    }
}