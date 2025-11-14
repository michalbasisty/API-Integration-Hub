<?php

namespace App\Tests;

use App\Entity\Metric;
use App\Entity\Monitor;
use App\Repository\UptimeSummaryRepository;
use App\Service\AlertService;
use App\Service\HealthCheckerService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class HealthCheckerServiceTest extends TestCase
{
    private HealthCheckerService $service;
    private HttpClientInterface $httpClient;
    private EntityManagerInterface $em;
    private UptimeSummaryRepository $uptimeSummaries;
    private AlertService $alertService;

    protected function setUp(): void
    {
        $this->httpClient = $this->createMock(HttpClientInterface::class);
        $this->em = $this->createMock(EntityManagerInterface::class);
        $this->uptimeSummaries = $this->createMock(UptimeSummaryRepository::class);
        $this->alertService = $this->createMock(AlertService::class);

        $this->service = new HealthCheckerService(
            $this->httpClient,
            $this->em,
            $this->uptimeSummaries,
            $this->alertService
        );
    }

    public function testCheckMonitorSuccessful(): void
    {
        $monitor = $this->createMonitor();

        $response = $this->createMock(ResponseInterface::class);
        $response->expects($this->once())
            ->method('getStatusCode')
            ->willReturn(200);

        $this->httpClient->expects($this->once())
            ->method('request')
            ->with('GET', 'https://example.com', ['timeout' => 5.0])
            ->willReturn($response);

        $this->em->expects($this->exactly(2)) // metric + summary
            ->method('persist');
        $this->em->expects($this->once())
            ->method('flush');

        $this->alertService->expects($this->once())
            ->method('checkForAlerts');

        $metric = $this->service->checkMonitor($monitor);

        $this->assertEquals(200, $metric->getStatusCode());
        $this->assertTrue($metric->isSuccess());
        $this->assertNull($metric->getErrorMessage());
        $this->assertGreaterThan(0, $metric->getResponseTime());
    }

    public function testCheckMonitorTimeout(): void
    {
        $monitor = $this->createMonitor();

        $this->httpClient->expects($this->once())
            ->method('request')
            ->willThrowException(new \Exception('Request timeout'));

        $this->em->expects($this->exactly(2))
            ->method('persist');
        $this->em->expects($this->once())
            ->method('flush');

        $this->alertService->expects($this->once())
            ->method('checkForAlerts');

        $metric = $this->service->checkMonitor($monitor);

        $this->assertEquals(0, $metric->getStatusCode());
        $this->assertFalse($metric->isSuccess());
        $this->assertEquals('Request timeout', $metric->getErrorMessage());
    }

    public function testCheckMonitorWrongStatusCode(): void
    {
        $monitor = $this->createMonitor();

        $response = $this->createMock(ResponseInterface::class);
        $response->expects($this->once())
            ->method('getStatusCode')
            ->willReturn(500);

        $this->httpClient->expects($this->once())
            ->method('request')
            ->willReturn($response);

        $this->em->expects($this->exactly(2))
            ->method('persist');
        $this->em->expects($this->once())
            ->method('flush');

        $this->alertService->expects($this->once())
            ->method('checkForAlerts');

        $metric = $this->service->checkMonitor($monitor);

        $this->assertEquals(500, $metric->getStatusCode());
        $this->assertFalse($metric->isSuccess());
    }

    private function createMonitor(): Monitor
    {
        $monitor = $this->createMock(Monitor::class);
        $monitor->method('getId')->willReturn('550e8400-e29b-41d4-a716-446655440000');
        $monitor->method('getMethod')->willReturn('GET');
        $monitor->method('getUrl')->willReturn('https://example.com');
        $monitor->method('getTimeout')->willReturn(5.0);
        $monitor->method('getExpectedStatusCode')->willReturn(200);

        return $monitor;
    }
}