import { POST } from '@/app/api/admin/asset/approve/route'
import { createUserSupabase } from '@/lib/supabaseServer'
import { requireAdminAPI } from '@/lib/admin/auth'

import { createPostRequest } from '@/tests/helpers/requests'
import { createSupabaseMock } from '@/tests/helpers/supabase'

jest.mock('@/lib/supabaseServer', () => ({
  createUserSupabase: jest.fn(),
}))

jest.mock('@/lib/admin/auth', () => ({
  requireAdminAPI: jest.fn(),
}))

jest.mock('@/lib/email', () => ({
  sendNotificationEmail: jest.fn(),
}))

const mockCreateUserSupabase =
  createUserSupabase as jest.MockedFunction<typeof createUserSupabase>

const mockRequireAdminAPI =
  requireAdminAPI as jest.MockedFunction<typeof requireAdminAPI>

describe('POST /api/admin/asset/approve - Asset finding', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockRequireAdminAPI.mockResolvedValue(undefined)
  })

  it('returns 404 when the asset does not exist', async () => {
    const { supabase } = createSupabaseMock({
      asset: null,
    })

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const request = createPostRequest(
      'http://localhost/api/admin/asset/approve',
      {
        assetId: 'asset-123',
      },
    )

    const response = await POST(request)

    expect(response.status).toBe(404)

    await expect(response.json()).resolves.toEqual({
      error: 'Asset not found',
    })
  })

  it('returns 404 when fetching the asset returns an error', async () => {
    const { supabase } = createSupabaseMock({
      asset: null,
      fetchError: {
        message: 'Database error',
      },
    })

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const request = createPostRequest(
      'http://localhost/api/admin/asset/approve',
      {
        assetId: 'asset-123',
      },
    )

    const response = await POST(request)

    expect(response.status).toBe(404)

    await expect(response.json()).resolves.toEqual({
      error: 'Asset not found',
    })
  })

  it('queries the asset using the provided assetId', async () => {
    const { supabase, assets } = createSupabaseMock({
      asset: null,
    })

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const request = createPostRequest(
      'http://localhost/api/admin/asset/approve',
      {
        assetId: 'asset-123',
      },
    )

    await POST(request)

    expect(assets.select).toHaveBeenCalledWith('*')
    expect(assets.eq).toHaveBeenCalledWith(
      'id',
      'asset-123',
    )
  })
})