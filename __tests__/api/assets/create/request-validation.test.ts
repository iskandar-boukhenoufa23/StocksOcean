import { POST } from '@/app/api/assets/create/route'
import { createUserSupabase } from '@/lib/supabaseServer'

jest.mock('@/lib/supabaseServer', () => ({
  createUserSupabase: jest.fn(),
}))

jest.mock('sharp', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const mockCreateUserSupabase =
  createUserSupabase as jest.MockedFunction<typeof createUserSupabase>

function createValidSupabase() {
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
        return {}
      }

      return {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({ data: null, error: null }),
          remove: jest.fn().mockResolvedValue({ data: null, error: null }),
          getPublicUrl: jest.fn().mockReturnValue({
            data: { publicUrl: 'https://example.com/preview.jpg' },
          }),
        }),
      }
    }),

    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: null, error: null }),
        remove: jest.fn().mockResolvedValue({ data: null, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/preview.jpg' },
        }),
      }),
    },
  }
}

function createFormRequest(
  values: Record<string, string>,
  file?: File,
) {
  const formData = new FormData()

  if (file) {
    formData.append('file', file)
  }

  for (const [key, value] of Object.entries(values)) {
    formData.append(key, value)
  }

  return new Request(
    'http://localhost/api/assets/create',
    {
      method: 'POST',
      body: formData,
    },
  )
}

function createValidFile() {
  return new File(
    ['fake-image-data'],
    'image.jpg',
    {
      type: 'image/jpeg',
    },
  )
}

describe('POST /api/assets/create - Request validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockCreateUserSupabase.mockReturnValue(
      createValidSupabase() as never,
    )
  })

  it('returns 400 when file is missing', async () => {
    const request = createFormRequest({
      title: 'Test Asset',
      type: 'image',
      license: 'MIT',
    })

    const response = await POST(request)

    expect(response.status).toBe(400)

    await expect(response.json()).resolves.toEqual({
      error: 'File is required',
    })
  })

  it('returns 400 when file is empty', async () => {
    const emptyFile = new File(
      [],
      'empty.jpg',
      {
        type: 'image/jpeg',
      },
    )

    const request = createFormRequest(
      {
        title: 'Test Asset',
        type: 'image',
        license: 'MIT',
      },
      emptyFile,
    )

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('returns 400 when title is missing', async () => {
    const request = createFormRequest(
      {
        type: 'image',
        license: 'MIT',
      },
      createValidFile(),
    )

    const response = await POST(request)

    expect(response.status).toBe(400)

    await expect(response.json()).resolves.toEqual({
      error: 'Title must be a non-empty string',
    })
  })

  it('returns 400 when title is whitespace', async () => {
    const request = createFormRequest(
      {
        title: '   ',
        type: 'image',
        license: 'MIT',
      },
      createValidFile(),
    )

    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('returns 400 for an invalid asset type', async () => {
    const request = createFormRequest(
      {
        title: 'Test Asset',
        type: 'pdf',
        license: 'MIT',
      },
      createValidFile(),
    )

    const response = await POST(request)

    expect(response.status).toBe(400)

    await expect(response.json()).resolves.toEqual({
      error: 'Invalid asset type',
    })
  })

  it('returns 400 when license is missing', async () => {
    const request = createFormRequest(
      {
        title: 'Test Asset',
        type: 'image',
      },
      createValidFile(),
    )

    const response = await POST(request)

    expect(response.status).toBe(400)

    await expect(response.json()).resolves.toEqual({
      error: 'License is required',
    })
  })

  it('returns 400 when tags are invalid JSON', async () => {
    const request = createFormRequest(
      {
        title: 'Test Asset',
        type: 'image',
        license: 'MIT',
        tags: 'not-json',
      },
      createValidFile(),
    )

    const response = await POST(request)

    expect(response.status).toBe(400)

    await expect(response.json()).resolves.toEqual({
      error: 'Invalid tags format',
    })
  })

  it('returns 400 when tags are not an array of strings', async () => {
    const request = createFormRequest(
      {
        title: 'Test Asset',
        type: 'image',
        license: 'MIT',
        tags: JSON.stringify([
          'design',
          123,
        ]),
      },
      createValidFile(),
    )

    const response = await POST(request)

    expect(response.status).toBe(400)

    await expect(response.json()).resolves.toEqual({
      error: 'Tags must be an array of strings',
    })
  })

  it('accepts an empty tags value', async () => {
    const request = createFormRequest(
      {
        title: 'Test Asset',
        type: 'image',
        license: 'MIT',
        tags: '',
      },
      createValidFile(),
    )

    const response = await POST(request)

    expect(response.status).not.toBe(400)
  })
})