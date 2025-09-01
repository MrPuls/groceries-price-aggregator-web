export type Debounced<T extends (...args: any[]) => void> = ((...args: Parameters<T>) => void) & {
  cancel: () => void
}

export function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300): Debounced<T> {
  let timer: ReturnType<typeof setTimeout> | null = null
  const wrapped = ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, wait)
  }) as Debounced<T>

  wrapped.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return wrapped
}
