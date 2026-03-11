import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

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
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    return NextResponse.json(JSON.parse(content || '{}'));
  } catch (error: any) {
    console.error('API Analyze Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
