<?php

namespace App\Tests;

use App\Entity\Alert;
use App\Entity\Metric;
use App\Entity\Monitor;
use App\Repository\AlertRepository;
use App\Repository\MetricRepository;
use App\Service\AlertService;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Uid\UuidV4;

class AlertServiceTest extends TestCase
{
    private AlertService $service;
    private EntityManagerInterface $em;
    private AlertRepository $alerts;
    private MetricRepository $metrics;
    private NotificationService $notificationService;

    protected function setUp(): void
    {
        $this->em = $this->createMock(EntityManagerInterface::class);
        $this->alerts = $this->createMock(AlertRepository::class);
        $this->metrics = $this->createMock(MetricRepository::class);
        $this->notificationService = $this->createMock(NotificationService::class);

        $this->service = new AlertService(
            $this->em,
            $this->alerts,
            $this->metrics,
            $this->notificationService
        );
    }

    public function testCheckForAlertsDowntime(): void
    {
        $monitor = $this->createMonitor();
        $metric = $this->createMetric(false, 500, 'Internal Server Error');

        $this->alerts->expects($this->once())
            ->method('findRecentUnresolvedAlert')
            ->with($monitor->getId(), Alert::TYPE_DOWN)
            ->willReturn(null);

        $this->em->expects($this->once())
            ->method('persist')
            ->with($this->isInstanceOf(Alert::class));
        $this->em->expects($this->once())
            ->method('flush');

        $this->notificationService->expects($this->once())
            ->method('sendAlertNotification');

        $this->service->checkForAlerts($monitor, $metric);
    }

    public function testCheckForAlertsNoDuplicateDowntime(): void
    {
        $monitor = $this->createMonitor();
        $metric = $this->createMetric(false, 500, 'Internal Server Error');

        $existingAlert = $this->createMock(Alert::class);
        $this->alerts->expects($this->once())
            ->method('findRecentUnresolvedAlert')
            ->with($monitor->getId(), Alert::TYPE_DOWN)
            ->willReturn($existingAlert);

        $this->em->expects($this->never())
            ->method('persist');
        $this->em->expects($this->never())
            ->method('flush');

        $this->notificationService->expects($this->never())
            ->method('sendAlertNotification');

        $this->service->checkForAlerts($monitor, $metric);
    }

    public function testCheckForAlertsSlowResponse(): void
    {
        $monitor = $this->createMonitor();
        $metric = $this->createMetric(true, 6000);

        $this->alerts->expects($this->exactly(2))
            ->method('findRecentUnresolvedAlert')
            ->willReturn(null);

        $this->em->expects($this->once())
            ->method('persist')
            ->with($this->isInstanceOf(Alert::class));
        $this->em->expects($this->once())
            ->method('flush');

        $this->notificationService->expects($this->once())
            ->method('sendAlertNotification');

        $this->service->checkForAlerts($monitor, $metric);
    }

    public function testCheckForAlertsConsecutiveFailures(): void
    {
        $monitor = $this->createMonitor();
        $metric = $this->createMetric(false, 200);

        $failedMetric = $this->createMock(Metric::class);
        $failedMetric->method('isSuccess')->willReturn(false);

        $this->metrics->expects($this->once())
            ->method('findByMonitorId')
            ->with($monitor->getId(), 5)
            ->willReturn([$failedMetric, $failedMetric, $failedMetric]);

        $this->alerts->expects($this->exactly(2))
            ->method('findRecentUnresolvedAlert')
            ->willReturn(null);

        $this->em->expects($this->once())
            ->method('persist')
            ->with($this->isInstanceOf(Alert::class));
        $this->em->expects($this->once())
            ->method('flush');

        $this->notificationService->expects($this->once())
            ->method('sendAlertNotification');

        $this->service->checkForAlerts($monitor, $metric);
    }

    public function testCreateAlert(): void
    {
        $monitor = $this->createMonitor();

        $this->em->expects($this->once())
            ->method('persist')
            ->with($this->isInstanceOf(Alert::class));
        $this->em->expects($this->once())
            ->method('flush');

        $this->notificationService->expects($this->once())
            ->method('sendAlertNotification')
            ->with($this->isInstanceOf(Alert::class));

        $alert = $this->service->createAlert(
            $monitor,
            Alert::TYPE_DOWN,
            Alert::SEVERITY_CRITICAL,
            'Monitor is down'
        );

        $this->assertEquals(Alert::TYPE_DOWN, $alert->getAlertType());
        $this->assertEquals(Alert::SEVERITY_CRITICAL, $alert->getSeverity());
        $this->assertEquals('Monitor is down', $alert->getMessage());
        $this->assertFalse($alert->isResolved());
    }

    public function testResolveAlert(): void
    {
        $alert = $this->createMock(Alert::class);
        $alert->expects($this->once())
            ->method('resolve');

        $this->em->expects($this->once())
            ->method('flush');

        $this->service->resolveAlert($alert);
    }

    private function createMonitor(): Monitor
    {
        $monitor = $this->createMock(Monitor::class);
        $monitor->method('getId')->willReturn(new UuidV4());
        $monitor->method('getName')->willReturn('Test Monitor');

        return $monitor;
    }

    private function createMetric(bool $isSuccess, int $responseTime, ?string $errorMessage = null): Metric
    {
        $metric = $this->createMock(Metric::class);
        $metric->method('isSuccess')->willReturn($isSuccess);
        $metric->method('getResponseTime')->willReturn($responseTime);
        $metric->method('getStatusCode')->willReturn($isSuccess ? 200 : 500);
        $metric->method('getErrorMessage')->willReturn($errorMessage);

        return $metric;
    }
}