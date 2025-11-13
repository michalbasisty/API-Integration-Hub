<?php

namespace App\Service;

use App\Entity\Alert;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class NotificationService
{
    public function __construct(
        private MailerInterface $mailer,
        private string $fromEmail = 'noreply@pulseapi.com',
        private array $adminEmails = ['admin@pulseapi.com']
    ) {}

    public function sendAlertNotification(Alert $alert): void
    {
        $subject = $this->getAlertSubject($alert);
        $body = $this->getAlertBody($alert);

        $email = (new Email())
            ->from($this->fromEmail)
            ->to(...$this->adminEmails)
            ->subject($subject)
            ->html($body);

        $this->mailer->send($email);
    }

    public function sendDailySummary(array $stats): void
    {
        $subject = "PulseAPI - Daily Monitoring Summary";
        $body = $this->getDailySummaryBody($stats);

        $email = (new Email())
            ->from($this->fromEmail)
            ->to(...$this->adminEmails)
            ->subject($subject)
            ->html($body);

        $this->mailer->send($email);
    }

    private function getAlertSubject(Alert $alert): string
    {
        $severity = strtoupper($alert->getSeverity());
        $type = ucfirst(str_replace('_', ' ', $alert->getAlertType()));

        return "PulseAPI Alert: {$severity} - {$type}";
    }

    private function getAlertBody(Alert $alert): string
    {
        $severity = strtoupper($alert->getSeverity());
        $type = ucfirst(str_replace('_', ' ', $alert->getAlertType()));
        $created = $alert->getCreatedAt()->format('Y-m-d H:i:s');

        $html = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .alert-header { background: #f8f9fa; padding: 15px; border-left: 4px solid " . $this->getSeverityColor($alert->getSeverity()) . "; }
                .alert-content { padding: 15px; }
                .severity { font-weight: bold; color: " . $this->getSeverityColor($alert->getSeverity()) . "; }
                .timestamp { color: #666; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <div class='alert-header'>
                <h2>PulseAPI Alert Notification</h2>
                <p class='severity'>{$severity} - {$type}</p>
                <p class='timestamp'>Created: {$created}</p>
            </div>
            <div class='alert-content'>
                <p><strong>Message:</strong></p>
                <p>{$alert->getMessage()}</p>
                <hr>
                <p>This is an automated notification from PulseAPI monitoring system.</p>
                <p><a href='http://localhost:4200/alerts'>View in Dashboard</a></p>
            </div>
        </body>
        </html>
        ";

        return $html;
    }

    private function getDailySummaryBody(array $stats): string
    {
        $date = date('Y-m-d');
        $totalChecks = $stats['totalChecks'] ?? 0;
        $successfulChecks = $stats['successfulChecks'] ?? 0;
        $failedChecks = $stats['failedChecks'] ?? 0;
        $uptimePercentage = $stats['uptimePercentage'] ?? 0;
        $alertsCreated = $stats['alertsCreated'] ?? 0;

        $html = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .summary-header { background: #667eea; color: white; padding: 15px; }
                .summary-content { padding: 15px; }
                .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 15px 0; }
                .stat-box { background: #f8f9fa; padding: 10px; text-align: center; border-radius: 4px; }
                .stat-number { font-size: 1.5em; font-weight: bold; }
                .uptime-good { color: #38a169; }
                .uptime-warning { color: #ed8936; }
                .uptime-critical { color: #e53e3e; }
            </style>
        </head>
        <body>
            <div class='summary-header'>
                <h2>PulseAPI Daily Summary - {$date}</h2>
            </div>
            <div class='summary-content'>
                <div class='stats-grid'>
                    <div class='stat-box'>
                        <div class='stat-number'>{$totalChecks}</div>
                        <div>Total Checks</div>
                    </div>
                    <div class='stat-box'>
                        <div class='stat-number'>{$successfulChecks}</div>
                        <div>Successful</div>
                    </div>
                    <div class='stat-box'>
                        <div class='stat-number'>{$failedChecks}</div>
                        <div>Failed</div>
                    </div>
                    <div class='stat-box'>
                        <div class='stat-number " . $this->getUptimeClass($uptimePercentage) . "'>{$uptimePercentage}%</div>
                        <div>Uptime</div>
                    </div>
                </div>

                <p><strong>Alerts Created:</strong> {$alertsCreated}</p>

                <hr>
                <p>This is an automated daily summary from PulseAPI monitoring system.</p>
                <p><a href='http://localhost:4200'>View Full Dashboard</a></p>
            </div>
        </body>
        </html>
        ";

        return $html;
    }

    private function getSeverityColor(string $severity): string
    {
        return match ($severity) {
            'critical' => '#e53e3e',
            'warning' => '#ed8936',
            'info' => '#3182ce',
            default => '#718096'
        };
    }

    private function getUptimeClass(float $percentage): string
    {
        if ($percentage >= 99) return 'uptime-good';
        if ($percentage >= 95) return 'uptime-warning';
        return 'uptime-critical';
    }
}