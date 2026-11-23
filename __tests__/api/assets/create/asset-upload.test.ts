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
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('preview')),
      }),
    }),
  }),
}))

const mockCreateUserSupabase =
  createUserSupabase as jest.MockedFunction<typeof createUserSupabase>

function createMockSupabase() {
  const upload = jest.fn().mockResolvedValue({
    data: {
      path: 'contributors/user-123/file.jpg',
    },
    error: null,
  })

  const storageFrom = jest.fn((bucket: string) => {
    if (
      bucket === 'private_assets'
    ) {
      return {
        upload,
        remove: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }
    }

    return {
      upload: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
      remove: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: {
          publicUrl: 'https://example.com/preview.jpg',
        },
      }),
    }
  })

  return {
    supabase: {
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
                  data: {
                    id: 'asset-123',
                  },
                  error: null,
                }),
              }),
            }),
          }
        }

        return {}
      }),

      storage: {
        from: storageFrom,
      },
    },

    upload,
    storageFrom,
  }
}

function createRequest() {
  const formData = new FormData()

  formData.append(
    'file',
    new File(
      ['fake-data'],
      'my image.jpg',
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

  return new Request(
    'http://localhost/api/assets/create',
    {
      method: 'POST',
      body: formData,
    },
  )
}

describe('POST /api/assets/create - Asset upload', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uploads the original file to private_assets', async () => {
    const {
      supabase,
      upload,
    } = createMockSupabase()

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const response = await POST(
      createRequest(),
    )

    expect(upload).toHaveBeenCalledWith(
      expect.stringMatching(
        /^contributors\/user-123\/\d+-my_image\.jpg$/,
      ),
      expect.any(Buffer),
      expect.objectContaining({
        contentType: 'image/jpeg',
        upsert: false,
      }),
    )

    expect(response.status).toBe(201)
  })

  it('sanitizes the uploaded filename', async () => {
    const {
      supabase,
      upload,
    } = createMockSupabase()

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const response = await POST(
      createRequest(),
    )

    expect(upload).toHaveBeenCalledWith(
      expect.stringMatching(
        /my_image\.jpg$/,
      ),
      expect.any(Buffer),
      expect.any(Object),
    )

    expect(response.status).toBe(201)
  })

  it('returns 500 when the original upload fails', async () => {
    const {
      supabase,
      upload,
    } = createMockSupabase()

    upload.mockResolvedValueOnce({
      data: null,
      error: {
        message: 'Upload failed',
      },
    })

    mockCreateUserSupabase.mockReturnValue(
      supabase as never,
    )

    const response = await POST(
      createRequest(),
    )

    expect(response.status).toBe(500)

    await expect(response.json()).resolves.toEqual({
      error: 'Failed to upload asset',
    })
  })
})