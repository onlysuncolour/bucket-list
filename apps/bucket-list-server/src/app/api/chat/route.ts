import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/services/ai/chat.service';
// import { getUuid } from '@/utils/uuid';
import { getUserIdFromRequest } from '@/utils';

export async function POST(request: NextRequest) {
  // const requestId = getUuid();
  const userId = getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ code: 401, message: '未授权' });
  }

  try {
    const body = await request.json();
    const { messages, temperature, modelType } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ code: 400, message: '无效的消息格式' });
    }

    const stream = await ChatService.streamChatCompletion({
      messages,
      temperature,
      modelType
    });

    return new Response(stream as unknown as BodyInit, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('聊天请求失败:', error);
    return NextResponse.json({
      code: 500,
      message: '聊天请求处理失败'
    });
  }
}