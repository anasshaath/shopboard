import type { LoadState, Product } from './products.types.ts'

export type ProductsRenderModel =
  | { status: 'loading' }
  | { status: 'error'; message: string; retryLabel: 'Try again' }
  | { status: 'empty' }
  | { status: 'no-matches' }
  | { status: 'products'; products: Product[] }

export function getProductsRenderModel(
  loadState: LoadState,
  visibleProducts: Product[],
): ProductsRenderModel {
  if (loadState.status === 'loading') return { status: 'loading' }
  if (loadState.status === 'error') {
    return {
      status: 'error',
      message: loadState.message,
      retryLabel: 'Try again',
    }
  }
  if (loadState.products.length === 0) return { status: 'empty' }
  if (visibleProducts.length === 0) return { status: 'no-matches' }
  return { status: 'products', products: visibleProducts }
}
