import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean
  loadingLabel: string
  children: ReactNode
}

export function LoadingButton({
  isLoading,
  loadingLabel,
  children,
  disabled,
  ...buttonProps
}: LoadingButtonProps) {
  return (
    <button {...buttonProps} disabled={disabled || isLoading} aria-busy={isLoading}>
      {isLoading ? loadingLabel : children}
    </button>
  )
}
