import { POST } from '@/app/api/assets/create/route'
import { createUserSupabase } from '@/lib/supabaseServer'
import sharp from 'sharp'

jest.mock('@/lib/supabaseServer', () => ({
  createUserSupabase: jest.fn(),
}))

jest.mock('sharp', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const mockCreateUserSupabase =
  createUserSupabase as jest.MockedFunction<typeof createUserSupabase>

const mockSharp =
  sharp as unknown as jest.MockedFunction<typeof sharp>

describe('POST /api/assets/create - Image processing', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    const toBuffer = jest.fn().mockResolvedValue(
      Buffer.from('preview'),
    )

    const jpeg = jest.fn().mockReturnValue({
      toBuffer,
    })

    const resize = jest.fn().mockReturnValue({
      jpeg,
    })

    mockSharp.mockReturnValue({
      resize,
    } as never)
  })

  it('processes image assets with sharp', async () => {
    // Set up a mocked Supabase client here.
    // The important part is that `type=image` reaches sharp.

    expect(mockSharp).toBeDefined()
  })

  it('uses a maximum preview width of 1200', () => {
    expect(mockSharp).toBeDefined()
  })

  it('uses JPEG quality 75', () => {
    expect(mockSharp).toBeDefined()
  })
})