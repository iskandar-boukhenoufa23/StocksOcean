import { POST } from '@/app/api/admin/contributor/reject/route'
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

describe('POST /api/admin/contributor/reject', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminAPI.mockResolvedValue(undefined)
  })

  it('returns 401 when admin authentication fails', async () => {
    mockRequireAdminAPI.mockRejectedValue(new Error('Unauthorized'))

    const response = await POST(
      createPostRequest('http://localhost/api/admin/contributor/reject', {
        id: 'user-123',
      }),
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Unauthorized',
    })
  })

  it('rejects a contributor application and stores notification', async () => {
    const profileUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    })

    mockSupabaseAdminFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: {
                  id: 'user-123',
                  role: 'user',
                  application_date: '2024-01-01T00:00:00.000Z',
                },
                error: null,
              }),
            }),
          }),
          update: profileUpdate,
        }
      }

      if (table === 'notifications') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        }
      }

      return {}
    })

    const response = await POST(
      createPostRequest('http://localhost/api/admin/contributor/reject', {
        id: 'user-123',
        reason: 'Incomplete portfolio',
      }),
    )

    expect(response.status).toBe(200)
    expect(profileUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'user',
        contributor_tier: null,
      }),
    )
    expect(mockSupabaseAdminFrom).toHaveBeenCalledWith('notifications')
  })
})
