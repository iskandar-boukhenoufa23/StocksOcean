import { NextRequest } from 'next/server'

export function createPostRequest(
  url: string,
  body: unknown,
): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

export function createGetRequest(
  url: string,
): NextRequest {
  return new NextRequest(url, {
    method: 'GET',
  })
}

export function createPutRequest(
  url: string,
  body: unknown,
): NextRequest {
  return new NextRequest(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

export function createDeleteRequest(
  url: string,
): NextRequest {
  return new NextRequest(url, {
    method: 'DELETE',
  })
}

export function createInvalidJsonPostRequest(
  url: string,
): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: '{ invalid json',
  })
}