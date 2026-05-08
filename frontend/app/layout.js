import { DM_Sans } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata = {
  title: 'TACSFON Bookshop',
  description: 'Your campus bookshop, online. Order stationeries and get them delivered to your hostel.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="flex flex-col min-h-screen bg-white">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-grow pt-16 md:pt-20">
              {children}
            </main>
            <Footer />
            <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
