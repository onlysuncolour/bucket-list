import {request} from './request' ;
import meta from './meta';
const {
  prefix,
  path,
  chat
} = meta.chat

export function fetchModelChat(body: {
  messages: any[]
  modelType: string
}, cancelToken?: any) {
  return request.request({
    prefix: `${prefix}${path}`,
    path: chat.path,
    method: chat.method,
    payload: body,
    isStream: true,
    cancelToken,
    timeout: 10000000
  })
}