import { POST } from '@/app/api/subscriptions/route'
import { createClient, createUserSupabase } from '@/lib/supabaseServer'

import { createPostRequest } from '@/tests/helpers/requests'

jest.mock('@/lib/supabaseServer', () => ({
  createClient: jest.fn(),
  createUserSupabase: jest.fn(),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockCreateUserSupabase =
  createUserSupabase as jest.MockedFunction<typeof createUserSupabase>

describe('POST /api/plans', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a subscription for a valid plan request', async () => {
    mockCreateClient.mockResolvedValue({
      id: 'user-123',
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    } as never)

    const subscriptionInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'sub-123',
            user_id: 'user-123',
            plan_id: 'plan-123',
          },
          error: null,
        }),
      }),
    })

    const planSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'plan-123',
            monthly_downloads: 25,
            original_price_monthly: 14,
            original_price_yearly: 140,
            first_month_discount_percent: 10,
          },
          error: null,
        }),
      }),
    })

    mockCreateUserSupabase.mockReturnValue({
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn((table: string) => {
        if (table === 'subscription_plans') {
          return {
            select: planSelect,
          }
        }

        if (table === 'subscriptions') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({
                    data: null,
                    error: null,
                  }),
                }),
              }),
            }),
            insert: subscriptionInsert,
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          }
        }

        return {}
      }),
      rpc: jest.fn(),
    } as never)

    const response = await POST(
      createPostRequest('http://localhost/api/plans', {
        plan_id: 'plan-123',
        billing: 'monthly',
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      message: 'Subscription created',
    })
  })

  it('returns 400 for invalid body data', async () => {
    mockCreateClient.mockResolvedValue({
      id: 'user-123',
      created_at: new Date().toISOString(),
    } as never)

    const response = await POST(
      createPostRequest('http://localhost/api/plans', {
        plan_id: '',
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Invalid data',
    })
  })
})
