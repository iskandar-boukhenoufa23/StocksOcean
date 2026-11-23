import { POST } from '@/app/api/admin/asset/approve/route'
import { createUserSupabase } from '@/lib/supabaseServer'
import { requireAdminAPI } from '@/lib/admin/auth'
import { sendNotificationEmail } from '@/lib/email'

import { createPostRequest } from '@/tests/helpers/requests'
import { createSupabaseMock } from '@/tests/helpers/supabase'

jest.mock('@/lib/supabaseServer', () => ({
  createUserSupabase: jest.fn(),
}))

jest.mock('@/lib/admin/auth', () => ({
  requireAdminAPI: jest.fn(),
}))

jest.mock('@/lib/email', () => ({
  sendNotificationEmail: jest.fn(),
}))

const mockCreateUserSupabase =
  createUserSupabase as jest.MockedFunction<typeof createUserSupabase>

const mockRequireAdminAPI =
  requireAdminAPI as jest.MockedFunction<typeof requireAdminAPI>

const mockSendNotificationEmail =
  sendNotificationEmail as jest.MockedFunction<
    typeof sendNotificationEmail
  >

describe('POST /api/admin/asset/approve - Email', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockRequireAdminAPI.mockResolvedValue(undefined)
    mockSendNotificationEmail.mockResolvedValue(undefined)
  })

  it('sends an approval email to the contributor', async () => {
    const { supabase } = createSupabaseMock({
      asset: {
        id: 'asset-123',
        title: 'Test Asset',
        contributor_id: 'user-123',
        status: 'pending',
      },
      profile: {
        id: 'user-123',
        username: 'john',
      },
      userEmail: 'john@example.com',
    })

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const response = await POST(
      createPostRequest(
        'http://localhost/api/admin/asset/approve',
        {
          assetId: 'asset-123',
        },
      ),
    )

    expect(response.status).toBe(200)

    expect(
      mockSendNotificationEmail,
    ).toHaveBeenCalledWith({
      to: 'john@example.com',
      subject: 'Your Asset Has Been Approved',
      template: 'asset-approved',
      data: {
        assetTitle: 'Test Asset',
        assetId: 'asset-123',
        contributorName: 'john',
      },
    })
  })

  it('uses Contributor when profile username is missing', async () => {
    const { supabase } = createSupabaseMock({
      asset: {
        id: 'asset-123',
        title: 'Test Asset',
        contributor_id: 'user-123',
        status: 'pending',
      },
      profile: {
        id: 'user-123',
        username: null,
      },
      userEmail: 'john@example.com',
    })

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    await POST(
      createPostRequest(
        'http://localhost/api/admin/asset/approve',
        {
          assetId: 'asset-123',
        },
      ),
    )

    expect(
      mockSendNotificationEmail,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contributorName: 'Contributor',
        }),
      }),
    )
  })

  it('does not send an email when the contributor has no email', async () => {
    const { supabase } = createSupabaseMock({
      asset: {
        id: 'asset-123',
        title: 'Test Asset',
        contributor_id: 'user-123',
        status: 'pending',
      },
      profile: {
        id: 'user-123',
        username: 'john',
      },
      userEmail: null,
    })

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const response = await POST(
      createPostRequest(
        'http://localhost/api/admin/asset/approve',
        {
          assetId: 'asset-123',
        },
      ),
    )

    expect(response.status).toBe(200)

    expect(
      mockSendNotificationEmail,
    ).not.toHaveBeenCalled()
  })

  it('does not send an email when there is no contributor', async () => {
    const { supabase } = createSupabaseMock({
      asset: {
        id: 'asset-123',
        title: 'Test Asset',
        contributor_id: null,
        status: 'pending',
      },
    })

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const response = await POST(
      createPostRequest(
        'http://localhost/api/admin/asset/approve',
        {
          assetId: 'asset-123',
        },
      ),
    )

    expect(response.status).toBe(200)

    expect(
      mockSendNotificationEmail,
    ).not.toHaveBeenCalled()
  })

  it('still returns 200 when email sending fails', async () => {
    const { supabase } = createSupabaseMock({
      asset: {
        id: 'asset-123',
        title: 'Test Asset',
        contributor_id: 'user-123',
        status: 'pending',
      },
      profile: {
        id: 'user-123',
        username: 'john',
      },
      userEmail: 'john@example.com',
    })

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    mockSendNotificationEmail.mockRejectedValue(
      new Error('Email service failed'),
    )

    const response = await POST(
      createPostRequest(
        'http://localhost/api/admin/asset/approve',
        {
          assetId: 'asset-123',
        },
      ),
    )

    expect(response.status).toBe(200)

    await expect(response.json()).resolves.toMatchObject({
      success: true,
    })
  })
})