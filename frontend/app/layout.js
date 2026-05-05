import { Inter } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'  // ← Fixed path
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'TACSFON Bookshop',
  description: 'Your campus bookshop, online. Order stationeries and get them delivered to your hostel.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
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
