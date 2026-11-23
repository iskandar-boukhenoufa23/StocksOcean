import { jest } from '@jest/globals'

export function createAuthMocks() {
  const requireAdminAPI = jest.fn()

  return {
    requireAdminAPI,

    mockAdminSuccess() {
      requireAdminAPI.mockResolvedValue(undefined)
    },

    mockAdminFailure(error: unknown = new Error('Unauthorized')) {
      requireAdminAPI.mockRejectedValue(error)
    },
  }
}