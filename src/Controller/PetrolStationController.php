<?php

// src/Controller/PetrolStationController.php

namespace App\Controller;

use App\Repository\PetrolStationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;

class PetrolStationController extends AbstractController
{
    #[Route('/stations', name: 'stations')]
    public function index(): Response
    {
        // Render the petrol stations index page (if applicable)
        return $this->render('petrol_stations/index.html.twig');
    }

    #[Route('/api/stations', name: 'api_stations', methods: ['GET'])]
    public function getStations(PetrolStationRepository $stationRepository): JsonResponse
    {
        // Fetch all stations
        $stations = $stationRepository->findAll();
        
        // Map the stations to the desired output format
        $data = array_map(function ($station) {
            return [
                'siteId' => $station->getSiteId(),
                'brand' => $station->getBrand(),
                'address' => $station->getAddress(),
                'postcode' => $station->getPostcode(),
                'latitude' => $station->getLatitude(),
                'longitude' => $station->getLongitude(),
                'prices' => [
                    'E5' => $station->getE5(),
                    'E10' => $station->getE10(),
                    'B7' => $station->getB7(),
                ]
            ];
        }, $stations);

        return new JsonResponse($data);
    }

    #[Route('/api/stations/route', name: 'api_stations_route', methods: ['POST'])]
    public function getStationsAlongRoute(Request $request, PetrolStationRepository $stationRepository): JsonResponse
    {
        // Get the route data from the request
        $content = json_decode($request->getContent(), true);
        $coordinates = $content['coordinates'] ?? [];
        
        // Check if coordinates are provided
        if (empty($coordinates)) {
            return new JsonResponse(['error' => 'Route coordinates not provided'], 400);
        }
        
        // Fetch stations along the route using your repository method
        $stationsAlongRoute = $stationRepository->findStationsAlongRoute($coordinates);
        
        // Map the stations to the desired output format
        $data = array_map(function ($station) {
            return [
                'siteId' => $station['site_id'],
                'brand' => $station['brand'],
                'address' => $station['address'],
                'postcode' => $station['postcode'],
                'latitude' => $station['latitude'],
                'longitude' => $station['longitude'],
                'distance' => $station['distance'],
                'prices' => [
                    'E5' => $station['e5'],
                    'E10' => $station['e10'],
                    'B7' => $station['b7'],
                ]
            ];
        }, $stationsAlongRoute);

        return new JsonResponse($data);
    }
}
