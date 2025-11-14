<?php

namespace App\Service;

use App\Entity\Metric;
use App\Repository\MetricRepository;
use App\Repository\UptimeSummaryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Uid\UuidV4;

class MetricService
{
    public function __construct(
        private EntityManagerInterface $em,
        private MetricRepository $metricRepository,
        private UptimeSummaryRepository $uptimeSummaryRepository,
    ) {}

    public function saveMetric(Metric $metric): Metric
    {
        $this->em->persist($metric);
        $this->em->flush();
        return $metric;
    }

    public function calculateUptimePercentage(UuidV4 $monitorId, \DateTimeImmutable $since): float
    {
        $totalChecks = $this->metricRepository->findTotalMetrics($monitorId, $since);
        if ($totalChecks === 0) {
            return 0.0;
        }

        $successfulChecks = $this->metricRepository->findSuccessMetrics($monitorId, $since);
        return round(($successfulChecks / $totalChecks) * 100, 2);
    }

    public function getMetricsSummary(UuidV4 $monitorId, int $days = 7): array
    {
        $since = new \DateTimeImmutable(sprintf('-%d days', $days));

        return [
            'total_checks' => $this->metricRepository->findTotalMetrics($monitorId, $since),
            'successful_checks' => $this->metricRepository->findSuccessMetrics($monitorId, $since),
            'uptime_percentage' => $this->calculateUptimePercentage($monitorId, $since),
            'average_response_time' => $this->metricRepository->getAverageResponseTime($monitorId, $since),
            'period_days' => $days,
        ];
    }

    public function aggregateMetricsByHour(UuidV4 $monitorId, \DateTimeImmutable $date): array
    {
        $startOfDay = $date->setTime(0, 0, 0);
        $endOfDay = $date->setTime(23, 59, 59);

        $metrics = $this->metricRepository->findByMonitorIdAndDateRange($monitorId, $startOfDay, $endOfDay);

        $hourlyStats = [];
        for ($hour = 0; $hour < 24; $hour++) {
            $hourlyStats[$hour] = [
                'total_checks' => 0,
                'successful_checks' => 0,
                'average_response_time' => null,
                'response_times' => [],
            ];
        }

        foreach ($metrics as $metric) {
            $hour = (int) $metric->getCheckedAt()->format('H');
            $hourlyStats[$hour]['total_checks']++;
            if ($metric->isSuccess()) {
                $hourlyStats[$hour]['successful_checks']++;
            }
            $hourlyStats[$hour]['response_times'][] = $metric->getResponseTime();
        }

        foreach ($hourlyStats as $hour => &$stats) {
            if (!empty($stats['response_times'])) {
                $stats['average_response_time'] = (int) round(array_sum($stats['response_times']) / count($stats['response_times']));
            }
            unset($stats['response_times']);
        }

        return $hourlyStats;
    }

    public function getUptimeSummary(UuidV4 $monitorId, \DateTimeImmutable $date): ?array
    {
        $summary = $this->uptimeSummaryRepository->findByMonitorAndDate($monitorId, $date);
        if (!$summary) {
            return null;
        }

        return [
            'date' => $summary->getDate()->format('Y-m-d'),
            'total_checks' => $summary->getTotalChecks(),
            'successful_checks' => $summary->getSuccessfulChecks(),
            'uptime_percentage' => (float) $summary->getUptimePercentage(),
        ];
    }
}