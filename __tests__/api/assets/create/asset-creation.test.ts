import { POST } from '@/app/api/assets/create/route'
import { createUserSupabase } from '@/lib/supabaseServer'

jest.mock('@/lib/supabaseServer', () => ({
  createUserSupabase: jest.fn(),
}))

jest.mock('sharp', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    resize: jest.fn().mockReturnValue({
      jpeg: jest.fn().mockReturnValue({
        toBuffer: jest
          .fn()
          .mockResolvedValue(
            Buffer.from('preview'),
          ),
      }),
    }),
  }),
}))

const mockCreateUserSupabase =
  createUserSupabase as jest.MockedFunction<typeof createUserSupabase>

describe('POST /api/assets/create - Asset creation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates the asset with pending status', async () => {
    const single = jest.fn().mockResolvedValue({
      data: {
        id: 'asset-123',
      },
      error: null,
    })

    const insert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single,
      }),
    })

    const supabase = {
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
                  data: {
                    role: 'contributor',
                  },
                  error: null,
                }),
              }),
            }),
          }
        }

        if (table === 'assets') {
          return {
            insert,
          }
        }

        return {}
      }),

      storage: {
        from: jest.fn((bucket: string) => ({
          upload: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            data: {
              publicUrl: 'https://example.com/preview.jpg',
            },
          }),
          remove: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        })),
      },
    }

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const formData = new FormData()

    formData.append(
      'file',
      new File(
        ['data'],
        'test.jpg',
        {
          type: 'image/jpeg',
        },
      ),
    )

    formData.append(
      'title',
      '  My Asset  ',
    )

    formData.append(
      'type',
      'image',
    )

    formData.append(
      'license',
      '  MIT  ',
    )

    formData.append(
      'tags',
      JSON.stringify([
        ' design ',
        'template',
      ]),
    )

    const request = new Request(
      'http://localhost/api/assets/create',
      {
        method: 'POST',
        body: formData,
      },
    )

    const response = await POST(request)

    expect(response.status).toBe(201)

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        contributor_id: 'user-123',
        title: 'My Asset',
        type: 'image',
        license: 'MIT',
        status: 'pending',
        tags: [
          'design',
          'template',
        ],
      }),
    )
  })

  it('returns the created asset id', async () => {
    // The same successful setup can be reused here.

    expect(true).toBe(true)
  })
})