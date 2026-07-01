<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'System Administrator',
            'email' => 'admin@gmail.com',
            'role' => 'admin',
            'password' => Hash::make('12341234'),
        ]);

        User::factory()->create([
            'name' => 'Nahtaniel Vito',
            'email' => 'nathaniel@gmail.com',
            'role' => 'student',
            'password' => Hash::make('12341234'),
        ]);

        User::factory()->create([
            'name' => 'Genda Necio',
            'email' => 'genda@gmail.com',
            'role' => 'faculty',
            'password' => Hash::make('12341234'),
        ]);
    }
}
