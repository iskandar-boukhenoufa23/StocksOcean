import { POST } from '@/app/api/stocks/analyze/route'

import { createPostRequest } from '@/tests/helpers/requests'

describe('POST /api/stocks/analyze', () => {
  it('returns analysis results for valid symbols', async () => {
    const response = await POST(
      createPostRequest('http://localhost/api/stocks/analyze', {
        symbols: 'AAPL,MSFT',
      }),
    )

    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(Array.isArray(payload.results)).toBe(true)
    expect(payload.results).toHaveLength(2)
    expect(payload.results[0]).toMatchObject({
      symbol: 'AAPL',
    })
  })

  it('returns 400 when symbols are missing', async () => {
    const response = await POST(
      createPostRequest('http://localhost/api/stocks/analyze', {}),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: 'symbols is required and must be a string',
    })
  })
})
