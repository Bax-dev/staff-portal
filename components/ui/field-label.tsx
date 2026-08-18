export function FieldLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span>
      {children}
      {required ? (
        <span className="ml-0.5 text-destructive" aria-hidden="true">
          *
        </span>
      ) : null}
    </span>
  )
}
