import { POST } from '@/app/api/assets/download/route'
import { createUserSupabase } from '@/lib/supabaseServer'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

import { createPostRequest } from '@/tests/helpers/requests'

jest.mock('@/lib/supabaseServer', () => ({
  createUserSupabase: jest.fn(),
}))

jest.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    storage: {
      from: jest.fn(),
    },
  },
}))

const mockCreateUserSupabase =
  createUserSupabase as jest.MockedFunction<typeof createUserSupabase>

const mockSupabaseAdminStorageFrom =
  supabaseAdmin.storage.from as jest.Mock

describe('POST /api/assets/download', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns a signed download url for an approved asset', async () => {
    const supabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
        }),
      },
      from: jest.fn((table: string) => {
        if (table === 'subscriptions') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: {
                      id: 'sub-123',
                      downloads_used: 2,
                      downloads_limit: 10,
                      price: 5,
                      subscription_plans: { monthly_downloads: 10 },
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }

        if (table === 'assets') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: {
                      id: 'asset-123',
                      storage_path: 'private_assets/test.pdf',
                      status: 'approved',
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }

        return {}
      }),
      rpc: jest.fn().mockResolvedValue({ error: null }),
    }

    mockCreateUserSupabase.mockReturnValue(supabase as never)

    mockSupabaseAdminStorageFrom.mockReturnValue({
      createSignedUrl: jest.fn().mockResolvedValue({
        data: { signedUrl: 'https://example.com/file.pdf' },
        error: null,
      }),
    })

    const response = await POST(
      createPostRequest('http://localhost/api/assets/download', {
        assetId: 'asset-123',
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      url: 'https://example.com/file.pdf',
    })
  })

  it('returns 400 when asset id is invalid', async () => {
    const response = await POST(
      createPostRequest('http://localhost/api/assets/download', {
        assetId: '',
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Invalid asset ID',
    })
  })
})
