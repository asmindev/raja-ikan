<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $messages = Message::orderBy('message_timestamp', 'desc')
            ->take(100)
            ->get();

        return response()->json(['data' => $messages]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'from_number' => 'required|string',
            'message_text' => 'nullable|string',
            'timestamp' => 'required|date',
            'message_type' => 'required|in:text,image,video,audio,document,sticker,location,contact,other,unknown',
            'raw_data' => 'nullable|array',
        ]);

        $message = Message::create([
            'from_number' => $validated['from_number'],
            'message_text' => $validated['message_text'],
            'message_timestamp' => $validated['timestamp'],
            'message_type' => $validated['message_type'],
            'raw_data' => $validated['raw_data'],
        ]);

        // Broadcast to WebSocket if needed
        // broadcast(new MessageReceived($message));

        return response()->json(['data' => $message], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Message $message)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Message $message)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Message $message)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Message $message)
    {
        //
    }
}
