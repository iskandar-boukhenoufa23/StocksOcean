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

describe('POST /api/admin/asset/reject - Asset status', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminAPI.mockResolvedValue(undefined)
  })

  it('returns 400 when asset is already approved', async () => {
    const { supabase } = createSupabaseMock({
      asset: {
        id: 'asset-123',
        title: 'Test Asset',
        contributor_id: 'user-123',
        status: 'approved',
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
        },
      ),
    )

    expect(response.status).toBe(400)

    await expect(response.json()).resolves.toEqual({
      error:
        'Asset is not pending. Current status: approved',
    })
  })

  it('returns 400 when asset is already rejected', async () => {
    const { supabase } = createSupabaseMock({
      asset: {
        id: 'asset-123',
        title: 'Test Asset',
        contributor_id: 'user-123',
        status: 'rejected',
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
        },
      ),
    )

    expect(response.status).toBe(400)

    await expect(response.json()).resolves.toEqual({
      error:
        'Asset is not pending. Current status: rejected',
    })
  })

  it('returns 400 when asset is draft', async () => {
    const { supabase } = createSupabaseMock({
      asset: {
        id: 'asset-123',
        title: 'Test Asset',
        contributor_id: 'user-123',
        status: 'draft',
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
        },
      ),
    )

    expect(response.status).toBe(400)

    await expect(response.json()).resolves.toEqual({
      error:
        'Asset is not pending. Current status: draft',
    })
  })

  it('does not update an asset that is not pending', async () => {
    const { supabase, assets } = createSupabaseMock({
      asset: {
        id: 'asset-123',
        title: 'Test Asset',
        contributor_id: 'user-123',
        status: 'approved',
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

    expect(assets.update).not.toHaveBeenCalled()
  })
})