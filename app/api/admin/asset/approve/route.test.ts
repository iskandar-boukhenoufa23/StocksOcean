
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'
import { createUserSupabase } from '@/lib/supabaseServer'
import { requireAdminAPI } from '@/lib/admin/auth'
import { sendNotificationEmail } from '@/lib/email'

// Mock external dependencies
vi.mock('@/lib/supabaseServer', () => ({
  createUserSupabase: vi.fn(),
}))

vi.mock('@/lib/admin/auth', () => ({
  requireAdminAPI: vi.fn(),
}))

vi.mock('@/lib/email', () => ({
  sendNotificationEmail: vi.fn(),
}))

const mockAsset = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Beautiful Nature',
  contributor_id: 'user-123',
  status: 'pending',
}

const mockProfile = {
  id: 'user-123',
  username: 'John',
}

describe('POST /api/admin/asset/approve', () => {
  const mockMaybeSingle = vi.fn()
  const mockEq = vi.fn()
  const mockSelect = vi.fn()
  const mockUpdate = vi.fn()
  const mockInsert = vi.fn()
  const mockFrom = vi.fn()
  const mockGetUserById = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(requireAdminAPI).mockResolvedValue(
      undefined as never
    )

    mockMaybeSingle
      .mockResolvedValueOnce({
        data: mockAsset,
        error: null,
      })
      .mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      })

    mockEq.mockImplementation(() => ({
      maybeSingle: mockMaybeSingle,
      then: (resolve: (value: unknown) => unknown) =>
        Promise.resolve({ error: null }).then(resolve),
    }))

    mockSelect.mockReturnValue({
      eq: mockEq,
    })

    mockUpdate.mockReturnValue({
      eq: mockEq,
    })

    mockInsert.mockResolvedValue({
      error: null,
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'notifications') {
        return { insert: mockInsert }
      }

      return {
        select: mockSelect,
        update: mockUpdate,
      }
    })

    mockGetUserById.mockResolvedValue({
      data: {
        user: {
          email: 'john@example.com',
        },
      },
      error: null,
    })

    vi.mocked(createUserSupabase).mockReturnValue({
      from: mockFrom,
      auth: {
        admin: {
          getUserById: mockGetUserById,
        },
      },
    } as unknown as ReturnType<typeof createUserSupabase>)

    vi.mocked(sendNotificationEmail).mockResolvedValue(
      undefined as never
    )
  })

  function createRequest(body: unknown) {
    return new NextRequest(
      'http://localhost:3000/api/admin/asset/approve',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )
  }

  it('should approve a pending asset successfully', async () => {
    const request = createRequest({
      assetId: mockAsset.id,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Asset approved successfully')
    expect(data.assetId).toBe(mockAsset.id)

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'approved',
        rejected_reason: null,
      })
    )
  })

  it('should reject invalid JSON', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/admin/asset/approve',
      {
        method: 'POST',
        body: '{invalid-json',
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid JSON in request body')
  })

  it('should reject missing assetId', async () => {
    const response = await POST(createRequest({}))
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe(
      'assetId is required and must be a string'
    )
  })

  it('should reject invalid assetId type', async () => {
    const response = await POST(
      createRequest({ assetId: 123 })
    )

    expect(response.status).toBe(400)
  })

  it('should return 404 if asset does not exist', async () => {
    mockMaybeSingle.mockReset()
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    })

    const response = await POST(
      createRequest({ assetId: 'missing-id' })
    )

    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Asset not found')
  })

  it('should reject an already approved asset', async () => {
    mockMaybeSingle.mockReset()
    mockMaybeSingle
      .mockResolvedValueOnce({
        data: {
          ...mockAsset,
          status: 'approved',
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      })

    const response = await POST(
      createRequest({ assetId: mockAsset.id })
    )

    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Asset is not pending')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('should return 500 when database update fails', async () => {
    mockEq.mockImplementation(() => ({
      maybeSingle: mockMaybeSingle,
      then: (resolve: (value: unknown) => unknown) =>
        Promise.resolve({
          error: { message: 'Database error' },
        }).then(resolve),
    }))

    const response = await POST(
      createRequest({ assetId: mockAsset.id })
    )

    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to approve asset')
  })

  it('should create a contributor notification', async () => {
    const response = await POST(
      createRequest({ assetId: mockAsset.id })
    )

    expect(response.status).toBe(200)

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: mockAsset.contributor_id,
      type: 'asset_approved',
      title: 'Asset Approved! ✅',
      message: expect.stringContaining(mockAsset.title),
      link: `/asset/${mockAsset.id}`,
    })
  })

  it('should send approval email to contributor', async () => {
    const response = await POST(
      createRequest({ assetId: mockAsset.id })
    )

    expect(response.status).toBe(200)

    expect(sendNotificationEmail).toHaveBeenCalledWith({
      to: 'john@example.com',
      subject: 'Your Asset Has Been Approved',
      template: 'asset-approved',
      data: {
        assetTitle: mockAsset.title,
        assetId: mockAsset.id,
        contributorName: 'John',
      },
    })
  })

  it('should still succeed when sending email fails', async () => {
    vi.mocked(sendNotificationEmail).mockRejectedValueOnce(
      new Error('Email service unavailable')
    )

    const response = await POST(
      createRequest({ assetId: mockAsset.id })
    )

    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should return 500 on unexpected authentication errors', async () => {
    vi.mocked(requireAdminAPI).mockRejectedValueOnce(
      new Error('Unauthorized')
    )

    const response = await POST(
      createRequest({ assetId: mockAsset.id })
    )

    expect(response.status).toBe(500)
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
