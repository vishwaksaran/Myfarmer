import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createSupabaseServerClient } from '@/lib/supabase-server';

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
    // Require authentication
    const supabaseServer = await createSupabaseServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) {
        return NextResponse.json(
            { error: 'Please login to use the Crop Assistant.' },
            { status: 401 },
        );
    }

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

    // Models to try in order (fallback if primary hits quota/deprecation limits)
    const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash-lite'];

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Build chat history (exclude the last user message — it goes via sendMessage)
    const history = messages.slice(0, -1).map((m) => ({
        role: m.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: m.content }],
    }));

    let lastError: unknown = null;

    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });

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
            lastError = err;
            const errMsg = err instanceof Error ? err.message : String(err);
            console.error(`[crop-assistant] ${modelName} error:`, errMsg);

            // If it's a quota/rate-limit or model-not-found error, try the next model
            if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('rate') || errMsg.includes('404') || errMsg.includes('no longer available')) {
                console.log(`[crop-assistant] ${modelName} unavailable, trying next model...`);
                continue;
            }

            // For non-quota errors, stop immediately
            break;
        }
    }

    // All models failed
    const errMsg = lastError instanceof Error ? lastError.message : '';
    const isQuota = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('rate');

    console.error('[crop-assistant] All models failed. Last error:', errMsg);

    return NextResponse.json(
        {
            error: isQuota
                ? 'The crop assistant has reached its daily usage limit. Please try again in a few minutes.'
                : 'Sorry, the crop assistant is temporarily unavailable. Please try again.',
        },
        { status: isQuota ? 429 : 500 },
    );
}
