'use client'
import { useEffect, useRef } from 'react'

/**
 * Modal — always renders when mounted.
 * Usage: conditionally render <Modal> in the parent, don't use isOpen prop.
 * Compatible with both old isOpen pattern and new always-mounted pattern.
 */
export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  const overlayRef = useRef(null)
  const dialogRef  = useRef(null)

  // Support both patterns:
  // - New: <Modal onClose={...}> rendered conditionally — always visible
  // - Old: <Modal isOpen={bool} onClose={...}> — respect isOpen
  const visible = isOpen === undefined ? true : isOpen

  useEffect(() => {
    if (!visible) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [visible, onClose])

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [visible])

  useEffect(() => {
    if (visible && dialogRef.current) {
      dialogRef.current.focus()
    }
  }, [visible])

  if (!visible) return null

  function handleBackdropClick(e) {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center
                 bg-black/50 backdrop-blur-sm px-0 md:px-4 animate-fade-in"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`
          relative w-full ${maxWidth} bg-white outline-none
          rounded-t-3xl md:rounded-2xl shadow-2xl
          max-h-[90vh] overflow-y-auto
          animate-slide-up md:animate-fade-in
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/60">
          <h2 className="text-base font-bold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
                       text-text-secondary hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
