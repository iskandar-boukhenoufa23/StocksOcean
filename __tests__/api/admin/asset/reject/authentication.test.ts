import { POST } from '@/app/api/admin/asset/reject/route'
import { createUserSupabase } from '@/lib/supabaseServer'
import { requireAdminAPI } from '@/lib/admin/auth'

import { createPostRequest } from '@/tests/helpers/requests'

jest.mock('@/lib/supabaseServer', () => ({
  createUserSupabase: jest.fn(),
}))

jest.mock('@/lib/admin/auth', () => ({
  requireAdminAPI: jest.fn(),
}))

const mockCreateUserSupabase =
  createUserSupabase as jest.MockedFunction<typeof createUserSupabase>

const mockRequireAdminAPI =
  requireAdminAPI as jest.MockedFunction<typeof requireAdminAPI>

describe('POST /api/admin/asset/reject - Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockCreateUserSupabase.mockReturnValue({
      from: jest.fn(),
      auth: {
        admin: {
          getUserById: jest.fn(),
        },
      },
    } as never)
  })

  it('returns 500 when admin authentication fails', async () => {
    mockRequireAdminAPI.mockRejectedValue(
      new Error('Unauthorized'),
    )

    const request = createPostRequest(
      'http://localhost/api/admin/asset/reject',
      {
        assetId: 'asset-123',
      },
    )

    const response = await POST(request)

    expect(response.status).toBe(500)

    await expect(response.json()).resolves.toMatchObject({
      error: 'Internal server error',
    })
  })

  it('continues when admin authentication succeeds', async () => {
    mockRequireAdminAPI.mockResolvedValue(undefined)

    const request = createPostRequest(
      'http://localhost/api/admin/asset/reject',
      {},
    )

    const response = await POST(request)

    expect(mockRequireAdminAPI).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(400)
  })
})