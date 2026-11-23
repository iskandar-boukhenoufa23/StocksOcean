import { PUT } from '@/app/api/admin/settings/route'
import { requireAdminAPI } from '@/lib/admin/auth'
import { createUserSupabase } from '@/lib/supabaseServer'

import { createPutRequest } from '@/tests/helpers/requests'

jest.mock('@/lib/admin/auth', () => ({
  requireAdminAPI: jest.fn(),
}))

jest.mock('@/lib/supabaseServer', () => ({
  createUserSupabase: jest.fn(),
}))

const mockRequireAdminAPI =
  requireAdminAPI as jest.MockedFunction<typeof requireAdminAPI>

const mockCreateUserSupabase =
  createUserSupabase as jest.MockedFunction<typeof createUserSupabase>

describe('PUT /api/admin/settings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminAPI.mockResolvedValue(undefined)
  })

  it('updates admin settings successfully', async () => {
    const upsert = jest.fn().mockResolvedValue({ error: null })

    mockCreateUserSupabase.mockReturnValue({
      from: jest.fn().mockReturnValue({
        upsert,
      }),
    } as never)

    const response = await PUT(
      createPutRequest('http://localhost/api/admin/settings', {
        site_name: 'Stocks Ocean',
      }),
    )

    expect(response.status).toBe(200)
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'main',
        site_name: 'Stocks Ocean',
      }),
      { onConflict: 'id' },
    )
  })
})
