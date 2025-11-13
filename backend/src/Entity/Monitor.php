<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\UuidV4;

#[ORM\Entity(repositoryClass: 'App\Repository\MonitorRepository')]
#[ORM\Table(name: 'monitors')]
class Monitor
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private UuidV4 $id;

    #[ORM\Column(type: 'uuid')]
    private UuidV4 $userId;

    #[ORM\Column(type: 'string', length: 255)]
    private string $name;

    #[ORM\Column(type: 'string')]
    private string $url;

    #[ORM\Column(type: 'string', length: 10, options: ['default' => 'GET'])]
    private string $method = 'GET';

    #[ORM\Column(type: 'integer', options: ['default' => 60])]
    private int $checkInterval = 60; // seconds

    #[ORM\Column(type: 'integer', options: ['default' => 30])]
    private int $timeout = 30; // seconds

    #[ORM\Column(type: 'smallint', options: ['default' => 200])]
    private int $expectedStatusCode = 200;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $isActive = true;

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

    public function getUserId(): UuidV4
    {
        return $this->userId;
    }

    public function setUserId(UuidV4 $userId): self
    {
        $this->userId = $userId;
        return $this;
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

    public function getUrl(): string
    {
        return $this->url;
    }

    public function setUrl(string $url): self
    {
        $this->url = $url;
        return $this;
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    public function setMethod(string $method): self
    {
        $this->method = $method;
        return $this;
    }

    public function getCheckInterval(): int
    {
        return $this->checkInterval;
    }

    public function setCheckInterval(int $checkInterval): self
    {
        $this->checkInterval = $checkInterval;
        return $this;
    }

    public function getTimeout(): int
    {
        return $this->timeout;
    }

    public function setTimeout(int $timeout): self
    {
        $this->timeout = $timeout;
        return $this;
    }

    public function getExpectedStatusCode(): int
    {
        return $this->expectedStatusCode;
    }

    public function setExpectedStatusCode(int $expectedStatusCode): self
    {
        $this->expectedStatusCode = $expectedStatusCode;
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
}
