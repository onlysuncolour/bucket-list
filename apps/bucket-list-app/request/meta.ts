const EPrefix = {
  API: '/api',
  API_V1: '/api/v1'
}

export default {
  bucketList: {
    prefix: EPrefix.API,
    path: '/bucket-list',
    getAllBucketList: {
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
    },
    getBucketListById: {
      method: 'GET',
      path: '/{id}',
    },
    completeBucketList: {
      method: 'PUT',
      path: '/{id}/complete'
    },
    uncompleteBucketList: {
      method: 'PUT',
      path: '/{id}/uncomplete'
    }
  },
  steps: {
    prefix: EPrefix.API,
    path: '/bucket-list/{bId}/steps',
    createSteps: {
      method: 'POST',
      path: ''
    },
    updateSteps: {
      method: 'PUT',
      path: ''
    },
    removeSteps: {
      method: 'PUT',
      path: ''
    },
    completeStep: {
      method: 'PUT',
      path: '/complete'
    },
    uncompleteStep: {
      method: 'PUT',
      path: '/uncomplete'
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