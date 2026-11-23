import { POST } from '@/app/api/contributor/apply/route'
import { createClient, createUserSupabase } from '@/lib/supabaseServer'

import { createPostRequest } from '@/tests/helpers/requests'

jest.mock('@/lib/supabaseServer', () => ({
  createClient: jest.fn(),
  createUserSupabase: jest.fn(),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockCreateUserSupabase =
  createUserSupabase as jest.MockedFunction<typeof createUserSupabase>

describe('POST /api/contributor/apply', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    mockCreateClient.mockResolvedValue(null)

    const response = await POST(
      createPostRequest('http://localhost/api/contributor/apply', {
        applicationMessage: 'My portfolio',
      }),
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Unauthorized',
    })
  })

  it('updates an existing profile application', async () => {
    mockCreateClient.mockResolvedValue({
      id: 'user-123',
      email: 'alex@example.com',
    } as never)

    const update = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    })

    mockCreateUserSupabase.mockReturnValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: {
                id: 'user-123',
                role: 'user',
                application_date: null,
              },
              error: null,
            }),
          }),
        }),
        update,
      }),
    } as never)

    const response = await POST(
      createPostRequest('http://localhost/api/contributor/apply', {
        applicationMessage: 'My portfolio',
        portfolioUrl: 'https://example.com',
      }),
    )

    expect(response.status).toBe(200)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        application_message: 'My portfolio',
        portfolio_url: 'https://example.com',
      }),
    )
  })
})
