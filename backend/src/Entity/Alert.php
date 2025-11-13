<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\UuidV4;

#[ORM\Entity(repositoryClass: 'App\Repository\AlertRepository')]
#[ORM\Table(name: 'alerts')]
class Alert
{
    public const TYPE_DOWN = 'down';
    public const TYPE_SLOW = 'slow';
    public const TYPE_THRESHOLD = 'threshold';

    public const SEVERITY_CRITICAL = 'critical';
    public const SEVERITY_WARNING = 'warning';
    public const SEVERITY_INFO = 'info';

    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private UuidV4 $id;

    #[ORM\Column(type: 'uuid')]
    private UuidV4 $monitorId;

    #[ORM\Column(type: 'string', length: 50)]
    private string $alertType;

    #[ORM\Column(type: 'string', length: 50)]
    private string $severity;

    #[ORM\Column(type: 'text')]
    private string $message;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $isResolved = false;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $resolvedAt = null;

    public function __construct()
    {
        $this->id = new UuidV4();
        $this->createdAt = new \DateTimeImmutable();
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

    public function getAlertType(): string
    {
        return $this->alertType;
    }

    public function setAlertType(string $alertType): self
    {
        if (!in_array($alertType, [self::TYPE_DOWN, self::TYPE_SLOW, self::TYPE_THRESHOLD])) {
            throw new \InvalidArgumentException('Invalid alert type');
        }
        $this->alertType = $alertType;
        return $this;
    }

    public function getSeverity(): string
    {
        return $this->severity;
    }

    public function setSeverity(string $severity): self
    {
        if (!in_array($severity, [self::SEVERITY_CRITICAL, self::SEVERITY_WARNING, self::SEVERITY_INFO])) {
            throw new \InvalidArgumentException('Invalid severity');
        }
        $this->severity = $severity;
        return $this;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    public function setMessage(string $message): self
    {
        $this->message = $message;
        return $this;
    }

    public function isResolved(): bool
    {
        return $this->isResolved;
    }

    public function setIsResolved(bool $isResolved): self
    {
        $this->isResolved = $isResolved;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getResolvedAt(): ?\DateTimeImmutable
    {
        return $this->resolvedAt;
    }

    public function setResolvedAt(?\DateTimeImmutable $resolvedAt): self
    {
        $this->resolvedAt = $resolvedAt;
        return $this;
    }

    public function resolve(): self
    {
        $this->isResolved = true;
        $this->resolvedAt = new \DateTimeImmutable();
        return $this;
    }
}
