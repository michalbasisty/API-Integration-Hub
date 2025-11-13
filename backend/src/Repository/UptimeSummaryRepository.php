<?php

namespace App\Repository;

use App\Entity\UptimeSummary;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Uid\UuidV4;

/**
 * @extends ServiceEntityRepository<UptimeSummary>
 */
class UptimeSummaryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UptimeSummary::class);
    }

    public function findByMonitorId(UuidV4 $monitorId, int $limit = 30): array
    {
        return $this->createQueryBuilder('u')
            ->where('u.monitorId = :monitorId')
            ->setParameter('monitorId', $monitorId)
            ->orderBy('u.date', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findByMonitorIdAndDateRange(
        UuidV4 $monitorId,
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate
    ): array {
        return $this->createQueryBuilder('u')
            ->where('u.monitorId = :monitorId')
            ->andWhere('u.date >= :startDate')
            ->andWhere('u.date <= :endDate')
            ->setParameter('monitorId', $monitorId)
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->orderBy('u.date', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByMonitorAndDate(UuidV4 $monitorId, \DateTimeImmutable $date): ?UptimeSummary
    {
        return $this->createQueryBuilder('u')
            ->where('u.monitorId = :monitorId')
            ->andWhere('u.date = :date')
            ->setParameter('monitorId', $monitorId)
            ->setParameter('date', $date)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
