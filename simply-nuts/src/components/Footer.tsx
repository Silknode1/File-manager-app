import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-wood-950 text-wood-300 border-t border-wood-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🥜</span>
              <span className="font-display text-lg font-bold text-gold-400">
                Simply Nuts
              </span>
            </div>
            <p className="text-sm text-wood-400">
              Custom laser-engraved corporate gifts filled with premium nuts.
              Show your clients you care.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-gold-400 mb-3">Shop</h4>
            <ul className="space-y-2 text-sm list-none p-0">
              <li><Link to="/products" className="hover:text-gold-300 text-wood-400 no-underline">All Products</Link></li>
              <li><Link to="/products?type=wooden-box" className="hover:text-gold-300 text-wood-400 no-underline">Wooden Boxes</Link></li>
              <li><Link to="/products?type=bamboo-container" className="hover:text-gold-300 text-wood-400 no-underline">Bamboo Containers</Link></li>
              <li><Link to="/products?type=gift-tin" className="hover:text-gold-300 text-wood-400 no-underline">Gift Tins</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-gold-400 mb-3">Company</h4>
            <ul className="space-y-2 text-sm list-none p-0">
              <li><Link to="/about" className="hover:text-gold-300 text-wood-400 no-underline">About Us</Link></li>
              <li><Link to="/custom" className="hover:text-gold-300 text-wood-400 no-underline">Custom Orders</Link></li>
              <li><Link to="/contact" className="hover:text-gold-300 text-wood-400 no-underline">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-gold-400 mb-3">Get in Touch</h4>
            <ul className="space-y-2 text-sm list-none p-0 text-wood-400">
              <li>hello@simplynuts.com</li>
              <li>(555) 123-NUTS</li>
              <li>Mon-Fri 9am-5pm EST</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-wood-800 text-center text-xs text-wood-500">
          &copy; {new Date().getFullYear()} Simply Nuts. All rights reserved. Made with care for your corporate gifting needs.
        </div>
      </div>
    </footer>
  )
}
