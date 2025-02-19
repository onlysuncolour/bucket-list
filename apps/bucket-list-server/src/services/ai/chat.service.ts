import { OpenAIStream } from './openai.stream';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type ModelType = 'textModel' | 'reasonerModel';

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  model?: string;
  modelType?: ModelType;
}

export class ChatService {
  // TODO: 需要 OpenAI API 的具体接口类型定义
  static async streamChatCompletion(options: ChatCompletionOptions) {
    const { messages, temperature = 0.7, modelType = 'textModel' } = options;
    const modelKey = modelType === 'textModel' ? process.env.CHAT_MODEL_NAME : process.env.REASONER_MODEL_NAME;
    try {
      const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MODEL_KEY}`
        },
        body: JSON.stringify({
          messages,
          temperature,
          model: modelKey,
          stream: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`火山引擎 API 调用失败: ${error.message || response.statusText}`);
      }

      // 确保响应是 SSE 格式
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('text/event-stream')) {
        throw new Error('响应格式不是 SSE');
      }

      return OpenAIStream(response, options.modelType);
    } catch (error) {
      console.error('流式聊天请求失败:', error);
      throw error;
    }
  }
}