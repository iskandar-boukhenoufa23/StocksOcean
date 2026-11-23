import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

vi.mock('@/lib/supabaseServer', () => ({ createUserSupabase: vi.fn() }))
vi.mock('@/lib/supabaseAdmin', () => ({ supabaseAdmin: { storage: { from: vi.fn() } } }))

describe('POST /api/assets/download', () => {
  it('rejects an invalid asset id before accessing services', async () => {
    const response = await POST(new NextRequest('http://localhost/api/assets/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId: 123 }),
    }))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Invalid asset ID' })
  })
})