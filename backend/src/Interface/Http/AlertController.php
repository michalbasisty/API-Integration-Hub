<?php

namespace App\Interface\Http;

use App\Repository\AlertRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class AlertController
{
    public function __construct(
        private AlertRepository $alerts,
        private EntityManagerInterface $em,
    ) {}

    #[Route(path: '/api/alerts', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $rows = $this->alerts->findRecent(200);
        $data = array_map(function ($a) {
            return [
                'id' => (string) $a->getId(),
                'monitor_id' => (string) $a->getMonitorId(),
                'alert_type' => $a->getAlertType(),
                'severity' => $a->getSeverity(),
                'message' => $a->getMessage(),
                'is_resolved' => $a->isResolved(),
                'created_at' => $a->getCreatedAt()->format(DATE_ATOM),
                'updated_at' => $a->getUpdatedAt()->format(DATE_ATOM),
            ];
        }, $rows);
        return new JsonResponse(['data' => $data]);
    }

    #[Route(path: '/api/alerts/{id}/resolve', methods: ['POST'])]
    public function resolve(string $id): JsonResponse
    {
        $alert = $this->alerts->find($id);
        if (!$alert) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }
        $alert->setIsResolved(true);
        $alert->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();
        return new JsonResponse(['ok' => true]);
    }
}