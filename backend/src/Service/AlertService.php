<?php

namespace App\Service;

use App\Entity\Alert;
use App\Entity\Metric;
use App\Entity\Monitor;
use App\Repository\AlertRepository;
use App\Repository\MetricRepository;
use Doctrine\ORM\EntityManagerInterface;

class AlertService
{
    public function __construct(
        private EntityManagerInterface $em,
        private AlertRepository $alerts,
        private MetricRepository $metrics,
    ) {}

    public function checkForAlerts(Monitor $monitor, Metric $metric): void
    {
        // Check for downtime alerts
        if (!$metric->isSuccess()) {
            $this->createDowntimeAlert($monitor, $metric);
        }

        // Check for response time alerts (> 5 seconds)
        if ($metric->getResponseTime() > 5000) {
            $this->createSlowResponseAlert($monitor, $metric);
        }

        // Check for consecutive failures
        $this->checkConsecutiveFailures($monitor);
    }

    private function createDowntimeAlert(Monitor $monitor, Metric $metric): void
    {
        // Only create alert if no recent unresolved downtime alert exists
        $recentAlert = $this->alerts->findRecentUnresolvedAlert($monitor->getId(), Alert::TYPE_DOWN);
        if ($recentAlert) {
            return; // Already have an active downtime alert
        }

        $message = sprintf(
            'Monitor "%s" is down. Status code: %d, Error: %s',
            $monitor->getName(),
            $metric->getStatusCode(),
            $metric->getErrorMessage() ?: 'Unknown error'
        );

        $this->createAlert($monitor, Alert::TYPE_DOWN, Alert::SEVERITY_CRITICAL, $message);
    }

    private function createSlowResponseAlert(Monitor $monitor, Metric $metric): void
    {
        // Only create alert if no recent unresolved slow response alert exists
        $recentAlert = $this->alerts->findRecentUnresolvedAlert($monitor->getId(), Alert::TYPE_SLOW);
        if ($recentAlert) {
            return; // Already have an active slow response alert
        }

        $message = sprintf(
            'Monitor "%s" has slow response time: %dms',
            $monitor->getName(),
            $metric->getResponseTime()
        );

        $this->createAlert($monitor, Alert::TYPE_SLOW, Alert::SEVERITY_WARNING, $message);
    }

    private function checkConsecutiveFailures(Monitor $monitor): void
    {
        // Check for 3 consecutive failures in the last 5 checks
        $recentMetrics = $this->metrics->findByMonitorId($monitor->getId(), 5);
        $failureCount = 0;

        foreach ($recentMetrics as $recentMetric) {
            if (!$recentMetric->isSuccess()) {
                $failureCount++;
            } else {
                break; // Reset on first success
            }
        }

        if ($failureCount >= 3) {
            $recentAlert = $this->alerts->findRecentUnresolvedAlert($monitor->getId(), Alert::TYPE_THRESHOLD);
            if (!$recentAlert) {
                $message = sprintf(
                    'Monitor "%s" has %d consecutive failures',
                    $monitor->getName(),
                    $failureCount
                );

                $this->createAlert($monitor, Alert::TYPE_THRESHOLD, Alert::SEVERITY_WARNING, $message);
            }
        }
    }

    public function createAlert(Monitor $monitor, string $type, string $severity, string $message): Alert
    {
        $alert = new Alert();
        $alert->setMonitorId($monitor->getId());
        $alert->setAlertType($type);
        $alert->setSeverity($severity);
        $alert->setMessage($message);

        $this->em->persist($alert);
        $this->em->flush();

        return $alert;
    }

    public function resolveAlert(Alert $alert): void
    {
        $alert->resolve();
        $this->em->flush();
    }
}