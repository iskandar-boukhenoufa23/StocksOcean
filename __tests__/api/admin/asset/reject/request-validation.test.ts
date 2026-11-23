import { POST } from '@/app/api/admin/asset/reject/route'
import { createUserSupabase } from '@/lib/supabaseServer'
import { requireAdminAPI } from '@/lib/admin/auth'

import {
  createPostRequest,
  createInvalidJsonPostRequest,
} from '@/tests/helpers/requests'

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

describe('POST /api/admin/asset/reject - Request validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockRequireAdminAPI.mockResolvedValue(undefined)

    mockCreateUserSupabase.mockReturnValue({
      from: jest.fn(),
      auth: {
        admin: {
          getUserById: jest.fn(),
        },
      },
    } as never)
  })

  it('returns 400 when JSON is invalid', async () => {
    const request = createInvalidJsonPostRequest(
      'http://localhost/api/admin/asset/reject',
    )

    const response = await POST(request)

    expect(response.status).toBe(400)

    await expect(response.json()).resolves.toEqual({
      error: 'Invalid JSON in request body',
    })
  })

  it('returns 400 when assetId is missing', async () => {
    const request = createPostRequest(
      'http://localhost/api/admin/asset/reject',
      {},
    )

    const response = await POST(request)

    expect(response.status).toBe(400)

    await expect(response.json()).resolves.toEqual({
      error: 'assetId is required and must be a string',
    })
  })

  it('returns 400 when assetId is null', async () => {
    const request = createPostRequest(
      'http://localhost/api/admin/asset/reject',
      {
        assetId: null,
      },
    )

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('returns 400 when assetId is a number', async () => {
    const request = createPostRequest(
      'http://localhost/api/admin/asset/reject',
      {
        assetId: 123,
      },
    )

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('accepts a request without a rejection reason', async () => {
    const request = createPostRequest(
      'http://localhost/api/admin/asset/reject',
      {
        assetId: 'asset-123',
      },
    )

    // The route will continue to Supabase after validation.
    // We only verify that validation itself does not reject the request.
    const response = await POST(request)

    expect(response.status).not.toBe(400)
  })

  it('accepts a request with a rejection reason', async () => {
    const request = createPostRequest(
      'http://localhost/api/admin/asset/reject',
      {
        assetId: 'asset-123',
        reason: 'The asset does not meet quality requirements.',
      },
    )

    const response = await POST(request)

    expect(response.status).not.toBe(400)
  })
})