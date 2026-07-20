<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;


class AuthController extends Controller

{
    // Register a new user and return the created profile.
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
        ]);
    
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'User registered successfully!',
            'user' => $user
        ],201);
    }

    // Authenticate an existing user and issue an API token.
    public function login(Request $request)
    {
        $credetionals = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (! Auth::attempt($credetionals)) {
            return response()->json([
                'message' => 'Invalid email or password.'
            ], 401);
        }

        $user = Auth::user();

        $token = $user->createToken('api-token')->plainTextToken;
        
        return response()->json([
            'message' => 'Login successful!',
            'token' => $token,
            'user' => $user
        ]);
    }

    // Revoke the current token for the authenticated user.
    public function logout(Request $request)
    {
        
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully!'
        ]);

    }
}
