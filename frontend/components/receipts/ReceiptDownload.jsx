'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

/**
 * ReceiptDownload
 * Props:
 *   refId       — order ref_id, used in the PDF filename
 *   shareToken  — token for the public /receipt/[token] link
 */
export default function ReceiptDownload({ refId, shareToken }) {
  const [copied, setCopied] = useState(false)
  const [printing, setPrinting] = useState(false)

  // ── PDF via window.print ────────────────────────────────────────────────
  function handleDownload() {
    if (printing) return
    setPrinting(true)

    // Temporarily set document title so the browser uses it as the default filename
    const prevTitle = document.title
    document.title = `TACSFON-Receipt-${refId}`

    window.print()

    // Restore title after a tick (print dialog is synchronous on most browsers)
    setTimeout(() => {
      document.title = prevTitle
      setPrinting(false)
    }, 500)
  }

  // ── Copy share link ─────────────────────────────────────────────────────
  async function handleCopyLink() {
    if (!shareToken) {
      toast.error('Share link not available for this order.')
      return
    }

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/receipt/${shareToken}`

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Share link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy link. Please try again.')
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 print:hidden">
      {/* Download PDF */}
      <button
        onClick={handleDownload}
        disabled={printing}
        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full
                   bg-[#1a5c38] text-white text-sm font-medium
                   hover:bg-[#154d2f] active:scale-95 disabled:opacity-60
                   transition-all duration-200"
      >
        {printing ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Preparing...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Download PDF
          </>
        )}
      </button>

      {/* Copy share link */}
      {shareToken && (
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full
                     border border-[#1a5c38] text-[#1a5c38] text-sm font-medium
                     hover:bg-[#e8f5ee] active:scale-95
                     transition-all duration-200"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Share Link
            </>
          )}
        </button>
      )}
    </div>
  )
}

