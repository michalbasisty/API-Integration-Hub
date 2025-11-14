<?php

namespace App\Tests;

use App\Entity\Metric;
use App\Repository\MetricRepository;
use App\Repository\UptimeSummaryRepository;
use App\Service\MetricService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Uid\UuidV4;

class MetricServiceTest extends TestCase
{
    private MetricService $service;
    private EntityManagerInterface $em;
    private MetricRepository $metricRepository;
    private UptimeSummaryRepository $uptimeSummaryRepository;

    protected function setUp(): void
    {
        $this->em = $this->createMock(EntityManagerInterface::class);
        $this->metricRepository = $this->createMock(MetricRepository::class);
        $this->uptimeSummaryRepository = $this->createMock(UptimeSummaryRepository::class);

        $this->service = new MetricService(
            $this->em,
            $this->metricRepository,
            $this->uptimeSummaryRepository
        );
    }

    public function testSaveMetric(): void
    {
        $metric = $this->createMock(Metric::class);

        $this->em->expects($this->once())
            ->method('persist')
            ->with($metric);
        $this->em->expects($this->once())
            ->method('flush');

        $result = $this->service->saveMetric($metric);

        $this->assertSame($metric, $result);
    }

    public function testCalculateUptimePercentageZeroChecks(): void
    {
        $monitorId = new UuidV4();
        $since = new \DateTimeImmutable('-7 days');

        $this->metricRepository->expects($this->once())
            ->method('findTotalMetrics')
            ->with($monitorId, $since)
            ->willReturn(0);

        $this->metricRepository->expects($this->never())
            ->method('findSuccessMetrics');

        $result = $this->service->calculateUptimePercentage($monitorId, $since);

        $this->assertEquals(0.0, $result);
    }

    public function testCalculateUptimePercentage(): void
    {
        $monitorId = new UuidV4();
        $since = new \DateTimeImmutable('-7 days');

        $this->metricRepository->expects($this->once())
            ->method('findTotalMetrics')
            ->with($monitorId, $since)
            ->willReturn(100);

        $this->metricRepository->expects($this->once())
            ->method('findSuccessMetrics')
            ->with($monitorId, $since)
            ->willReturn(95);

        $result = $this->service->calculateUptimePercentage($monitorId, $since);

        $this->assertEquals(95.0, $result);
    }

    public function testGetMetricsSummary(): void
    {
        $monitorId = new UuidV4();
        $since = new \DateTimeImmutable('-7 days');

        $this->metricRepository->expects($this->once())
            ->method('findTotalMetrics')
            ->with($monitorId, $since)
            ->willReturn(100);

        $this->metricRepository->expects($this->once())
            ->method('findSuccessMetrics')
            ->with($monitorId, $since)
            ->willReturn(95);

        $this->metricRepository->expects($this->once())
            ->method('getAverageResponseTime')
            ->with($monitorId, $since)
            ->willReturn(250);

        $result = $this->service->getMetricsSummary($monitorId, 7);

        $this->assertEquals([
            'total_checks' => 100,
            'successful_checks' => 95,
            'uptime_percentage' => 95.0,
            'average_response_time' => 250,
            'period_days' => 7,
        ], $result);
    }

    public function testAggregateMetricsByHour(): void
    {
        $monitorId = new UuidV4();
        $date = new \DateTimeImmutable('2023-01-01');

        $metric = $this->createMock(Metric::class);
        $metric->method('getCheckedAt')
            ->willReturn(new \DateTimeImmutable('2023-01-01 10:30:00'));
        $metric->method('isSuccess')->willReturn(true);
        $metric->method('getResponseTime')->willReturn(200);

        $this->metricRepository->expects($this->once())
            ->method('findByMonitorIdAndDateRange')
            ->willReturn([$metric]);

        $result = $this->service->aggregateMetricsByHour($monitorId, $date);

        $this->assertArrayHasKey(10, $result);
        $this->assertEquals(1, $result[10]['total_checks']);
        $this->assertEquals(1, $result[10]['successful_checks']);
        $this->assertEquals(200, $result[10]['average_response_time']);
    }

    public function testGetUptimeSummary(): void
    {
        $monitorId = new UuidV4();
        $date = new \DateTimeImmutable('2023-01-01');

        $summary = $this->createMock(\App\Entity\UptimeSummary::class);
        $summary->method('getDate')->willReturn($date);
        $summary->method('getTotalChecks')->willReturn(10);
        $summary->method('getSuccessfulChecks')->willReturn(9);
        $summary->method('getUptimePercentage')->willReturn('90.00');

        $this->uptimeSummaryRepository->expects($this->once())
            ->method('findByMonitorAndDate')
            ->with($monitorId, $date)
            ->willReturn($summary);

        $result = $this->service->getUptimeSummary($monitorId, $date);

        $this->assertEquals([
            'date' => '2023-01-01',
            'total_checks' => 10,
            'successful_checks' => 9,
            'uptime_percentage' => 90.0,
        ], $result);
    }

    public function testGetUptimeSummaryNotFound(): void
    {
        $monitorId = new UuidV4();
        $date = new \DateTimeImmutable('2023-01-01');

        $this->uptimeSummaryRepository->expects($this->once())
            ->method('findByMonitorAndDate')
            ->willReturn(null);

        $result = $this->service->getUptimeSummary($monitorId, $date);

        $this->assertNull($result);
    }
}