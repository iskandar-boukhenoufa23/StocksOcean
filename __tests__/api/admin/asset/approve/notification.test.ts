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
  sendNotificationEmail: jest.fn().mockResolvedValue(undefined),
}))

const mockCreateUserSupabase =
  createUserSupabase as jest.MockedFunction<typeof createUserSupabase>

const mockRequireAdminAPI =
  requireAdminAPI as jest.MockedFunction<typeof requireAdminAPI>

describe('POST /api/admin/asset/approve - Notification', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockRequireAdminAPI.mockResolvedValue(undefined)
  })

  it('creates a notification for the contributor', async () => {
    const { supabase, notifications } = createSupabaseMock({
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

    expect(
      notifications.insert,
    ).toHaveBeenCalledWith({
      user_id: 'user-123',
      type: 'asset_approved',
      title: 'Asset Approved! ✅',
      message:
        'Your asset "Test Asset" has been approved and is now live on the marketplace.',
      link: '/asset/asset-123',
    })
  })

  it('does not create a notification when there is no contributor', async () => {
    const { supabase, notifications } =
      createSupabaseMock({
        asset: {
          id: 'asset-123',
          title: 'Test Asset',
          contributor_id: null,
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

    expect(
      notifications.insert,
    ).not.toHaveBeenCalled()
  })

  it('still returns 200 when notification creation throws', async () => {
    const { supabase, notifications } =
      createSupabaseMock({
        asset: {
          id: 'asset-123',
          title: 'Test Asset',
          contributor_id: 'user-123',
          status: 'pending',
        },
      })

    notifications.insert.mockRejectedValue(
      new Error('Notification failed'),
    )

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

    await expect(response.json()).resolves.toMatchObject({
      success: true,
    })
  })
})