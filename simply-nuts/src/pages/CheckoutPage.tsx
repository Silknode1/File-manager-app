import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCartStore } from '../store/cartStore'
import { Link } from 'react-router-dom'
import { CreditCard, Truck, Shield, ArrowLeft } from 'lucide-react'

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore()
  const [submitted, setSubmitted] = useState(false)

  const containerLabels: Record<string, string> = {
    'wooden-box': 'Wooden Box',
    'bamboo-container': 'Bamboo Container',
    'gift-tin': 'Gift Tin',
  }

  if (submitted) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-cream flex items-center justify-center">
        <motion.div
          className="text-center max-w-md mx-auto px-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-display text-3xl font-bold text-wood-900 mb-3">
            Order Confirmed!
          </h1>
          <p className="text-wood-500 mb-6">
            Thank you for your order. We'll send you a confirmation email with
            tracking details within 24 hours.
          </p>
          <p className="text-sm text-wood-400 mb-8">
            Order #SN-{Math.floor(Math.random() * 90000) + 10000}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-burn text-white font-semibold rounded-lg no-underline hover:bg-burn-dark transition-colors"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="font-display text-2xl font-bold text-wood-900 mb-3">
            Your cart is empty
          </h2>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-burn font-medium no-underline hover:underline"
          >
            <ArrowLeft size={16} /> Browse products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-wood-900 mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setSubmitted(true)
                clearCart()
              }}
              className="space-y-6"
            >
              {/* Shipping */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-wood-100">
                <h2 className="font-display text-lg font-semibold text-wood-900 mb-4 flex items-center gap-2">
                  <Truck size={20} className="text-burn" /> Shipping Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-wood-700 mb-1">First Name</label>
                    <input type="text" required className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wood-700 mb-1">Last Name</label>
                    <input type="text" required className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 text-sm" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-wood-700 mb-1">Company</label>
                  <input type="text" className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 text-sm" />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-wood-700 mb-1">Address</label>
                  <input type="text" required className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 text-sm" />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-wood-700 mb-1">City</label>
                    <input type="text" required className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wood-700 mb-1">State</label>
                    <input type="text" required className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wood-700 mb-1">ZIP</label>
                    <input type="text" required className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 text-sm" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-wood-700 mb-1">Email</label>
                  <input type="email" required className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 text-sm" />
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-wood-100">
                <h2 className="font-display text-lg font-semibold text-wood-900 mb-4 flex items-center gap-2">
                  <CreditCard size={20} className="text-burn" /> Payment
                </h2>
                <div>
                  <label className="block text-sm font-medium text-wood-700 mb-1">Card Number</label>
                  <input type="text" placeholder="4242 4242 4242 4242" required className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-wood-700 mb-1">Expiry</label>
                    <input type="text" placeholder="MM/YY" required className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wood-700 mb-1">CVC</label>
                    <input type="text" placeholder="123" required className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 text-sm" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-wood-400">
                  <Shield size={14} /> Secured with 256-bit SSL encryption
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-burn hover:bg-burn-dark text-white font-semibold rounded-lg transition-colors border-none cursor-pointer text-lg"
              >
                Place Order — ${getTotal().toFixed(2)}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-wood-100 sticky top-24">
              <h2 className="font-display text-lg font-semibold text-wood-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="text-wood-900 font-medium">
                        {containerLabels[item.containerType]} ({item.size})
                      </p>
                      {item.customLogoName && (
                        <p className="text-xs text-burn">+ Custom engraving</p>
                      )}
                      <p className="text-xs text-wood-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-wood-700 font-medium">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-wood-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-wood-500">Subtotal</span>
                  <span className="text-wood-700">${getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-wood-500">Shipping</span>
                  <span className="text-forest-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-wood-100 pt-2">
                  <span className="text-wood-900">Total</span>
                  <span className="text-burn">${getTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
