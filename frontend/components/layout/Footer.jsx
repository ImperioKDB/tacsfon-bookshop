import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-border py-10 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <h3 className="font-bold text-primary text-lg mb-2">TACSFON Bookshop</h3>
          <p className="text-text-secondary leading-relaxed">
            Affordable campus essentials, delivered to your hostel. Built for UNIBEN students.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-text-primary mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2">
            <Link href="/products" className="text-text-secondary hover:text-primary transition-colors min-h-[44px] flex items-center">Browse Products</Link>
            <Link href="/about" className="text-text-secondary hover:text-primary transition-colors min-h-[44px] flex items-center">About Us</Link>
            <Link href="/contact" className="text-text-secondary hover:text-primary transition-colors min-h-[44px] flex items-center">Contact & Support</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-text-primary mb-3">Contact</h4>
          <p className="text-text-secondary mb-2">📞 WhatsApp: +234 800 000 0000</p>
          <a 
            href="https://wa.me/2348000000000" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block mt-2 text-primary font-medium hover:underline min-h-[44px] flex items-center"
          >
            Chat with Admin →
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-border text-center text-text-secondary text-xs">
        © {new Date().getFullYear()} TACSFON Bookshop. All rights reserved.
      </div>
    </footer>
  )
}
