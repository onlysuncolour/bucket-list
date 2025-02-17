import {request} from './request' ;
import meta from './meta';
const {
  prefix,
  path,
  login,
  logout,
  getAccessToken,
} = meta.user

export function fetchUserLogin(body: {
  deviceUuid?: string
  email?: string
  code?: string
}) {
  return request.request({
    prefix: `${prefix}${path}`,
    path: login.path,
    method: login.method,
    payload: body,
    noAccessToken: true
  })
}

export function fetchUserLogout() {
  return request.request({
    prefix: `${prefix}${path}`,
    path: logout.path,
    method: logout.method,
  })
}

export function fetchUserAccessToken(refreshToken: string) {
  return request.request({
    prefix: `${prefix}${path}`,
    path: getAccessToken.path,
    method: getAccessToken.method,
    payload: {
      refreshToken
    },
  })
}