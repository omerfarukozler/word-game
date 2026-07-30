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
      {isLoading && <span className="button__spinner" aria-hidden="true" />}
      {isLoading ? loadingLabel : children}
    </button>
  )
}
