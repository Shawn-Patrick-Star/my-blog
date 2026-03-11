import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Use nodejs runtime for better compatibility with openai sdk

export async function POST(req: NextRequest) {
  try {
    const { messages, settings } = await req.json();

    const apiKey = settings.apiMode === 'custom' ? settings.apiKey : process.env.NEXT_PUBLIC_AI_API_KEY;
    const baseUrl = settings.apiMode === 'custom' ? settings.baseUrl : (process.env.NEXT_PUBLIC_AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/');
    const modelName = settings.apiMode === 'custom' ? settings.modelName : (process.env.NEXT_PUBLIC_AI_MODEL_NAME || 'gemini-1.5-flash');

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is missing' }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: baseUrl,
    });

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: messages,
      temperature: settings.temperature || 0.7,
      stream: true,
      // If we're using monitor, we might want to respect response_format but for speaker we want text
    });

    // Create a ReadableStream to stream the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
      },
    });

    return new Response(stream);
  } catch (error: any) {
    console.error('API Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
