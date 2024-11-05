<?php

namespace App\Repository;

use App\Entity\EvStation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class EvStationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EvStation::class);
    }

    public function findStationsAlongRoute(array $coordinates, float $maxDistance = 5.0): array
    {
        $conn = $this->getEntityManager()->getConnection();
        
        // Create a temporary table for route points
        $conn->executeQuery('CREATE TEMPORARY TABLE IF NOT EXISTS route_points (lat DOUBLE, lng DOUBLE)');
        $conn->executeQuery('TRUNCATE route_points');

        // Insert coordinates using a single query with multiple values
        $placeholders = [];
        $params = [];
        foreach ($coordinates as $i => $coord) {
            $placeholders[] = "(?, ?)";
            $params[] = $coord[1]; // latitude
            $params[] = $coord[0]; // longitude
        }
        
        $insertSql = 'INSERT INTO route_points (lat, lng) VALUES ' . implode(',', $placeholders);
        $conn->executeQuery($insertSql, $params);

        // Main query to find stations
        $sql = '
            SELECT DISTINCT s.*,
                MIN(
                    111.111 * DEGREES(
                        ACOS(
                            LEAST(1.0, COS(RADIANS(p.lat))
                            * COS(RADIANS(s.latitude))
                            * COS(RADIANS(p.lng - s.longitude))
                            + SIN(RADIANS(p.lat))
                            * SIN(RADIANS(s.latitude))
                        ))
                    )
                ) AS distance
            FROM ev_station s
            CROSS JOIN route_points p
            GROUP BY s.id, s.latitude, s.longitude
            HAVING distance <= :maxDistance
            ORDER BY distance ASC
        ';

        try {
            $result = $conn->executeQuery($sql, ['maxDistance' => $maxDistance])->fetchAllAssociative();
            $conn->executeQuery('DROP TEMPORARY TABLE IF EXISTS route_points');
            return $result;
        } catch (\Exception $e) {
            $conn->executeQuery('DROP TEMPORARY TABLE IF EXISTS route_points');
            throw $e;
        }
    }
}
