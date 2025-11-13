<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\UuidV4;

#[ORM\Entity(repositoryClass: 'App\Repository\UptimeSummaryRepository')]
#[ORM\Table(name: 'uptime_summaries')]
class UptimeSummary
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private UuidV4 $id;

    #[ORM\Column(type: 'uuid')]
    private UuidV4 $monitorId;

    #[ORM\Column(type: 'date_immutable')]
    private \DateTimeImmutable $date;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $totalChecks = 0;

    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    private int $successfulChecks = 0;

    #[ORM\Column(type: 'decimal', precision: 5, scale: 2, options: ['default' => '0.00'])]
    private string $uptimePercentage = '0.00';

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->id = new UuidV4();
        $now = new \DateTimeImmutable();
        $this->createdAt = $now;
        $this->updatedAt = $now;
    }

    public function getId(): UuidV4
    {
        return $this->id;
    }

    public function getMonitorId(): UuidV4
    {
        return $this->monitorId;
    }

    public function setMonitorId(UuidV4 $monitorId): self
    {
        $this->monitorId = $monitorId;
        return $this;
    }

    public function getDate(): \DateTimeImmutable
    {
        return $this->date;
    }

    public function setDate(\DateTimeImmutable $date): self
    {
        $this->date = $date;
        return $this;
    }

    public function getTotalChecks(): int
    {
        return $this->totalChecks;
    }

    public function setTotalChecks(int $totalChecks): self
    {
        $this->totalChecks = $totalChecks;
        return $this;
    }

    public function getSuccessfulChecks(): int
    {
        return $this->successfulChecks;
    }

    public function setSuccessfulChecks(int $successfulChecks): self
    {
        $this->successfulChecks = $successfulChecks;
        return $this;
    }

    public function getUptimePercentage(): string
    {
        return $this->uptimePercentage;
    }

    public function setUptimePercentage(string $uptimePercentage): self
    {
        $this->uptimePercentage = $uptimePercentage;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function calculateUptimePercentage(): void
    {
        if ($this->totalChecks === 0) {
            $this->uptimePercentage = '0.00';
        } else {
            $percentage = ($this->successfulChecks / $this->totalChecks) * 100;
            $this->uptimePercentage = number_format($percentage, 2, '.', '');
        }
    }
}
