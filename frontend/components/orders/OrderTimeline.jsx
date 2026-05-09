'use client'

const STEPS = [
  {
    key: 'pending',
    label: 'Order Placed',
    description: 'Your order has been received',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    key: 'dispatched',
    label: 'Dispatched',
    description: 'Your order is on the way',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
  },
  {
    key: 'received',
    label: 'Delivered',
    description: 'Order received successfully',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
]

const STATUS_ORDER = { pending: 0, dispatched: 1, received: 2 }

export default function OrderTimeline({ status }) {
  const currentIndex = STATUS_ORDER[status] ?? 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-5">Order Progress</h3>

      <div className="relative">
        {/* Connector track */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" aria-hidden="true" />
        {/* Active fill */}
        <div
          className="absolute left-4 top-4 w-0.5 bg-[#1a5c38] transition-all duration-500"
          style={{ height: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
          aria-hidden="true"
        />

        <ol className="relative space-y-6">
          {STEPS.map((step, i) => {
            const done = i <= currentIndex
            const active = i === currentIndex

            return (
              <li key={step.key} className="flex items-start gap-4 pl-0">
                {/* Circle */}
                <div
                  className={`
                    relative z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0
                    transition-all duration-300
                    ${done
                      ? 'bg-[#1a5c38] text-white shadow-md'
                      : 'bg-white border-2 border-gray-200 text-gray-300'}
                    ${active ? 'ring-4 ring-[#e8f5ee]' : ''}
                  `}
                >
                  {step.icon}
                </div>

                {/* Label */}
                <div className="pt-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${done ? 'text-gray-500' : 'text-gray-300'}`}>
                    {step.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

