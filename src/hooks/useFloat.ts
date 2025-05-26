import { useEffect, useState } from 'react'
import { FLOAT_DURATION } from '@/utils'

interface Props {
  opacity?: number
  top?: string
  duration?: number
}

export function useFloat({
  opacity: initialOpacity = 0,
  top: initialTop = '1rem',
  duration = FLOAT_DURATION,
}: Props = {}) {
  const [opacity, setOpacity] = useState(initialOpacity)
  const [top, setTop] = useState(initialTop)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(1)
      setTop('0')
    }, duration)
    return () => clearTimeout(timer)
  }, [])

  return [opacity, top] as const
}
