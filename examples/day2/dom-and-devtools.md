# Day 2 DOM and DevTools exercises

## Slides 20-21: Console DOM practice

Run `npm run dev`, open ShopBoard, then use Chrome DevTools Console:

```js
document.querySelector('h1').textContent = 'Hello, ShopBoard'
document.querySelector('.product').classList.add('big')
document
  .querySelector('#cart-toggle')
  .addEventListener('click', () => console.log('clicked'))
```

Refresh afterwards and explain that these console-only DOM changes disappear because they were not saved in project source code or localStorage.

## Slide 42: Breakpoint and variable inspection

1. Open Chrome DevTools > Sources and open `src/logic.js` through the Vite source map.
2. Set a breakpoint on the `reduce` line in `getTotal`.
3. Add a product to the cart in ShopBoard.
4. When execution pauses, inspect `items`, the current `item`, and `total` in Scope or by hovering.
5. Step over once and explain how the accumulator changes.

This is a manual Chrome DevTools exercise. It is not covered by Node tests.

## Slides 43-45: Debug Lab boundary

The PDF specifies two runtime, two logic, and two state bugs, but does not include their code. Use the supplied `day2-kit/debug-lab` materials if available, log only bugs actually observed, and record: what was seen, bug type, how it was found, cause, fix, test evidence, and whether AI helped.
