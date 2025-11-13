<?php

namespace App\Repository;

use App\Entity\Monitor;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Uid\UuidV4;

/**
 * @extends ServiceEntityRepository<Monitor>
 */
class MonitorRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Monitor::class);
    }

    public function findByUserId(UuidV4 $userId): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.userId = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findActiveMonitors(): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.isActive = true')
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findActiveMonitorsByUserId(UuidV4 $userId): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.userId = :userId')
            ->andWhere('m.isActive = true')
            ->setParameter('userId', $userId)
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
