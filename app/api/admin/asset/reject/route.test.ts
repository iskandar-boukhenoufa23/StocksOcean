import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'
import { createUserSupabase } from '@/lib/supabaseServer'
import { requireAdminAPI } from '@/lib/admin/auth'

vi.mock('@/lib/supabaseServer', () => ({ createUserSupabase: vi.fn() }))
vi.mock('@/lib/admin/auth', () => ({ requireAdminAPI: vi.fn() }))

describe('POST /api/admin/asset/reject', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAdminAPI).mockResolvedValue(undefined as never)
    vi.mocked(createUserSupabase).mockReturnValue({ from: vi.fn() } as never)
  })

  it('rejects a request without an assetId', async () => {
    const response = await POST(new NextRequest('http://localhost/api/admin/asset/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'assetId is required and must be a string',
    })
  })
})