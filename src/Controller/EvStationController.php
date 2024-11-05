<?php

namespace App\Controller;

use App\Repository\EvStationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;

class EvStationController extends AbstractController
{
    #[Route('/api/ev-charging-stations', name: 'api_ev_stations', methods: ['GET'])]
    public function getStations(EvStationRepository $stationRepository): JsonResponse
    {
        try {
            $stations = $stationRepository->findAll();
            
            $data = array_map(function ($station) {
                return [
                    'id' => $station->getStationId(),
                    'brand' => $station->getOperatorName(),
                    'address' => $station->getAddress(),
                    'postcode' => $station->getPostcode(),
                    'latitude' => $station->getLatitude(),
                    'longitude' => $station->getLongitude(),
                    'usageCost' => $station->getUsageCost(),
                    'connections' => $station->getConnections(),
                    'numberOfPoints' => $station->getNumberOfPoints(),
                    'isOperational' => $station->getIsOperational()
                ];
            }, $stations);

            return new JsonResponse([
                'evStations' => $data,
                'count' => count($data)
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Failed to fetch EV stations',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/api/ev-stations/route', name: 'api_ev_stations_route', methods: ['POST'])]
    public function getStationsAlongRoute(Request $request, EvStationRepository $stationRepository): JsonResponse
    {
        $content = json_decode($request->getContent(), true);
        $coordinates = $content['coordinates'] ?? [];
        
        if (empty($coordinates)) {
            return new JsonResponse(['error' => 'Route coordinates not provided'], 400);
        }
        
        $stationsAlongRoute = $stationRepository->findStationsAlongRoute($coordinates);
        
        $data = array_map(function ($station) {
            return [
                'id' => $station['station_id'],
                'brand' => $station['operator_name'],
                'address' => $station['address'],
                'postcode' => $station['postcode'],
                'latitude' => $station['latitude'],
                'longitude' => $station['longitude'],
                'distance' => $station['distance'],
                'usageCost' => $station['usage_cost'],
                'connections' => json_decode($station['connections'], true),
                'numberOfPoints' => $station['number_of_points'],
                'isOperational' => $station['is_operational']
            ];
        }, $stationsAlongRoute);

        return new JsonResponse($data);
    }
}
