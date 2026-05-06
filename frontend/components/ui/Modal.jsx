'use client'
import { useEffect, useRef } from 'react'

/**
 * Accessible modal dialog with backdrop.
 * On mobile: slides up as a full-screen bottom sheet.
 * On desktop: centered dialog.
 *
 * Usage:
 *   <Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm Action">
 *     <p>Are you sure?</p>
 *     <div className="flex gap-3 mt-6">
 *       <Button onClick={onClose}>Cancel</Button>
 *       <Button variant="danger" onClick={handleConfirm}>Delete</Button>
 *     </div>
 *   </Modal>
 */
export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  const overlayRef = useRef(null)
  const dialogRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Trap scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Focus dialog when opened
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  function handleBackdropClick(e) {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`
          w-full ${maxWidth} bg-white outline-none
          rounded-t-3xl md:rounded-2xl
          max-h-[90vh] overflow-y-auto
          animate-slide-up md:animate-fade-in
          p-6
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          {title && (
            <h2 id="modal-title" className="text-lg font-bold text-text-primary">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="ml-auto min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}

/**
 * Confirm dialog — simple wrapper around Modal for yes/no confirmations.
 *
 * Usage:
 *   <ConfirmModal
 *     isOpen={open}
 *     onClose={() => setOpen(false)}
 *     onConfirm={handleDelete}
 *     title="Delete product?"
 *     message="This cannot be undone."
 *     confirmLabel="Delete"
 *     danger
 *   />
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {message && (
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">{message}</p>
      )}
      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="btn-secondary flex-1"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 min-h-[44px] flex items-center justify-center rounded-full px-6 py-3 font-medium transition-all duration-200
            ${danger
              ? 'bg-accent text-white hover:bg-accent/90 disabled:opacity-50'
              : 'btn-primary'
            }`}
        >
          {loading ? '...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

