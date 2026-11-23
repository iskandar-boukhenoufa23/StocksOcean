import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

vi.mock('@/lib/supabaseClient', () => ({ supabase: { from: vi.fn() } }))

describe('GET /api/test-connection', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('reports missing Supabase environment variables', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: 'Missing environment variables',
      details: { hasUrl: false, hasKey: false },
    })
  })
})