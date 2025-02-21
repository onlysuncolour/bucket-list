import { fetchModelChat } from "@/request/chat.request";
import axios from "axios";

type TModelType = 'textModel' | 'reasonerModel';

const charactorPrompt = {
  role: 'user',
  content: `你是一个日程规划大师以及任务梳理大师，你需要帮我规划梳理我要做的接下来的事情，要按照步骤给我，可以更细粒度的给我。只需要给我返回JSON格式的数据，不要其他任何内容。\n` +
  `请记住，要切实可行的步骤，有明确的完成目标，以及每个步骤的描述不要太长，也不要太短。\n` +
  `JSON格式是 {steps: [{title: "", steps: [{title: "", steps: []}]}]}`
}
const modelType: TModelType = 'textModel';

export function handleChat(
  topics: string[],
  cb: (
    data: {
      content?: string;
      done?: boolean;
      reason?: string
    }
  ) => void
) {
  const source = axios.CancelToken.source();
  let loading = true;
  let content = ''

  try {
    const request = fetchModelChat({
      messages: [charactorPrompt, {
        role: 'user',
        content: topics[0]
      }],
      modelType,
    }, source.token)


    request.then(response => {
      const reader = response.data.getReader();
      const decoder = new TextDecoder();

      function readStream() {
        reader.read().then(({ done, value }: { done: boolean, value: AllowSharedBufferSource }) => {
          if (done) {
            cb({ done: true })
            console.log('流式读取完成');
            return;
          }

          if (!loading) {
            try {
              reader.cancel();
              source.cancel()
            } catch (error) {
              console.log('取消请求时发生错误:', error);
            } finally {
              // setLoading(false);
            }
            return;
          }

          // 处理数据块
          const textChunk = decoder.decode(value);
          content += textChunk;
          cb({ content })
          // setTempText(prevValue => prevValue + textChunk)
          // console.log('收到数据:', textChunk);

          // 继续读取
          readStream();
        }).catch((err: any) => {
          if (err.name === 'AbortError') {
            console.log('用户主动取消');
          } else {
            console.error('读取错误:', err);
          }

          // 重要！必须取消流读取器
          return reader.cancel();
        });
      }

      readStream();
    }).catch(err => {
      console.log('request err', err)
    })

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // console.log(123)
    // setLoading(false);
  }
  return (loadingFlag: boolean) => {
    loading = loadingFlag;
  }
}