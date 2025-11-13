<?php

namespace App\Service;

use App\Entity\Metric;
use App\Entity\Monitor;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\UptimeSummaryRepository;
use App\Entity\UptimeSummary;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class HealthCheckerService
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private EntityManagerInterface $em,
        private UptimeSummaryRepository $uptimeSummaries,
        private AlertService $alertService,
    ) {}

    public function checkMonitor(Monitor $monitor): Metric
    {
        $start = microtime(true);
        $statusCode = 0;
        $isSuccess = false;
        $errorMessage = null;

        try {
            $response = $this->httpClient->request($monitor->getMethod(), $monitor->getUrl(), [
                'timeout' => $monitor->getTimeout(),
            ]);
            $statusCode = $response->getStatusCode();
            $isSuccess = ($statusCode === $monitor->getExpectedStatusCode());
        } catch (\Throwable $e) {
            $errorMessage = $e->getMessage();
        }

        $durationMs = (int) round((microtime(true) - $start) * 1000);

        $metric = new Metric();
        $metric->setMonitorId($monitor->getId());
        $metric->setStatusCode($statusCode);
        $metric->setResponseTime($durationMs);
        $metric->setIsSuccess($isSuccess);
        $metric->setErrorMessage($errorMessage);

        $this->em->persist($metric);
        $this->updateUptimeSummary($monitor, $isSuccess);

        // Check for alerts after recording the metric
        $this->alertService->checkForAlerts($monitor, $metric);

        $this->em->flush();

        return $metric;
    }

    private function updateUptimeSummary(Monitor $monitor, bool $isSuccess): void
    {
        $today = (new \DateTimeImmutable())->setTime(0, 0, 0);
        $summary = $this->uptimeSummaries->findByMonitorAndDate($monitor->getId(), $today);
        if (!$summary) {
            $summary = new UptimeSummary();
            $summary->setMonitorId($monitor->getId());
            $summary->setDate($today);
            $summary->setTotalChecks(0);
            $summary->setSuccessfulChecks(0);
        }
        $summary->setTotalChecks($summary->getTotalChecks() + 1);
        if ($isSuccess) {
            $summary->setSuccessfulChecks($summary->getSuccessfulChecks() + 1);
        }
        $summary->calculateUptimePercentage();
        $summary->setUpdatedAt(new \DateTimeImmutable());
        $this->em->persist($summary);
    }
}
