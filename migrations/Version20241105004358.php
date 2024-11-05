<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241105004358 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE petrol_station CHANGE latitude latitude NUMERIC(9, 1) NOT NULL, CHANGE longitude longitude NUMERIC(9, 1) NOT NULL, CHANGE e5 e5 NUMERIC(10, 1) DEFAULT NULL, CHANGE e10 e10 NUMERIC(10, 1) DEFAULT NULL, CHANGE b7 b7 NUMERIC(10, 1) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE petrol_station CHANGE latitude latitude NUMERIC(9, 6) NOT NULL, CHANGE longitude longitude NUMERIC(9, 6) NOT NULL, CHANGE e5 e5 NUMERIC(10, 4) DEFAULT NULL, CHANGE e10 e10 NUMERIC(10, 4) DEFAULT NULL, CHANGE b7 b7 NUMERIC(10, 4) DEFAULT NULL');
    }
}
