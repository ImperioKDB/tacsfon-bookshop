'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Spinner from '@/components/ui/spinner'
import toast from 'react-hot-toast'

export default function AdminLayout({ children }) {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login?redirect=/admin')
      return
    }
    if (role && role !== 'admin') {
      toast.error('Access denied.')
      router.replace('/')
    }
  }, [user, role, loading, router])

  if (loading || !user || role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      {/* Main content — offset for sidebar on desktop */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8">
          {children}
        </main>
      </div>
    </div>
  )
}
