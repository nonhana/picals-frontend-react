import type { FC } from 'react'
import { ProgressBar } from 'react-loader-spinner'
import AnimatedDiv from '@/components/motion/animated-div'

interface LoadingProps {
  loading: boolean
  text?: string
}

const Loading: FC<LoadingProps> = ({ loading, text }) => {
  return (
    loading && (
      <AnimatedDiv
        type="opacity-gradient"
        className="absolute left-0 top-0 z-9999 h-full w-full flex items-center justify-center bg-white bg-op-64"
      >
        <div className="flex flex-col items-center gap-10px">
          <ProgressBar visible height="80" width="80" />
          {text && <span>{text}</span>}
        </div>
      </AnimatedDiv>
    )
  )
}

export default Loading
