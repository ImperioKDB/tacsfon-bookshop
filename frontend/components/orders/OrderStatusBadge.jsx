/**
 * OrderStatusBadge
 * Renders a colour-coded pill for every possible order status.
 * Centralised here so all three phases (orders list, order detail, admin) stay in sync.
 *
 * Usage:
 *   import OrderStatusBadge from '@/components/orders/OrderStatusBadge'
 *   <OrderStatusBadge status="dispatched" />
 *   <OrderStatusBadge status="pending" size="lg" />
 */

import Badge from '@/components/ui/Badge'

const STATUS_MAP = {
  pending:    { variant: 'pending',    emoji: '🕐', label: 'Pending'    },
  dispatched: { variant: 'dispatched', emoji: '🚚', label: 'Dispatched' },
  received:   { variant: 'received',   emoji: '✅', label: 'Received'   },
  cancelled:  { variant: 'error',      emoji: '❌', label: 'Cancelled'  },
}

export default function OrderStatusBadge({ status, size = 'default', className = '' }) {
  const config = STATUS_MAP[status] ?? { variant: 'default', emoji: '❓', label: status ?? 'Unknown' }

  const sizeClass = size === 'lg'
    ? 'text-sm px-3 py-1'
    : ''

  return (
    <Badge variant={config.variant} className={`${sizeClass} ${className}`}>
      {config.emoji} {config.label}
    </Badge>
  )
}

/**
 * A small helper used in the detail page timeline.
 * Returns whether a given status step is completed / active / upcoming.
 */
export function getStatusStep(status) {
  const steps = ['pending', 'dispatched', 'received']
  if (status === 'cancelled') return { step: -1, cancelled: true }
  const idx = steps.indexOf(status)
  return { step: idx, cancelled: false }
}

