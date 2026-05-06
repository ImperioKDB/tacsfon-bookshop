/**
 * Loading spinner component.
 *
 * Usage:
 *   <Spinner />                      ← default medium, primary color
 *   <Spinner size="sm" />            ← small
 *   <Spinner size="lg" />            ← large
 *   <Spinner color="white" />        ← for use on dark backgrounds / buttons
 *
 *   // Full-page centered spinner:
 *   <Spinner.Page label="Loading orders..." />
 */
export default function Spinner({ size = 'md', color = 'primary', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
    xl: 'w-16 h-16 border-4',
  }
  const colors = {
    primary: 'border-primary/20 border-t-primary',
    white:   'border-white/30 border-t-white',
    gray:    'border-gray-200 border-t-gray-500',
  }

  return (
    <div
      className={`rounded-full animate-spin ${sizes[size] ?? sizes.md} ${colors[color] ?? colors.primary} ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

Spinner.Page = function SpinnerPage({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-text-secondary">
      <Spinner size="xl" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  )
}

Spinner.Overlay = function SpinnerOverlay({ label }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm gap-4">
      <Spinner size="xl" />
      {label && <p className="text-sm text-text-secondary">{label}</p>}
    </div>
  )
}
