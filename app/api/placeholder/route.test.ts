import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from './route'

describe('GET /api/placeholder', () => {
  it('returns the placeholder response with a timestamp', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('This is a placeholder API route')
    expect(Number.isNaN(Date.parse(data.timestamp))).toBe(false)
  })
})

describe('POST /api/placeholder', () => {
  it('returns the submitted JSON body', async () => {
    const response = await POST(new NextRequest('http://localhost/api/placeholder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hello: 'world' }),
    }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      message: 'POST request received',
      receivedData: { hello: 'world' },
    })
  })
})