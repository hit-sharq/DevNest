
'use client'

import { cn } from "@/lib/utils"

interface MobileSafeAreaProps {
  children: React.ReactNode
  className?: string
  top?: boolean
  bottom?: boolean
  left?: boolean
  right?: boolean
}

export function MobileSafeArea({ 
  children, 
  className,
  top = true,
  bottom = true,
  left = true,
  right = true
}: MobileSafeAreaProps) {
  return (
    <div className={cn(
      'w-full h-full',
      top && 'pt-safe-top',
      bottom && 'pb-safe-bottom',
      left && 'pl-safe-left',
      right && 'pr-safe-right',
      className
    )}>
      {children}
    </div>
  )
}
