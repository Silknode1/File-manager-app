import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, Clock, MapPin, Send } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-cream">
      {/* Header */}
      <section className="bg-wood-900 text-cream py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Get in Touch</h1>
          <p className="text-wood-300 text-lg">
            Questions about bulk orders, custom designs, or pricing? We're here to help.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="font-display text-2xl font-bold text-wood-900 mb-6">
              Let's Talk Gifting
            </h2>
            <p className="text-wood-500 mb-8">
              Whether you need 10 custom boxes or 10,000, our team will help you
              create the perfect corporate gift. Reach out and we'll respond within
              24 hours.
            </p>

            <div className="space-y-6">
              {[
                { icon: Mail, label: 'Email', value: 'hello@simplynuts.com' },
                { icon: Phone, label: 'Phone', value: '(555) 123-NUTS' },
                { icon: Clock, label: 'Hours', value: 'Mon-Fri 9am-5pm EST' },
                { icon: MapPin, label: 'Workshop', value: 'Portland, Oregon' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-burn/10 flex items-center justify-center text-burn flex-shrink-0">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-wood-900 text-sm">{item.label}</p>
                    <p className="text-wood-500">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 bg-wood-100 rounded-xl">
              <h3 className="font-display font-semibold text-wood-900 mb-2">
                Bulk Order Discounts
              </h3>
              <ul className="text-sm text-wood-600 space-y-1">
                <li>50-99 units: <strong>10% off</strong></li>
                <li>100-499 units: <strong>15% off</strong></li>
                <li>500+ units: <strong>20% off + free shipping</strong></li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-sm border border-wood-100"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {submitted ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🥜</div>
                <h3 className="font-display text-2xl font-bold text-wood-900 mb-2">
                  Message Sent!
                </h3>
                <p className="text-wood-500">
                  We'll get back to you within 24 hours with a custom quote.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="font-display text-xl font-bold text-wood-900 mb-2">
                  Request a Quote
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-wood-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 focus:border-burn text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wood-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 focus:border-burn text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-wood-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 focus:border-burn text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-wood-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 focus:border-burn text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-wood-700 mb-1">
                    Estimated Quantity
                  </label>
                  <select className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 focus:border-burn text-sm bg-white">
                    <option>10-49 units</option>
                    <option>50-99 units</option>
                    <option>100-499 units</option>
                    <option>500+ units</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-wood-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2.5 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 focus:border-burn text-sm resize-none"
                    placeholder="Tell us about your gifting needs..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-burn hover:bg-burn-dark text-white font-semibold rounded-lg transition-colors border-none cursor-pointer"
                >
                  <Send size={18} /> Send Request
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
