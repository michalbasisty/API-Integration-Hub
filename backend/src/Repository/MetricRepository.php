<?php

namespace App\Repository;

use App\Entity\Metric;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Uid\UuidV4;

/**
 * @extends ServiceEntityRepository<Metric>
 */
class MetricRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Metric::class);
    }

    public function findByMonitorId(UuidV4 $monitorId, int $limit = 100): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.monitorId = :monitorId')
            ->setParameter('monitorId', $monitorId)
            ->orderBy('m.checkedAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findByMonitorIdAndDateRange(
        UuidV4 $monitorId,
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate
    ): array {
        return $this->createQueryBuilder('m')
            ->where('m.monitorId = :monitorId')
            ->andWhere('m.checkedAt >= :startDate')
            ->andWhere('m.checkedAt <= :endDate')
            ->setParameter('monitorId', $monitorId)
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->orderBy('m.checkedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findSuccessMetrics(UuidV4 $monitorId, \DateTimeImmutable $since): int
    {
        return (int) $this->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->where('m.monitorId = :monitorId')
            ->andWhere('m.isSuccess = true')
            ->andWhere('m.checkedAt >= :since')
            ->setParameter('monitorId', $monitorId)
            ->setParameter('since', $since)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function findTotalMetrics(UuidV4 $monitorId, \DateTimeImmutable $since): int
    {
        return (int) $this->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->where('m.monitorId = :monitorId')
            ->andWhere('m.checkedAt >= :since')
            ->setParameter('monitorId', $monitorId)
            ->setParameter('since', $since)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getAverageResponseTime(UuidV4 $monitorId, \DateTimeImmutable $since): ?int
    {
        $result = $this->createQueryBuilder('m')
            ->select('AVG(m.responseTime) as avg_response_time')
            ->where('m.monitorId = :monitorId')
            ->andWhere('m.checkedAt >= :since')
            ->setParameter('monitorId', $monitorId)
            ->setParameter('since', $since)
            ->getQuery()
            ->getOneOrNullResult();

        return $result ? (int) $result['avg_response_time'] : null;
    }
}
