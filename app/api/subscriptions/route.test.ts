import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'
import { createClient } from '@/lib/supabaseServer'

vi.mock('@/lib/supabaseServer', () => ({
  createClient: vi.fn(),
  createUserSupabase: vi.fn(),
}))

describe('POST /api/plans', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue(null as never)
  })

  it('requires a signed-in user', async () => {
    const response = await POST(new NextRequest('http://localhost/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: 'plan-123', billing: 'monthly' }),
    }))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
  })
})