import { POST } from '@/app/api/admin/contributor/update-level/route'
import { requireAdminAPI } from '@/lib/admin/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

import { createPostRequest } from '@/tests/helpers/requests'

jest.mock('@/lib/admin/auth', () => ({
  requireAdminAPI: jest.fn(),
}))

jest.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}))

const mockRequireAdminAPI =
  requireAdminAPI as jest.MockedFunction<typeof requireAdminAPI>

const mockSupabaseAdminFrom = supabaseAdmin.from as jest.Mock

describe('POST /api/admin/contributor/update-level', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminAPI.mockResolvedValue(undefined)
  })

  it('returns 400 when level or id is missing', async () => {
    const response = await POST(
      createPostRequest('http://localhost/api/admin/contributor/update-level', {
        id: 'user-123',
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Contributor ID and level are required',
    })
  })

  it('returns 400 when level is invalid', async () => {
    const response = await POST(
      createPostRequest('http://localhost/api/admin/contributor/update-level', {
        id: 'user-123',
        level: 'diamond',
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Invalid level',
    })
  })

  it('updates contributor level successfully', async () => {
    const profileUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    })

    mockSupabaseAdminFrom.mockReturnValue({
      update: profileUpdate,
    })

    const response = await POST(
      createPostRequest('http://localhost/api/admin/contributor/update-level', {
        id: 'user-123',
        level: 'gold',
      }),
    )

    expect(response.status).toBe(200)
    expect(profileUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        contributor_tier: 'gold',
      }),
    )
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      message: 'Contributor level updated successfully',
    })
  })
})
