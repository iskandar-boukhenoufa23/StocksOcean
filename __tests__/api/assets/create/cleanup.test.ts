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

describe('POST /api/assets/create - Cleanup', () => {
  it('removes the uploaded files when database insert fails', async () => {
    const privateRemove = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    })

    const previewRemove = jest.fn().mockResolvedValue({
      data: null,
      error: null,
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
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: {
                    message: 'Insert failed',
                  },
                }),
              }),
            }),
          }
        }

        return {}
      }),

      storage: {
        from: jest.fn((bucket: string) => {
          if (bucket === 'private_assets') {
            return {
              upload: jest.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
              remove: privateRemove,
            }
          }

          return {
            upload: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
            remove: previewRemove,
            getPublicUrl: jest.fn().mockReturnValue({
              data: {
                publicUrl:
                  'https://example.com/preview.jpg',
              },
            }),
          }
        }),
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
      'Test Asset',
    )

    formData.append(
      'type',
      'image',
    )

    formData.append(
      'license',
      'MIT',
    )

    const request = new Request(
      'http://localhost/api/assets/create',
      {
        method: 'POST',
        body: formData,
      },
    )

    const response = await POST(request)

    expect(response.status).toBe(500)

    expect(privateRemove).toHaveBeenCalledWith([
      expect.stringContaining(
        'contributors/user-123/',
      ),
    ])

    expect(previewRemove).toHaveBeenCalledWith([
      expect.stringContaining(
        'contributors/user-123/previews/',
      ),
    ])
  })
})