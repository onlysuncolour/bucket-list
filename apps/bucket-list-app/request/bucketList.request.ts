import {request} from './request' ;
import meta from './meta';
const {
  prefix,
  path,
  getList,
  createBucketList,
  updateBucketList,
  deleteBucketList,
} = meta.bucketList

export function fetchBucetList() {
  return request.request({
    path: `${prefix}${path}${getList.path}`,
    method: getList.method,
  })
}