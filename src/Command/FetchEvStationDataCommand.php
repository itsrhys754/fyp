<?php

namespace App\Command;

use App\Entity\EvStation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\Console\Attribute\AsCommand;

#[AsCommand(
    name: 'app:fetch-ev-data',
    description: 'Fetches EV charging station data from OpenChargeMap API.'
)]
class FetchEvStationDataCommand extends Command
{
    private HttpClientInterface $httpClient;
    private EntityManagerInterface $entityManager;
    private string $apiKey;

    public function __construct(
        HttpClientInterface $httpClient, 
        EntityManagerInterface $entityManager,
        string $apiKey
    ) {
        parent::__construct();
        $this->httpClient = $httpClient;
        $this->entityManager = $entityManager;
        $this->apiKey = $apiKey;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $response = $this->httpClient->request(
            'GET',
            'https://api.openchargemap.io/v3/poi/',
            [
                'query' => [
                    'output' => 'json',
                    'countrycode' => 'GB',
                    'maxresults' => 1000,
                    'key' => $this->apiKey
                ]
            ]
        );

        $stations = $response->toArray();

        foreach ($stations as $stationData) {
            $this->updateOrCreateStation($stationData);
        }

        $this->entityManager->flush();
        $output->writeln('EV station data has been updated successfully.');

        return Command::SUCCESS;
    }

    private function updateOrCreateStation(array $stationData): void
    {
        $station = $this->entityManager
            ->getRepository(EvStation::class)
            ->findOneBy(['stationId' => $stationData['ID']]);

        if (!$station) {
            $station = new EvStation();
            $station->setStationId($stationData['ID']);
        }

        // Safely access nested array values
        $addressInfo = $stationData['AddressInfo'] ?? [];
        $operatorInfo = $stationData['OperatorInfo'] ?? [];
        $statusType = $stationData['StatusType'] ?? [];

        $station
            ->setOperatorName($operatorInfo['Title'] ?? null)
            ->setTitle($addressInfo['Title'] ?? null)
            ->setAddress($addressInfo['AddressLine1'] ?? null)
            ->setPostcode($addressInfo['Postcode'] ?? null)
            ->setLatitude((string)($addressInfo['Latitude'] ?? '0'))
            ->setLongitude((string)($addressInfo['Longitude'] ?? '0'))
            ->setUsageCost($stationData['UsageCost'] ?? null)
            ->setConnections($stationData['Connections'] ?? [])
            ->setNumberOfPoints($stationData['NumberOfPoints'] ?? 0)
            ->setIsOperational($statusType['IsOperational'] ?? true);

        $this->entityManager->persist($station);
    }
}
