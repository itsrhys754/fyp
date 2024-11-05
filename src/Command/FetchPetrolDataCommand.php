<?php

namespace App\Command;

use App\Entity\PetrolStation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\Console\Attribute\AsCommand;


#[AsCommand(
    name: 'app:fetch-petrol-data',
    description: 'Fetches petrol data and stores it in the database.'
)]
class FetchPetrolDataCommand extends Command
{
    private HttpClientInterface $httpClient;
    private EntityManagerInterface $entityManager;

    public function __construct(HttpClientInterface $httpClient, EntityManagerInterface $entityManager)
    {
        parent::__construct();
        $this->httpClient = $httpClient;
        $this->entityManager = $entityManager;
    }


    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $urls = [
            'https://applegreenstores.com/fuel-prices/data.json',
            'https://fuelprices.asconagroup.co.uk/newfuel.json',
            'https://storelocator.asda.com/fuel_prices_data.json',
            'https://www.bp.com/en_gb/united-kingdom/home/fuelprices/fuel_prices_data.json',
            'https://fuelprices.esso.co.uk/latestdata.json',
            'https://jetlocal.co.uk/fuel_prices_data.json',
            'https://api2.krlmedia.com/integration/live_price/krl',
            'https://www.morrisons.com/fuel-prices/fuel.json',
            'https://moto-way.com/fuel-price/fuel_prices.json',
            'https://fuel.motorfuelgroup.com/fuel_prices_data.json',
            'https://www.rontec-servicestations.co.uk/fuel-prices/data/fuel_prices_data.json',
            'https://api.sainsburys.co.uk/v1/exports/latest/fuel_prices_data.json',
            'https://www.sgnretail.uk/files/data/SGN_daily_fuel_prices.json',
            'https://www.shell.co.uk/fuel-prices-data.html',

        ];

        foreach ($urls as $url) {
            $response = $this->httpClient->request('GET', $url);
            $data = $response->toArray();

            foreach ($data['stations'] as $stationData) {
                $this->updateOrCreateStation($stationData);
            }
        }

        $this->entityManager->flush();
        $output->writeln('Petrol station data has been updated successfully.');

        return Command::SUCCESS;
    }

    private function updateOrCreateStation(array $stationData): void
    {
        $station = $this->entityManager
            ->getRepository(PetrolStation::class)
            ->findOneBy(['siteId' => $stationData['site_id']]);

        if (!$station) {
            $station = new PetrolStation();
            $station->setSiteId($stationData['site_id']);
        }

        $station->setBrand($stationData['brand']);
        $station->setAddress($stationData['address']);
        $station->setPostcode($stationData['postcode']);
        $station->setLatitude($stationData['location']['latitude']);
        $station->setLongitude($stationData['location']['longitude']);
        $station->setE5($stationData['prices']['E5'] ?? null);
        $station->setE10($stationData['prices']['E10'] ?? null);
        $station->setB7($stationData['prices']['B7'] ?? null);

        $this->entityManager->persist($station);
    }

}
