import { PUT } from '@/app/api/admin/plans/[id]/route'
import { requireAdminAPI } from '@/lib/admin/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

import { createPutRequest } from '@/tests/helpers/requests'

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

describe('PUT /api/admin/plans/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminAPI.mockResolvedValue(undefined)
  })

  it('updates a subscription plan', async () => {
    const planUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    })

    mockSupabaseAdminFrom.mockReturnValue({
      update: planUpdate,
    })

    const response = await PUT(
      createPutRequest('http://localhost/api/admin/plans/plan-123', {
        name: 'Starter Pro',
      }),
      { params: { id: 'plan-123' } },
    )

    expect(response.status).toBe(200)
    expect(planUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Starter Pro',
      }),
    )
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      message: 'Plan updated successfully',
    })
  })
})
