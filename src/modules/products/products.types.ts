export type Category = 'Bags' | 'Shoes' | 'Accessories'

export interface Product {
  id: number
  name: string
  price: number
  category: Category
  inStock: boolean
}

export interface ProductView {
  search: string
  category: Category | 'all'
  under30: boolean
  sortDirection: 'asc' | 'desc' | null
}

export type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; products: Product[] }
