import { ReadableStream } from 'stream/web';

export interface OpenAIStreamPayload {
  data: string;
  error?: string;
  modelType?: 'textModel' | 'reasonerModel';
}

export function OpenAIStream(response: Response, modelType: 'textModel' | 'reasonerModel' = 'textModel') {
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                controller.close();
                return;
              }

              try {
                const json = JSON.parse(data);
                const delta = json.choices?.[0]?.delta;
                
                if (modelType === 'reasonerModel') {
                  const reasoningText = delta?.reasoning_content || '';
                  const contentText = delta?.content || '';
                  
                  if (reasoningText) {
                    controller.enqueue(new TextEncoder().encode(reasoningText));
                  }
                  if (contentText) {
                    controller.enqueue(new TextEncoder().encode(contentText));
                  }
                } else {
                  const text = delta?.content || '';
                  if (text) {
                    controller.enqueue(new TextEncoder().encode(text));
                  }
                }
              } catch (error) {
                console.error('解析 SSE 消息失败:', error);
                controller.error(error);
              }
            }
          }
        }
      } catch (error) {
        console.error('处理流数据失败:', error);
        controller.error(error);
      }
    }
  });
}