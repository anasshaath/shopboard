import type { LoadState, Product } from './products.types.ts'

interface ProductsLoaderCallbacks {
  onStateChange(loadState: LoadState): void
  onError(message: string): void
}

export interface ProductsLoader {
  load(): Promise<void>
}

export function createProductsLoader(
  requestProducts: () => Promise<Product[]>,
  callbacks: ProductsLoaderCallbacks,
): ProductsLoader {
  let activeRequest: Promise<void> | undefined
  let requestVersion = 0

  function load(): Promise<void> {
    if (activeRequest) return activeRequest
    const version = ++requestVersion
    callbacks.onStateChange({ status: 'loading' })
    const request = requestProducts()
      .then((products) => {
        if (version !== requestVersion) return
        callbacks.onStateChange({ status: 'success', products })
      })
      .catch(() => {
        if (version !== requestVersion) return
        const message = 'We could not load the collection. Please try again.'
        callbacks.onStateChange({ status: 'error', message })
        callbacks.onError(message)
      })
    activeRequest = request
    void request.then(() => {
      if (activeRequest === request) activeRequest = undefined
    })
    return request
  }

  return { load }
}
