<?php

namespace App\Interface\Http;

use App\Entity\Monitor;
use App\Repository\MonitorRepository;
use App\Repository\MetricRepository;
use App\Repository\UptimeSummaryRepository;
use App\Service\HealthCheckerService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Uid\UuidV4;

class MonitorController
{
    public function __construct(
        private EntityManagerInterface $em,
        private MonitorRepository $monitors,
        private MetricRepository $metrics,
        private HealthCheckerService $checker,
        private UptimeSummaryRepository $uptimeSummaries,
    ) {}

    #[Route(path: '/api/monitors', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $items = $this->monitors->findActiveMonitors();
        $data = array_map(function (Monitor $m) {
            return [
                'id' => (string) $m->getId(),
                'name' => $m->getName(),
                'url' => $m->getUrl(),
                'method' => $m->getMethod(),
                'expected_status_code' => $m->getExpectedStatusCode(),
                'is_active' => $m->isActive(),
                'check_interval' => $m->getCheckInterval(),
                'timeout' => $m->getTimeout(),
            ];
        }, $items);

        return new JsonResponse(['data' => $data]);
    }

    #[Route(path: '/api/monitors', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true) ?? [];

        $monitor = new Monitor();
        $monitor->setUserId(new UuidV4());
        $monitor->setName($payload['name'] ?? 'Unnamed');
        $monitor->setUrl($payload['url'] ?? '');
        if (isset($payload['method'])) $monitor->setMethod($payload['method']);
        if (isset($payload['expected_status_code'])) $monitor->setExpectedStatusCode((int) $payload['expected_status_code']);
        if (isset($payload['check_interval'])) $monitor->setCheckInterval((int) $payload['check_interval']);
        if (isset($payload['timeout'])) $monitor->setTimeout((int) $payload['timeout']);

        $this->em->persist($monitor);
        $this->em->flush();

        return new JsonResponse(['id' => (string) $monitor->getId()], 201);
    }

    #[Route(path: '/api/monitors/{id}', methods: ['GET'])]
    public function getOne(string $id): JsonResponse
    {
        $monitor = $this->monitors->find($id);
        if (!$monitor) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }

        return new JsonResponse([
            'id' => (string) $monitor->getId(),
            'name' => $monitor->getName(),
            'url' => $monitor->getUrl(),
            'method' => $monitor->getMethod(),
            'expected_status_code' => $monitor->getExpectedStatusCode(),
            'is_active' => $monitor->isActive(),
            'check_interval' => $monitor->getCheckInterval(),
            'timeout' => $monitor->getTimeout(),
        ]);
    }

    #[Route(path: '/api/monitors/{id}', methods: ['PUT'])]
    public function update(string $id, Request $request): JsonResponse
    {
        $monitor = $this->monitors->find($id);
        if (!$monitor) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }
        $payload = json_decode($request->getContent(), true) ?? [];
        if (isset($payload['name'])) $monitor->setName($payload['name']);
        if (isset($payload['url'])) $monitor->setUrl($payload['url']);
        if (isset($payload['method'])) $monitor->setMethod($payload['method']);
        if (isset($payload['expected_status_code'])) $monitor->setExpectedStatusCode((int) $payload['expected_status_code']);
        if (isset($payload['is_active'])) $monitor->setIsActive((bool) $payload['is_active']);
        if (isset($payload['check_interval'])) $monitor->setCheckInterval((int) $payload['check_interval']);
        if (isset($payload['timeout'])) $monitor->setTimeout((int) $payload['timeout']);
        $monitor->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();
        return new JsonResponse(['ok' => true]);
    }

    #[Route(path: '/api/monitors/{id}', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $monitor = $this->monitors->find($id);
        if (!$monitor) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }
        $this->em->remove($monitor);
        $this->em->flush();
        return new JsonResponse(null, 204);
    }

    #[Route(path: '/api/monitors/{id}/check', methods: ['POST'])]
    public function manualCheck(string $id): JsonResponse
    {
        $monitor = $this->monitors->find($id);
        if (!$monitor) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }
        $metric = $this->checker->checkMonitor($monitor);
        return new JsonResponse([
            'status_code' => $metric->getStatusCode(),
            'response_time' => $metric->getResponseTime(),
            'is_success' => $metric->isSuccess(),
            'error_message' => $metric->getErrorMessage(),
            'checked_at' => $metric->getCheckedAt()->format(DATE_ATOM),
        ]);
    }

    #[Route(path: '/api/monitors/{id}/metrics', methods: ['GET'])]
    public function metrics(string $id): JsonResponse
    {
        $monitor = $this->monitors->find($id);
        if (!$monitor) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }
        $items = $this->metrics->findByMonitorId($monitor->getId(), 100);
        $data = array_map(function ($m) {
            return [
                'status_code' => $m->getStatusCode(),
                'response_time' => $m->getResponseTime(),
                'is_success' => $m->isSuccess(),
                'error_message' => $m->getErrorMessage(),
                'checked_at' => $m->getCheckedAt()->format(DATE_ATOM),
            ];
        }, $items);
        return new JsonResponse(['data' => $data]);
    }

    #[Route(path: '/api/monitors/{id}/metrics/summary', methods: ['GET'])]
    public function metricsSummary(string $id, Request $request): JsonResponse
    {
        $monitor = $this->monitors->find($id);
        if (!$monitor) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }
        $days = (int) ($request->query->get('days') ?? 7);
        if ($days <= 0) { $days = 7; }
        $since = new \DateTimeImmutable(sprintf('-%d days', $days));
        $total = $this->metrics->findTotalMetrics($monitor->getId(), $since);
        $success = $this->metrics->findSuccessMetrics($monitor->getId(), $since);
        $avg = $this->metrics->getAverageResponseTime($monitor->getId(), $since);
        $uptime = $total === 0 ? 0.0 : round(($success / $total) * 100, 2);
        return new JsonResponse([
            'days' => $days,
            'total_checks' => $total,
            'successful_checks' => $success,
            'uptime_percentage' => $uptime,
            'average_response_time' => $avg,
            'since' => $since->format(DATE_ATOM),
        ]);
    }

    #[Route(path: '/api/monitors/{id}/uptime/daily', methods: ['GET'])]
    public function uptimeDaily(string $id, Request $request): JsonResponse
    {
        $monitor = $this->monitors->find($id);
        if (!$monitor) {
            return new JsonResponse(['error' => 'Not found'], 404);
        }
        $days = (int) ($request->query->get('days') ?? 30);
        if ($days <= 0) { $days = 30; }
        $end = (new \DateTimeImmutable())->setTime(0, 0, 0);
        $start = $end->modify(sprintf('-%d days', $days - 1));
        $rows = $this->uptimeSummaries->findByMonitorIdAndDateRange($monitor->getId(), $start, $end);
        $data = array_map(function ($u) {
            return [
                'date' => $u->getDate()->format('Y-m-d'),
                'uptime_percentage' => (float) $u->getUptimePercentage(),
                'total_checks' => $u->getTotalChecks(),
                'successful_checks' => $u->getSuccessfulChecks(),
            ];
        }, $rows);
        return new JsonResponse(['data' => $data]);
    }

    #[Route(path: '/api/projects', methods: ['GET'])]
    public function projects(): JsonResponse
    {
        $items = $this->monitors->findActiveMonitors();
        $data = array_map(function (Monitor $m) {
            return [
                'id' => (string) $m->getId(),
                'name' => $m->getName(),
                'status' => $m->isActive() ? 'active' : 'inactive',
            ];
        }, $items);
        return new JsonResponse(['data' => $data]);
    }
}
