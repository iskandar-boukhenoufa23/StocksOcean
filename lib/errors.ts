export function getErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred',
): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

export function getErrorStatus(error: unknown, fallback = 500): number {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status?: unknown }).status
    if (typeof status === 'number' && status >= 400 && status <= 599) return status
  }
  return fallback
}
