import Link from 'next/link'

/**
 * Empty state component for pages with no data.
 *
 * Usage:
 *   <EmptyState
 *     emoji="🛒"
 *     title="Your cart is empty"
 *     description="Add some items to get started."
 *     action={{ label: 'Browse Products', href: '/products' }}
 *   />
 *
 *   // With a button action instead of a link:
 *   <EmptyState
 *     emoji="📦"
 *     title="No orders yet"
 *     action={{ label: 'Start Shopping', href: '/products' }}
 *   />
 */
export default function EmptyState({
  emoji = '📭',
  title,
  description,
  action, // { label, href } for link | { label, onClick } for button
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-4 ${className}`}>
      <div className="text-5xl mb-4" aria-hidden="true">{emoji}</div>
      {title && (
        <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-text-secondary max-w-xs leading-relaxed mb-6">
          {description}
        </p>
      )}
      {action && (
        action.href ? (
          <Link href={action.href} className="btn-primary px-8">
            {action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className="btn-primary px-8">
            {action.label}
          </button>
        )
      )}
    </div>
  )
}

