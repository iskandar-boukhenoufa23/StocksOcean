import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

describe('POST /api/stocks/analyze', () => {
  it('rejects a request without stock symbols', async () => {
    const response = await POST(new NextRequest('http://localhost/api/stocks/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'symbols is required and must be a string',
    })
  })

  it('limits each request to ten symbols', async () => {
    const response = await POST(new NextRequest('http://localhost/api/stocks/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols: 'A,B,C,D,E,F,G,H,I,J,K' }),
    }))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Maximum 10 symbols allowed per request',
    })
  })
})