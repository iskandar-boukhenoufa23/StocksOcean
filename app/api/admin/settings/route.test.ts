import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { PUT } from './route'
import { createUserSupabase } from '@/lib/supabaseServer'
import { requireAdminAPI } from '@/lib/admin/auth'

vi.mock('@/lib/supabaseServer', () => ({ createUserSupabase: vi.fn() }))
vi.mock('@/lib/admin/auth', () => ({ requireAdminAPI: vi.fn() }))

describe('PUT /api/admin/settings', () => {
  const mockUpsert = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUpsert.mockResolvedValue({ error: null })
    vi.mocked(requireAdminAPI).mockResolvedValue(undefined as never)
    vi.mocked(createUserSupabase).mockReturnValue({
      from: vi.fn(() => ({ upsert: mockUpsert })),
    } as never)
  })

  it('upserts settings using the singleton id', async () => {
    const response = await PUT(new NextRequest('http://localhost/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_name: 'StocksOcean' }),
    }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ success: true })
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'main', site_name: 'StocksOcean' }),
      { onConflict: 'id' },
    )
  })
})