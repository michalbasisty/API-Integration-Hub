<?php

namespace App\Repository;

use App\Entity\Alert;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Uid\UuidV4;

/**
 * @extends ServiceEntityRepository<Alert>
 */
class AlertRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Alert::class);
    }

    public function findByMonitorId(UuidV4 $monitorId): array
    {
        return $this->createQueryBuilder('a')
            ->where('a.monitorId = :monitorId')
            ->setParameter('monitorId', $monitorId)
            ->orderBy('a.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findUnresolvedByMonitorId(UuidV4 $monitorId): array
    {
        return $this->createQueryBuilder('a')
            ->where('a.monitorId = :monitorId')
            ->andWhere('a.isResolved = false')
            ->setParameter('monitorId', $monitorId)
            ->orderBy('a.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findRecentAlerts(int $days = 7, int $limit = 50): array
    {
        $since = new \DateTimeImmutable(sprintf('-%d days', $days));

        return $this->createQueryBuilder('a')
            ->where('a.createdAt >= :since')
            ->setParameter('since', $since)
            ->orderBy('a.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findCriticalAlerts(): array
    {
        return $this->createQueryBuilder('a')
            ->where('a.severity = :severity')
            ->andWhere('a.isResolved = false')
            ->setParameter('severity', Alert::SEVERITY_CRITICAL)
            ->orderBy('a.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findRecentUnresolvedAlert(UuidV4 $monitorId, string $alertType): ?Alert
    {
        return $this->createQueryBuilder('a')
            ->where('a.monitorId = :monitorId')
            ->andWhere('a.alertType = :alertType')
            ->andWhere('a.isResolved = false')
            ->andWhere('a.createdAt > :since')
            ->setParameter('monitorId', $monitorId)
            ->setParameter('alertType', $alertType)
            ->setParameter('since', new \DateTimeImmutable('-1 hour'))
            ->orderBy('a.createdAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
