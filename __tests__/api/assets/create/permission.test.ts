import { POST } from '@/app/api/assets/create/route'
import { createUserSupabase } from '@/lib/supabaseServer'

import { createPostRequest } from '@/tests/helpers/requests'

jest.mock('@/lib/supabaseServer', () => ({
  createUserSupabase: jest.fn(),
}))

const mockCreateUserSupabase =
  createUserSupabase as jest.MockedFunction<typeof createUserSupabase>

function createSupabaseWithProfile(
  role: string | null,
  profileError: unknown = null,
) {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
          },
        },
      }),
    },

    from: jest.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: role
                  ? {
                      role,
                    }
                  : null,
                error: profileError,
              }),
            }),
          }),
        }
      }

      return {}
    }),
  }
}

describe('POST /api/assets/create - Permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 500 when profile lookup fails', async () => {
    const supabase = createSupabaseWithProfile(
      null,
      {
        message: 'Database error',
      },
    )

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const response = await POST(
      createPostRequest(
        'http://localhost/api/assets/create',
        {},
      ),
    )

    expect(response.status).toBe(500)

    await expect(response.json()).resolves.toEqual({
      error: 'Could not verify contributor permissions',
    })
  })

  it('returns 403 when profile does not exist', async () => {
    const supabase = createSupabaseWithProfile(null)

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const response = await POST(
      createPostRequest(
        'http://localhost/api/assets/create',
        {},
      ),
    )

    expect(response.status).toBe(403)
  })

  it('returns 403 for a regular user', async () => {
    const supabase = createSupabaseWithProfile('user')

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const response = await POST(
      createPostRequest(
        'http://localhost/api/assets/create',
        {},
      ),
    )

    expect(response.status).toBe(403)

    await expect(response.json()).resolves.toEqual({
      error:
        'Forbidden. Only approved contributors can upload assets.',
    })
  })

  it('allows contributors', async () => {
    const supabase = createSupabaseWithProfile(
      'contributor',
    )

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const response = await POST(
      createPostRequest(
        'http://localhost/api/assets/create',
        {},
      ),
    )

    expect(response.status).not.toBe(403)
  })

  it('allows admins', async () => {
    const supabase = createSupabaseWithProfile(
      'admin',
    )

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const response = await POST(
      createPostRequest(
        'http://localhost/api/assets/create',
        {},
      ),
    )

    expect(response.status).not.toBe(403)
  })
})