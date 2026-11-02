export const BASE_URL = 'https://shopboard-api.vercel.app'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function fetchJson<T>(
  path: string,
  decode: (value: unknown) => T,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`)
  if (!response.ok) {
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
    )
  }
  const payload: unknown = await response.json()
  return decode(payload)
}
