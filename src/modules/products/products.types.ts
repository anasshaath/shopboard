export type Category =
  | 'Work & Create'
  | 'Slow Moments'
  | 'At Home'
  | 'Bags'
  | 'Daily Rituals'
  | 'Green Spaces'
  | 'Shoes'

export interface Product {
  id: number
  name: string
  price: number
  category: Category
  description: string
}

export interface ProductView {
  search: string
  category: Category | 'all'
  under30: boolean
  sortDirection: 'asc' | 'desc' | null
}
