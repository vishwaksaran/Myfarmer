import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const SYSTEM_PROMPT = `You are Miraitu Crop Assistant — an expert AI farming advisor for Indian farmers.

Your role:
- Answer crop-related questions: cultivation steps, soil prep, sowing time, irrigation, fertilizers, pest control, harvesting, post-harvest handling.
- Provide do's and don'ts for specific crops.
- Suggest best crop varieties for a given region/climate/soil.
- Give practical, actionable advice suitable for Indian agriculture.
- When relevant, mention government schemes (PM-KISAN, Soil Health Card, KCC) or helpful resources.

Rules:
- Keep answers concise (under 300 words) but informative.
- Use simple language a farmer can understand.
- Format with bullet points or numbered steps when listing instructions.
- If the question is NOT about crops or farming, politely redirect: "I specialize in crop and farming advice. Please ask me about crops, cultivation, or farming practices!"
- Always answer in the same language the user writes in. If they write in Hindi, reply in Hindi. If English, reply in English.
- Do not make up data. If unsure, say so.
- Never provide medical, legal, or financial investment advice.`;

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export async function POST(request: NextRequest) {
    if (!GEMINI_API_KEY) {
        return NextResponse.json(
            { error: 'Crop assistant is not configured. Please set GEMINI_API_KEY.' },
            { status: 503 },
        );
    }

    let body: { messages?: ChatMessage[] };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json({ error: 'Messages array is required.' }, { status: 400 });
    }

    // Validate message content length
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user' || !lastMessage.content?.trim()) {
        return NextResponse.json({ error: 'Last message must be from user.' }, { status: 400 });
    }
    if (lastMessage.content.length > 1000) {
        return NextResponse.json({ error: 'Message too long. Please keep it under 1000 characters.' }, { status: 400 });
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Build chat history (exclude the last user message — it goes via sendMessage)
        const history = messages.slice(0, -1).map((m) => ({
            role: m.role === 'assistant' ? 'model' as const : 'user' as const,
            parts: [{ text: m.content }],
        }));

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: 'System instructions: ' + SYSTEM_PROMPT }] },
                { role: 'model', parts: [{ text: 'Understood. I am Miraitu Crop Assistant. I will follow all the instructions. How can I help you with crops and farming today?' }] },
                ...history,
            ],
        });

        const result = await chat.sendMessage(lastMessage.content);
        const text = result.response.text();

        return NextResponse.json({ reply: text });
    } catch (err) {
        console.error('[crop-assistant] Gemini error:', err);
        return NextResponse.json(
            { error: 'Sorry, the crop assistant is temporarily unavailable. Please try again.' },
            { status: 500 },
        );
    }
}
