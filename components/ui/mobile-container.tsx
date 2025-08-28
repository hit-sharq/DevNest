
'use client'

import { cn } from "@/lib/utils"
import { useIsMobile } from "./use-mobile"

interface MobileContainerProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function MobileContainer({ 
  children, 
  className, 
  padding = 'md' 
}: MobileContainerProps) {
  const isMobile = useIsMobile()
  
  const paddingClasses = {
    none: '',
    sm: isMobile ? 'px-4 py-2' : 'px-6 py-4',
    md: isMobile ? 'px-4 py-4' : 'px-8 py-6', 
    lg: isMobile ? 'px-6 py-6' : 'px-12 py-8'
  }

  return (
    <div className={cn(
      'w-full max-w-7xl mx-auto',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}
