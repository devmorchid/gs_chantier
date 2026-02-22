<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserAuthenticationStatusValidator
{
    /**
     * Validate user credentials and status for login.
     */
    public static function validate(array $credentials): ?User
    {
        $user = User::where('email', $credentials['email'])->first();
        if (!$user) {
            return null;
        }
        // Block login if status is 'désactivé'
        if ($user->status === 'désactivé') {
            return null;
        }
        // Check password
        if (!Hash::check($credentials['password'], $user->password)) {
            return null;
        }
        return $user;
    }
}
