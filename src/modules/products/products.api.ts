import { fetchJson } from '../../shared/api/client.ts'
import type { Category, Product } from './products.types.ts'

export interface ApiProduct {
  id: number
  title: string
  category_name: string
  price_cents: number
  in_stock: boolean
}

export interface ApiProductsResponse {
  items: ApiProduct[]
  total: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function decodeProduct(value: unknown): ApiProduct {
  if (!isRecord(value))
    throw new Error('Invalid API product: expected an object.')
  const {
    id,
    title,
    category_name: categoryName,
    price_cents: priceCents,
    in_stock: inStock,
  } = value
  if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0)
    throw new Error('Invalid API product id.')
  if (typeof title !== 'string' || !title.trim())
    throw new Error('Invalid API product title.')
  if (typeof categoryName !== 'string')
    throw new Error('Invalid API product category.')
  if (
    typeof priceCents !== 'number' ||
    !Number.isInteger(priceCents) ||
    priceCents < 0
  )
    throw new Error('Invalid API product price.')
  if (typeof inStock !== 'boolean')
    throw new Error('Invalid API product stock status.')
  return {
    id,
    title,
    category_name: categoryName,
    price_cents: priceCents,
    in_stock: inStock,
  }
}

export function decodeProductsResponse(value: unknown): ApiProductsResponse {
  if (
    !isRecord(value) ||
    !Array.isArray(value.items) ||
    typeof value.total !== 'number' ||
    !Number.isInteger(value.total)
  ) {
    throw new Error('Invalid products API response.')
  }
  return { items: value.items.map(decodeProduct), total: value.total }
}

function toCategory(category: string): Category {
  if (category === 'Bags' || category === 'Shoes' || category === 'Accessories')
    return category
  throw new Error(`Unsupported API product category: ${category}`)
}

export function toProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    name: apiProduct.title,
    category: toCategory(apiProduct.category_name),
    price: apiProduct.price_cents / 100,
    inStock: apiProduct.in_stock,
  }
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetchJson('/api/products', decodeProductsResponse)
  return response.items.map(toProduct)
}
