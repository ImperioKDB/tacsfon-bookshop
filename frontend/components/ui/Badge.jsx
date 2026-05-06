/**
 * Badge for order statuses, category labels, stock indicators, etc.
 *
 * Variants: pending | dispatched | received | success | error | warning | info | default
 *
 * Usage:
 *   <Badge variant="dispatched">On the way</Badge>
 *   <Badge variant="pending">Pending</Badge>
 */
export default function Badge({ children, variant = 'default', className = '' }) {
  const styles = {
    pending:    'bg-yellow-50 text-yellow-700 border border-yellow-200',
    dispatched: 'bg-blue-50 text-blue-700 border border-blue-200',
    received:   'bg-green-50 text-green-700 border border-green-200',
    success:    'bg-green-50 text-green-700 border border-green-200',
    error:      'bg-red-50 text-accent border border-red-200',
    warning:    'bg-orange-50 text-orange-700 border border-orange-200',
    info:       'bg-primary-light text-primary border border-primary/20',
    default:    'bg-gray-100 text-text-secondary border border-border',
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
        ${styles[variant] ?? styles.default}
        ${className}
      `}
    >
      {children}
    </span>
  )
}

/**
 * Maps an order status string to the correct Badge variant.
 * Use this instead of manually mapping status → variant in every component.
 */
export function OrderStatusBadge({ status }) {
  const map = {
    pending:    { variant: 'pending',    label: '🕐 Pending' },
    dispatched: { variant: 'dispatched', label: '🚚 Dispatched' },
    received:   { variant: 'received',   label: '✅ Received' },
    cancelled:  { variant: 'error',      label: '❌ Cancelled' },
  }
  const { variant, label } = map[status] ?? { variant: 'default', label: status }
  return <Badge variant={variant}>{label}</Badge>
}

