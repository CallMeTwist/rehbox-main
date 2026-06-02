<?php

namespace App\Console\Commands;

use Database\Seeders\ExerciseSeeder;
use Illuminate\Console\Command;

class ApplyExerciseRom extends Command
{
    protected $signature = 'exercises:apply-rom {--all : Overwrite existing correct_angles instead of only filling empty ones}';

    protected $description = 'Backfill standard ROM correct_angles onto existing exercises (non-destructive)';

    public function handle(ExerciseSeeder $seeder): int
    {
        $result = $seeder->backfillCorrectAngles(onlyEmpty: ! $this->option('all'));

        $this->info("Applied ROM tracking rules to {$result['updated']} of {$result['total']} exercises.");

        return self::SUCCESS;
    }
}
