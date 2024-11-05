<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class MapController extends AbstractController
{
    #[Route('/stations', name: 'petrol_price_map')]
    public function index(): Response
    {
        $mapboxAccessToken = $_ENV['MAPBOX_ACCESS_TOKEN']; // Gets the access token from the environment variable
        return $this->render('petrol_stations/index.html.twig', [
            'mapboxAccessToken' => $mapboxAccessToken, // Pass it to the template
        ]);
    }
}
