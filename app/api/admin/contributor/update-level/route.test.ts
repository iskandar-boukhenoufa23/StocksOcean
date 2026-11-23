import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'
import { requireAdminAPI } from '@/lib/admin/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

vi.mock('@/lib/admin/auth', () => ({ requireAdminAPI: vi.fn() }))
vi.mock('@/lib/supabaseAdmin', () => ({ supabaseAdmin: { from: vi.fn() } }))

describe('POST /api/admin/contributor/update-level', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAdminAPI).mockResolvedValue(undefined as never)
  })

  it('rejects levels outside the supported set', async () => {
    const response = await POST(new NextRequest('http://localhost/api/admin/contributor/update-level', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'user-123', level: 'diamond' }),
    }))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Invalid level' })
    expect(supabaseAdmin.from).not.toHaveBeenCalled()
  })
})