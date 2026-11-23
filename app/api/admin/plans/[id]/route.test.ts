import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { PUT } from './route'
import { requireAdminAPI } from '@/lib/admin/auth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

vi.mock('@/lib/admin/auth', () => ({ requireAdminAPI: vi.fn() }))
vi.mock('@/lib/supabaseAdmin', () => ({ supabaseAdmin: { from: vi.fn() } }))

describe('PUT /api/admin/plans/[id]', () => {
  const mockEq = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockEq.mockResolvedValue({ error: null })
    vi.mocked(requireAdminAPI).mockResolvedValue(undefined as never)
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      update: () => ({ eq: mockEq }),
    } as never)
  })

  it('updates the requested plan', async () => {
    const response = await PUT(new NextRequest('http://localhost/api/admin/plans/plan-123', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Pro' }),
    }), { params: { id: 'plan-123' } })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ success: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'plan-123')
  })
})