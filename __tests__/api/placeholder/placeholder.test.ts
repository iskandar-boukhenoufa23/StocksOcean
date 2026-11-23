import { GET, POST } from '@/app/api/placeholder/route'

import { createPostRequest } from '@/tests/helpers/requests'

describe('GET /api/placeholder', () => {
  it('returns placeholder payload', async () => {
    const response = await GET()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      message: 'This is a placeholder API route',
    })
  })
})

describe('POST /api/placeholder', () => {
  it('returns the posted JSON body', async () => {
    const response = await POST(
      createPostRequest('http://localhost/api/placeholder', {
        hello: 'world',
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      receivedData: {
        hello: 'world',
      },
    })
  })

  it('returns 400 for invalid JSON', async () => {
    const response = await POST(
      new Request('http://localhost/api/placeholder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json',
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Invalid JSON in request body',
    })
  })
})
