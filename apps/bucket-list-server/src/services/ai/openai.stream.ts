import { ReadableStream } from 'stream/web';

export interface OpenAIStreamPayload {
  data: string;
  error?: string;
  modelType?: 'textModel' | 'reasonerModel';
}

export function OpenAIStream(response: Response, modelType: 'textModel' | 'reasonerModel' = 'textModel') {
  const decoder = new TextDecoder();

  // 创建一个 AbortController 来处理客户端断开连接
  const abortController = new AbortController();
  const { signal } = abortController;
  let isClosed = false;
  let isLocked = false;

  return new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        if (!isClosed) {
          controller.close();
          isClosed = true;
        }
        return;
      }

      // 监听客户端断开连接
      signal.addEventListener('abort', async () => {
        console.log('客户端断开连接，清理资源');
        if (isClosed) return;
        
        if (!isLocked) {
          isLocked = true;
          await reader.cancel();
          if (!response.body?.locked) {
            await response.body?.cancel();
          }
        }
        
        if (!isClosed) {
          controller.close();
          isClosed = true;
        }
      });

      try {
        while (true) {
          // 检查是否已经断开连接
          if (signal.aborted || isClosed) {
            return;
          }

          const { done, value } = await reader.read();
          if (done) {
            if (!isLocked) {
              isLocked = true;
              await reader.cancel();
              if (!response.body?.locked) {
                await response.body?.cancel();
              }
            }
            if (!isClosed) {
              controller.close();
              isClosed = true;
            }
            return;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                if (!isLocked) {
                  isLocked = true;
                  await reader.cancel();
                  if (!response.body?.locked) {
                    await response.body?.cancel();
                  }
                }
                if (!isClosed) {
                  controller.close();
                  isClosed = true;
                }
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
                if (!isClosed) {
                  if (!isLocked) {
                    isLocked = true;
                    await reader.cancel();
                    if (!response.body?.locked) {
                      await response.body?.cancel();
                    }
                  }
                  controller.error(error);
                  isClosed = true;
                }
                return;
              }
            }
          }
        }
      } catch (error) {
        console.error('处理流数据失败:', error);
        if (!isClosed) {
          if (!isLocked) {
            isLocked = true;
            await reader.cancel();
            if (!response.body?.locked) {
              await response.body?.cancel();
            }
          }
          controller.error(error);
          isClosed = true;
        }
      }
    },
    cancel() {
      // 当流被取消时触发中止控制器
      abortController.abort();
    }
  });
}