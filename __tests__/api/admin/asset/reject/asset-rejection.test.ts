import { POST } from '@/app/api/admin/asset/reject/route'
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

describe('POST /api/admin/asset/reject - Asset rejection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminAPI.mockResolvedValue(undefined)
  })

  it('rejects a pending asset successfully', async () => {
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
        'http://localhost/api/admin/asset/reject',
        {
          assetId: 'asset-123',
          reason: 'The asset does not meet quality requirements.',
        },
      ),
    )

    expect(response.status).toBe(200)

    await expect(response.json()).resolves.toEqual({
      success: true,
      message: 'Asset rejected successfully',
      assetId: 'asset-123',
    })
  })

  it('updates the asset status to rejected', async () => {
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
        'http://localhost/api/admin/asset/reject',
        {
          assetId: 'asset-123',
          reason: 'Low quality',
        },
      ),
    )

    expect(assets.update).toHaveBeenCalledWith({
      status: 'rejected',
      rejected_reason: 'Low quality',
      updated_at: expect.any(String),
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
        'http://localhost/api/admin/asset/reject',
        {
          assetId: 'asset-123',
          reason: 'Low quality',
        },
      ),
    )

    expect(assets.updateEq).toHaveBeenCalledWith(
      'id',
      'asset-123',
    )
  })

  it('stores null when no rejection reason is provided', async () => {
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
        'http://localhost/api/admin/asset/reject',
        {
          assetId: 'asset-123',
        },
      ),
    )

    expect(assets.update).toHaveBeenCalledWith({
      status: 'rejected',
      rejected_reason: null,
      updated_at: expect.any(String),
    })
  })

  it('stores null when reason contains only whitespace', async () => {
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
        'http://localhost/api/admin/asset/reject',
        {
          assetId: 'asset-123',
          reason: '    ',
        },
      ),
    )

    expect(assets.update).toHaveBeenCalledWith({
      status: 'rejected',
      rejected_reason: null,
      updated_at: expect.any(String),
    })
  })

  it('trims whitespace from the rejection reason', async () => {
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
        'http://localhost/api/admin/asset/reject',
        {
          assetId: 'asset-123',
          reason: '   Low quality   ',
        },
      ),
    )

    expect(assets.update).toHaveBeenCalledWith({
      status: 'rejected',
      rejected_reason: 'Low quality',
      updated_at: expect.any(String),
    })
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
        'http://localhost/api/admin/asset/reject',
        {
          assetId: 'asset-123',
          reason: 'Low quality',
        },
      ),
    )

    expect(response.status).toBe(500)

    await expect(response.json()).resolves.toMatchObject({
      error: 'Failed to reject asset',
      details: 'Update failed',
    })
  })
})