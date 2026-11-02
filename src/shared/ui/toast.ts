export type ToastType = 'success' | 'error' | 'info'

type ToastRenderer = (message: string, type: ToastType) => void

let toastRenderer: ToastRenderer | undefined

export function setToastRenderer(renderer: ToastRenderer): void {
  toastRenderer = renderer
}

export function showToast(message: string, type: ToastType): void {
  toastRenderer?.(message, type)
}
