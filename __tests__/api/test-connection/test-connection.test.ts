import { GET } from '@/app/api/test-connection/route'
import { supabase } from '@/lib/supabaseClient'

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getSession: jest.fn(),
    },
  },
}))

const mockSupabase = supabase as typeof supabase

describe('GET /api/test-connection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
  })

  it('returns success when the database and auth are reachable', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        data: [{ id: 'asset-1' }],
        error: null,
      }),
    })

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-123' } } },
      error: null,
    })

    const response = await GET()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      message: 'Supabase connection successful!',
    })
  })

  it('returns 500 when the environment variables are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: 'Missing environment variables',
    })
  })
})
