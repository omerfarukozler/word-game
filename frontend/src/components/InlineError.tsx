export function InlineError({ id, message }: { id?: string; message: string | null }) {
  if (!message) {
    return null
  }

  return (
    <p className="inline-error" id={id} role="alert" aria-live="polite">
      {message}
    </p>
  )
}
