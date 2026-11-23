import { POST } from '@/app/api/assets/create/route'
import { createUserSupabase } from '@/lib/supabaseServer'

import { createPostRequest } from '@/tests/helpers/requests'

jest.mock('@/lib/supabaseServer', () => ({
  createUserSupabase: jest.fn(),
}))

const mockCreateUserSupabase =
  createUserSupabase as jest.MockedFunction<typeof createUserSupabase>

function createUnauthorizedSupabaseMock() {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: null,
        },
      }),
    },
  }
}

describe('POST /api/assets/create - Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when the user is not authenticated', async () => {
    const supabase = createUnauthorizedSupabaseMock()

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const request = createPostRequest(
      'http://localhost/api/assets/create',
      {},
    )

    const response = await POST(request)

    expect(response.status).toBe(401)

    await expect(response.json()).resolves.toEqual({
      error: 'Unauthorized. Please log in to upload assets.',
    })
  })

  it('calls Supabase authentication check', async () => {
    const getUser = jest.fn().mockResolvedValue({
      data: {
        user: null,
      },
    })

    const supabase = {
      auth: {
        getUser,
      },
    }

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    await POST(
      createPostRequest(
        'http://localhost/api/assets/create',
        {},
      ),
    )

    expect(getUser).toHaveBeenCalledTimes(1)
  })
})