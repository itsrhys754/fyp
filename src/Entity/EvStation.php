<?php

namespace App\Entity;

use App\Repository\EvStationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EvStationRepository::class)]
class EvStation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $stationId = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $operatorName = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $title = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $address = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $postcode = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 9, scale: 6)]
    private ?string $latitude = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 9, scale: 6)]
    private ?string $longitude = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $usageCost = null;

    #[ORM\Column(type: Types::JSON)]
    private array $connections = [];

    #[ORM\Column]
    private ?int $numberOfPoints = null;

    #[ORM\Column(type: Types::BOOLEAN)]
    private ?bool $isOperational = true;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStationId(): ?string
    {
        return $this->stationId;
    }

    public function setStationId(string $stationId): static
    {
        $this->stationId = $stationId;
        return $this;
    }

    public function getOperatorName(): ?string
    {
        return $this->operatorName;
    }

    public function setOperatorName(?string $operatorName): static
    {
        $this->operatorName = $operatorName;
        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title): static
    {
        $this->title = $title;
        return $this;
    }

    public function getAddress(): ?string
    {
        return $this->address;
    }

    public function setAddress(?string $address): static
    {
        $this->address = $address;
        return $this;
    }

    public function getPostcode(): ?string
    {
        return $this->postcode;
    }

    public function setPostcode(?string $postcode): static
    {
        $this->postcode = $postcode;
        return $this;
    }

    public function getLatitude(): ?string
    {
        return $this->latitude;
    }

    public function setLatitude(string $latitude): static
    {
        $this->latitude = $latitude;
        return $this;
    }

    public function getLongitude(): ?string
    {
        return $this->longitude;
    }

    public function setLongitude(string $longitude): static
    {
        $this->longitude = $longitude;
        return $this;
    }

    public function getUsageCost(): ?string
    {
        return $this->usageCost;
    }

    public function setUsageCost(?string $usageCost): static
    {
        $this->usageCost = $usageCost;
        return $this;
    }

    public function getConnections(): array
    {
        return $this->connections;
    }

    public function setConnections(array $connections): static
    {
        $this->connections = $connections;
        return $this;
    }

    public function getNumberOfPoints(): ?int
    {
        return $this->numberOfPoints;
    }

    public function setNumberOfPoints(int $numberOfPoints): static
    {
        $this->numberOfPoints = $numberOfPoints;
        return $this;
    }

    public function getIsOperational(): ?bool
    {
        return $this->isOperational;
    }

    public function setIsOperational(bool $isOperational): static
    {
        $this->isOperational = $isOperational;
        return $this;
    }
}
