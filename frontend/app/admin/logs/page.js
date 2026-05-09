'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '@/lib/api'
import Spinner from '@/components/ui/spinner'
import EmptyState from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

const ACTION_TYPES = [
  'All Actions',
  'dispatch_order',
  'create_product',
  'update_product',
  'delete_product',
  'create_category',
  'delete_category',
  'create_admin',
  'delete_admin',
  'create_walkin',
]

function LogRow({ log }) {
  const [expanded, setExpanded] = useState(false)

  let detailsStr = ''
  try {
    detailsStr = typeof log.details === 'string'
      ? log.details
      : JSON.stringify(log.details, null, 2)
  } catch {
    detailsStr = String(log.details ?? '')
  }

  const truncated = detailsStr.length > 60 ? detailsStr.slice(0, 60) + '…' : detailsStr

  return (
    <>
      <tr className="border-b border-border hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
          {formatDate(log.created_at)}
        </td>
        <td className="px-4 py-3 text-sm font-medium text-text-primary whitespace-nowrap">
          {log.admin_name ?? log.profiles?.full_name ?? '—'}
        </td>
        <td className="px-4 py-3">
          <span className="inline-block text-xs font-mono bg-primary-light text-primary px-2 py-0.5 rounded-full whitespace-nowrap">
            {log.action ?? '—'}
          </span>
        </td>
        <td className="px-4 py-3 text-xs text-text-secondary">{log.target ?? '—'}</td>
        <td className="px-4 py-3 text-xs text-text-secondary max-w-[200px]">
          {detailsStr ? (
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-left font-mono hover:text-primary transition-colors"
            >
              {expanded ? '▲ Collapse' : truncated}
            </button>
          ) : '—'}
        </td>
      </tr>
      {expanded && detailsStr && (
        <tr className="bg-gray-50 border-b border-border">
          <td colSpan={5} className="px-4 py-3">
            <pre className="text-xs font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
              {detailsStr}
            </pre>
          </td>
        </tr>
      )}
    </>
  )
}

const PAGE_SIZE = 20

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('All Actions')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      }
      if (actionFilter !== 'All Actions') params.action = actionFilter

      const data = await adminApi.getLogs(params)
      setLogs(data.logs ?? data ?? [])
      setTotal(data.total ?? (data.logs ?? data ?? []).length)
    } catch {
      toast.error('Could not load logs.')
    } finally {
      setLoading(false)
    }
  }, [actionFilter, page])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  // Reset to page 1 when filter changes
  useEffect(() => { setPage(1) }, [actionFilter])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Admin Logs</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {loading ? '…' : `${total} log entr${total !== 1 ? 'ies' : 'y'}`}
          </p>
        </div>

        {/* Filter */}
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="input-field w-auto min-w-[180px] text-sm"
        >
          {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : logs.length === 0 ? (
        <EmptyState icon="📋" title="No logs found" description="Admin actions will be recorded here." />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-gray-50/80">
                    {['Timestamp', 'Admin', 'Action', 'Target', 'Details'].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => <LogRow key={log.id} log={log} />)}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn-secondary text-sm px-4 py-2 min-h-[36px] disabled:opacity-40"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="btn-secondary text-sm px-4 py-2 min-h-[36px] disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

