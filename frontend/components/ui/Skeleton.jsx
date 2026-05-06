/**
 * Skeleton loading placeholder components.
 *
 * Usage:
 *   <Skeleton className="h-4 w-3/4" />          ← inline text line
 *   <Skeleton.Card />                             ← product card skeleton
 *   <Skeleton.OrderCard />                        ← order card skeleton
 *   <Skeleton.Text lines={3} />                  ← paragraph of text lines
 */
function Skeleton({ className = '' }) {
  return (
    <div className={`skeleton rounded ${className}`} aria-hidden="true" />
  )
}

Skeleton.Text = function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

Skeleton.Card = function SkeletonCard() {
  return (
    <div className="card" aria-hidden="true">
      <Skeleton className="h-40 w-full rounded-xl mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-1" />
      <Skeleton className="h-3 w-1/3 mb-4" />
      <Skeleton className="h-10 w-full rounded-full" />
    </div>
  )
}

Skeleton.OrderCard = function SkeletonOrderCard() {
  return (
    <div className="card" aria-hidden="true">
      <div className="flex justify-between mb-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-1/2 mb-2" />
      <Skeleton className="h-3 w-1/4 mb-4" />
      <Skeleton className="h-9 w-28 rounded-full" />
    </div>
  )
}

Skeleton.Row = function SkeletonRow({ cols = 3 }) {
  return (
    <div className="flex gap-4 py-3 border-b border-border last:border-0" aria-hidden="true">
      {[...Array(cols)].map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  )
}

export default Skeleton

