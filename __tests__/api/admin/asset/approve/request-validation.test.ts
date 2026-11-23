import { POST } from '@/app/api/admin/asset/approve/route'
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

describe('POST /api/admin/asset/approve - Request validation', () => {
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
      'http://localhost/api/admin/asset/approve',
    )

    const response = await POST(request)

    expect(response.status).toBe(400)

    await expect(response.json()).resolves.toEqual({
      error: 'Invalid JSON in request body',
    })
  })

  it('returns 400 when assetId is missing', async () => {
    const request = createPostRequest(
      'http://localhost/api/admin/asset/approve',
      {},
    )

    const response = await POST(request)

    expect(response.status).toBe(400)

    await expect(response.json()).resolves.toEqual({
      error: 'assetId is required and must be a string',
    })
  })

  it('returns 400 when assetId is undefined', async () => {
    const request = createPostRequest(
      'http://localhost/api/admin/asset/approve',
      {
        assetId: undefined,
      },
    )

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('returns 400 when assetId is null', async () => {
    const request = createPostRequest(
      'http://localhost/api/admin/asset/approve',
      {
        assetId: null,
      },
    )

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('returns 400 when assetId is a number', async () => {
    const request = createPostRequest(
      'http://localhost/api/admin/asset/approve',
      {
        assetId: 123,
      },
    )

    const response = await POST(request)

    expect(response.status).toBe(400)

    await expect(response.json()).resolves.toEqual({
      error: 'assetId is required and must be a string',
    })
  })

  it('returns 400 when assetId is an object', async () => {
    const request = createPostRequest(
      'http://localhost/api/admin/asset/approve',
      {
        assetId: {},
      },
    )

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('returns 400 when assetId is an array', async () => {
    const request = createPostRequest(
      'http://localhost/api/admin/asset/approve',
      {
        assetId: [],
      },
    )

    const response = await POST(request)

    expect(response.status).toBe(400)
  })
})