import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'
import { createUserSupabase } from '@/lib/supabaseServer'

vi.mock('@/lib/supabaseServer', () => ({ createUserSupabase: vi.fn() }))

describe('POST /api/assets/create', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createUserSupabase).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never)
  })

  it('requires an authenticated user before accepting an upload', async () => {
    const response = await POST(new NextRequest('http://localhost/api/assets/create', {
      method: 'POST',
    }))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      error: 'Unauthorized. Please log in to upload assets.',
    })
  })
})