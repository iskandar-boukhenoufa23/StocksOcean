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

describe('POST /api/admin/asset/approve - Asset approval', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockRequireAdminAPI.mockResolvedValue(undefined)
  })

  it('approves a pending asset successfully', async () => {
    const { supabase } = createSupabaseMock({
      asset: {
        id: 'asset-123',
        title: 'Test Asset',
        contributor_id: 'user-123',
        status: 'pending',
      },
    })

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const response = await POST(
      createPostRequest(
        'http://localhost/api/admin/asset/approve',
        {
          assetId: 'asset-123',
        },
      ),
    )

    expect(response.status).toBe(200)

    await expect(response.json()).resolves.toEqual({
      success: true,
      message: 'Asset approved successfully',
      assetId: 'asset-123',
    })
  })

  it('updates the asset status to approved', async () => {
    const { supabase, assets } = createSupabaseMock({
      asset: {
        id: 'asset-123',
        title: 'Test Asset',
        contributor_id: 'user-123',
        status: 'pending',
      },
    })

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    await POST(
      createPostRequest(
        'http://localhost/api/admin/asset/approve',
        {
          assetId: 'asset-123',
        },
      ),
    )

    expect(assets.update).toHaveBeenCalledWith({
      status: 'approved',
      updated_at: expect.any(String),
      rejected_reason: null,
    })
  })

  it('updates only the requested asset', async () => {
    const { supabase, assets } = createSupabaseMock({
      asset: {
        id: 'asset-123',
        title: 'Test Asset',
        contributor_id: 'user-123',
        status: 'pending',
      },
    })

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    await POST(
      createPostRequest(
        'http://localhost/api/admin/asset/approve',
        {
          assetId: 'asset-123',
        },
      ),
    )

    expect(assets.updateEq).toHaveBeenCalledWith(
      'id',
      'asset-123',
    )
  })

  it('clears the previous rejection reason', async () => {
    const { supabase, assets } = createSupabaseMock({
      asset: {
        id: 'asset-123',
        title: 'Test Asset',
        contributor_id: 'user-123',
        status: 'pending',
      },
    })

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    await POST(
      createPostRequest(
        'http://localhost/api/admin/asset/approve',
        {
          assetId: 'asset-123',
        },
      ),
    )

    expect(assets.update).toHaveBeenCalledWith(
      expect.objectContaining({
        rejected_reason: null,
      }),
    )
  })

  it('returns 500 when the update fails', async () => {
    const { supabase } = createSupabaseMock({
      asset: {
        id: 'asset-123',
        title: 'Test Asset',
        contributor_id: 'user-123',
        status: 'pending',
      },
      updateError: {
        message: 'Update failed',
      },
    })

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const response = await POST(
      createPostRequest(
        'http://localhost/api/admin/asset/approve',
        {
          assetId: 'asset-123',
        },
      ),
    )

    expect(response.status).toBe(500)

    await expect(response.json()).resolves.toMatchObject({
      error: 'Failed to approve asset',
      details: 'Update failed',
    })
  })
})