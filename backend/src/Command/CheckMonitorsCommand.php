<?php

namespace App\Command;

use App\Entity\Monitor;
use App\Repository\MonitorRepository;
use App\Service\HealthCheckerService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:monitor:check',
    description: 'Check all active monitors and record metrics',
)]
class CheckMonitorsCommand extends Command
{
    public function __construct(
        private MonitorRepository $monitors,
        private HealthCheckerService $checker,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $monitors = $this->monitors->findActiveMonitors();

        if (empty($monitors)) {
            $io->warning('No active monitors found.');
            return Command::SUCCESS;
        }

        $io->info(sprintf('Checking %d active monitors...', count($monitors)));

        $progressBar = $io->createProgressBar(count($monitors));
        $progressBar->start();

        $successCount = 0;
        $failureCount = 0;

        foreach ($monitors as $monitor) {
            try {
                $metric = $this->checker->checkMonitor($monitor);

                if ($metric->isSuccess()) {
                    $successCount++;
                } else {
                    $failureCount++;
                }

            } catch (\Throwable $e) {
                $io->error(sprintf('Failed to check monitor %s: %s', $monitor->getName(), $e->getMessage()));
                $failureCount++;
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $io->newLine(2);

        $io->success(sprintf(
            'Monitoring complete: %d successful, %d failed',
            $successCount,
            $failureCount
        ));

        return Command::SUCCESS;
    }
}
