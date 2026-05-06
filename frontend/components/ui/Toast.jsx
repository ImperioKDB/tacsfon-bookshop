/**
 * Typed toast helpers — wraps react-hot-toast with project conventions.
 * Always use these instead of calling toast() directly.
 *
 * Usage:
 *   import { toastSuccess, toastError, toastInfo } from '@/components/ui/Toast'
 *
 *   toastSuccess('Order placed! 🎉')
 *   toastError(error)            ← accepts Error objects or strings
 *   toastInfo('Payment pending')
 *   toastLoading('Verifying...')  ← returns toast id for toastDismiss
 *   toastDismiss(id)
 */
import toast from 'react-hot-toast'

// ── Map HTTP status codes to user-friendly messages ─────────────────────────

function getApiErrorMessage(error) {
  if (typeof error === 'string') return error

  const status = error?.status
  const message = error?.message

  if (status === 401) return 'Your session has expired. Please log in again.'
  if (status === 403) return "You don't have permission to do that."
  if (status === 404) return 'The requested item was not found.'
  if (status === 500) return 'Something went wrong on our end. Please try again.'

  if (message?.toLowerCase().includes('network') ||
      message?.toLowerCase().includes('fetch')) {
    return 'Connection error. Please check your internet.'
  }

  return message || 'Something went wrong. Please try again.'
}

// ── Exports ──────────────────────────────────────────────────────────────────

export function toastSuccess(message) {
  return toast.success(message)
}

export function toastError(errorOrMessage) {
  const message = getApiErrorMessage(errorOrMessage)
  return toast.error(message)
}

export function toastInfo(message) {
  return toast(message, {
    icon: 'ℹ️',
    style: { background: '#e8f5ee', color: '#1a5c38' },
  })
}

export function toastLoading(message = 'Loading...') {
  return toast.loading(message)
}

export function toastDismiss(id) {
  toast.dismiss(id)
}

export function toastPromise(promise, { loading, success, error }) {
  return toast.promise(promise, { loading, success, error: (e) => getApiErrorMessage(e) })
}

