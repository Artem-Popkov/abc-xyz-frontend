import { useEffect, useState } from 'react'

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

// «Набегающее» число: плавно растёт от 0 до target за duration мс.
// Если в системе включено «уменьшить движение», сразу показывает итог.
export function useCountUp(target, duration = 1200) {
  const [reduced] = useState(prefersReducedMotion)
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (reduced) return undefined
    let frame
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setValue(target * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, reduced])

  return reduced ? target : value
}
