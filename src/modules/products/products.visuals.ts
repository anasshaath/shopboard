export type ProductVisual =
  | { kind: 'css'; color: string; markup: string }
  | { kind: 'svg'; color: string; asset: string }

const placeholderVisual: ProductVisual = {
  kind: 'svg',
  color: 'sage',
  asset: '/product-art/placeholder.svg',
}

const productVisuals: Record<number, ProductVisual> = {
  1: {
    kind: 'css',
    color: 'butter',
    markup: '<div class="tote"><span>take<br>it easy.</span></div>',
  },
  2: {
    kind: 'svg',
    color: 'peach',
    asset: '/product-art/canvas-backpack.svg',
  },
  3: {
    kind: 'css',
    color: 'plum',
    markup: '<div class="crossbody"><i></i><b></b></div>',
  },
  4: {
    kind: 'css',
    color: 'sky',
    markup: '<div class="sneaker"><i></i><b></b></div>',
  },
  5: {
    kind: 'css',
    color: 'olive',
    markup: '<div class="runner"><i></i><b></b></div>',
  },
  6: {
    kind: 'css',
    color: 'oat',
    markup: '<div class="loafer"><i></i></div>',
  },
  7: { kind: 'svg', color: 'blue', asset: '/product-art/wool-scarf.svg' },
  8: { kind: 'svg', color: 'stone', asset: '/product-art/silver-watch.svg' },
  9: { kind: 'svg', color: 'lavender', asset: '/product-art/sunglasses.svg' },
  10: { kind: 'svg', color: 'coral', asset: '/product-art/travel-duffel.svg' },
  11: { kind: 'svg', color: 'sage', asset: '/product-art/rain-boots.svg' },
  12: { kind: 'svg', color: 'butter', asset: '/product-art/leather-belt.svg' },
}

export function getProductVisual(productId: number): ProductVisual {
  return productVisuals[productId] ?? placeholderVisual
}
