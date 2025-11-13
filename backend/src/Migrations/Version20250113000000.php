<?php

declare(strict_types=1);

namespace App\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250113000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create initial monitoring schema with Monitor, Metric, UptimeSummary, and Alert tables';
    }

    public function up(Schema $schema): void
    {
        // Monitors table
        $this->addSql('CREATE TABLE monitors (
            id CHAR(36) NOT NULL PRIMARY KEY,
            user_id CHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            url LONGTEXT NOT NULL,
            method VARCHAR(10) NOT NULL DEFAULT \'GET\',
            check_interval INT NOT NULL DEFAULT 60,
            timeout INT NOT NULL DEFAULT 30,
            expected_status_code SMALLINT NOT NULL DEFAULT 200,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX idx_user_id (user_id),
            INDEX idx_is_active (is_active),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');

        // Metrics table
        $this->addSql('CREATE TABLE metrics (
            id CHAR(36) NOT NULL PRIMARY KEY,
            monitor_id CHAR(36) NOT NULL,
            status_code SMALLINT NOT NULL,
            response_time INT NOT NULL,
            is_success TINYINT(1) NOT NULL,
            error_message LONGTEXT,
            checked_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX idx_monitor_id_checked_at (monitor_id, checked_at),
            INDEX idx_monitor_id (monitor_id),
            INDEX idx_is_success (is_success),
            FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');

        // UptimeSummaries table
        $this->addSql('CREATE TABLE uptime_summaries (
            id CHAR(36) NOT NULL PRIMARY KEY,
            monitor_id CHAR(36) NOT NULL,
            date DATE NOT NULL COMMENT \'(DC2Type:date_immutable)\',
            total_checks INT NOT NULL DEFAULT 0,
            successful_checks INT NOT NULL DEFAULT 0,
            uptime_percentage DECIMAL(5, 2) NOT NULL DEFAULT \'0.00\',
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            UNIQUE KEY unique_monitor_date (monitor_id, date),
            INDEX idx_monitor_id (monitor_id),
            INDEX idx_date (date),
            FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');

        // Alerts table
        $this->addSql('CREATE TABLE alerts (
            id CHAR(36) NOT NULL PRIMARY KEY,
            monitor_id CHAR(36) NOT NULL,
            alert_type VARCHAR(50) NOT NULL,
            severity VARCHAR(50) NOT NULL,
            message LONGTEXT NOT NULL,
            is_resolved TINYINT(1) NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            resolved_at DATETIME,
            INDEX idx_monitor_id (monitor_id),
            INDEX idx_is_resolved (is_resolved),
            INDEX idx_created_at (created_at),
            FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE alerts');
        $this->addSql('DROP TABLE uptime_summaries');
        $this->addSql('DROP TABLE metrics');
        $this->addSql('DROP TABLE monitors');
    }
}
