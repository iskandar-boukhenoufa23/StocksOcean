import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { DELETE, PUT } from './route'
import { createUserSupabase } from '@/lib/supabaseServer'
import { requireAdminAPI } from '@/lib/admin/auth'

vi.mock('@/lib/supabaseServer', () => ({ createUserSupabase: vi.fn() }))
vi.mock('@/lib/admin/auth', () => ({ requireAdminAPI: vi.fn() }))

describe('/api/admin/assets/[id]', () => {
  const mockEq = vi.fn()
  const mockMaybeSingle = vi.fn()
  const mockFrom = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockEq.mockResolvedValue({ error: null })
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
    mockFrom.mockImplementation(() => ({
      update: () => ({ eq: mockEq }),
      select: () => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }),
      delete: () => ({ eq: mockEq }),
    }))
    vi.mocked(requireAdminAPI).mockResolvedValue(undefined as never)
    vi.mocked(createUserSupabase).mockReturnValue({ from: mockFrom } as never)
  })

  it('updates the asset identified by the route parameter', async () => {
    const response = await PUT(new NextRequest('http://localhost/api/admin/assets/asset-123', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated asset' }),
    }), { params: { id: 'asset-123' } })

    expect(response.status).toBe(200)
    expect(mockEq).toHaveBeenCalledWith('id', 'asset-123')
  })

  it('deletes the asset identified by the route parameter', async () => {
    const response = await DELETE(new NextRequest('http://localhost/api/admin/assets/asset-123', {
      method: 'DELETE',
    }), { params: { id: 'asset-123' } })

    expect(response.status).toBe(200)
    expect(mockEq).toHaveBeenCalledWith('id', 'asset-123')
  })
})