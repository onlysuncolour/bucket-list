const EPrefix = {
  API: '/api',
  API_V1: '/api/v1'
}

export default {
  bucketList: {
    prefix: EPrefix.API,
    path: '/bucket-list',
    getList: {
      method: 'GET',
      path: ''
    },
    createBucketList: {
      method: 'POST',
      path: ''
    },
    updateBucketList: {
      method: 'PUT',
      path: ''
    },
    deleteBucketList: {
      method: 'DELETE',
      path: ''
    }
  },
  user: {
    prefix: EPrefix.API,
    path: '',
    login: {
      path: '/login',
      method: 'POST'
    },
    logout: {
      path: '/logout',
      method: 'POST'
    },
    getAccessToken: {
      path: '/refresh',
      method: 'POST',
    }
  }
}