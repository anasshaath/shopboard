import type { Product } from '../products/products.types.ts'

export interface CartItem {
  id: number
  quantity: number
}

export type Cart = CartItem[]

export interface CartDetail extends CartItem {
  product: Product
}
