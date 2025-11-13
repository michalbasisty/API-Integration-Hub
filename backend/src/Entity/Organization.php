<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\UuidV4;

#[ORM\Entity(repositoryClass: 'App\Repository\OrganizationRepository')]
#[ORM\Table(name: 'organizations')]
class Organization
{
    public const PLAN_FREE = 'free';
    public const PLAN_PRO = 'pro';
    public const PLAN_ENTERPRISE = 'enterprise';

    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private UuidV4 $id;

    #[ORM\Column(type: 'string', length: 255, unique: true)]
    private string $name;

    #[ORM\Column(type: 'string', length: 100, unique: true)]
    private string $slug;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $domain = null;

    #[ORM\Column(type: 'string', length: 50, options: ['default' => self::PLAN_FREE])]
    private string $subscriptionPlan = self::PLAN_FREE;

    #[ORM\Column(type: 'integer', options: ['default' => 10])]
    private int $maxUsers = 10;

    #[ORM\Column(type: 'integer', options: ['default' => 50])]
    private int $maxMonitors = 50;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $isActive = true;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->id = new UuidV4();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): UuidV4
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getSlug(): string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): self
    {
        $this->slug = $slug;
        return $this;
    }

    public function getDomain(): ?string
    {
        return $this->domain;
    }

    public function setDomain(?string $domain): self
    {
        $this->domain = $domain;
        return $this;
    }

    public function getSubscriptionPlan(): string
    {
        return $this->subscriptionPlan;
    }

    public function setSubscriptionPlan(string $subscriptionPlan): self
    {
        if (!in_array($subscriptionPlan, [self::PLAN_FREE, self::PLAN_PRO, self::PLAN_ENTERPRISE])) {
            throw new \InvalidArgumentException('Invalid subscription plan');
        }
        $this->subscriptionPlan = $subscriptionPlan;
        return $this;
    }

    public function getMaxUsers(): int
    {
        return $this->maxUsers;
    }

    public function setMaxUsers(int $maxUsers): self
    {
        $this->maxUsers = $maxUsers;
        return $this;
    }

    public function getMaxMonitors(): int
    {
        return $this->maxMonitors;
    }

    public function setMaxMonitors(int $maxMonitors): self
    {
        $this->maxMonitors = $maxMonitors;
        return $this;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): self
    {
        $this->isActive = $isActive;
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

    public function updateTimestamp(): self
    {
        $this->updatedAt = new \DateTimeImmutable();
        return $this;
    }
}