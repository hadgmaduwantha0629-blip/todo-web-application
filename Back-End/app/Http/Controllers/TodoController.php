<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;


class TodoController extends Controller
{
    // Store a new todo for the authenticated user.
    public function store(Request $request)
    {

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $todo = Todo::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'completed' => false,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Todo created successfully!',
            'todo' => $todo,
        ], 201);
    }

    // Return all todos that belong to the authenticated user.
    public function index(Request $request)
    {

        $todos = $request->user()->todos;

        return response()->json([
            'todos' => $todos
        ]);
    }

    // Update an existing todo after checking ownership.
    public function update(Request $request, Todo $todo)
    {
        
        $this->authorize('update', $todo);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'completed' => 'sometimes|boolean',
        ]);

        $todo->update($validated);

        return response()->json([
            'message' => 'Todo updated successfully!',
            'todo' => $todo,
        ]);
    }

    // Delete a todo after confirming ownership.
    public function destroy(Request $request, Todo $todo)
    {

        $this->authorize('delete', $todo);

        $todo->delete();

        return response()->json([
            'message' => 'Todo deleted successfully!'
        ]);
    }

}
