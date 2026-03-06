import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, Leaf, Zap, Users } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="pt-20 pb-16 min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-wood-900 text-cream py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            className="font-display text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Our Story
          </motion.h1>
          <motion.p
            className="text-wood-300 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Simply Nuts was born from a simple idea: corporate gifts should be
            personal, memorable, and delicious.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-wood-400 rounded-2xl h-80 flex items-center justify-center text-8xl">
                🥜
              </div>
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold text-wood-900 mb-4">
                From Workshop to Your Desk
              </h2>
              <p className="text-wood-600 mb-4">
                It started in a small workshop with a laser engraver and a love for
                great food. We noticed that corporate gifts often ended up forgotten —
                generic, impersonal, and uninspired.
              </p>
              <p className="text-wood-600 mb-4">
                We set out to change that. By combining precision laser engraving with
                premium, hand-selected nuts, we create gifts that recipients actually
                love — gifts that sit on their desk, get shared with coworkers, and
                spark real conversations about your brand.
              </p>
              <p className="text-wood-600">
                Today, we've engraved over 50,000 custom containers for companies
                ranging from startups to Fortune 500s.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-wood-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center text-wood-900 mb-12">
            What Drives Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Heart, title: 'Craftsmanship', desc: 'Every box is inspected by hand. Every engraving is tested for precision.' },
              { icon: Leaf, title: 'Sustainability', desc: 'Bamboo options, recyclable tins, and carbon-offset shipping.' },
              { icon: Zap, title: 'Speed', desc: 'From order to delivery in as fast as 5 business days.' },
              { icon: Users, title: 'Service', desc: 'Dedicated account managers for orders of 100+ units.' },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                className="text-center p-6 bg-white rounded-xl border border-wood-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-burn/10 text-burn mb-4">
                  <v.icon size={24} />
                </div>
                <h3 className="font-display font-semibold text-wood-900 mb-2">{v.title}</h3>
                <p className="text-sm text-wood-500">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '50K+', label: 'Gifts Engraved' },
              { num: '2,000+', label: 'Companies Served' },
              { num: '99%', label: 'Satisfaction Rate' },
              { num: '5', label: 'Day Turnaround' },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl font-bold text-burn">{s.num}</div>
                <div className="text-sm text-wood-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-wood-900 text-cream text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold mb-4">
            Let's Create Something Special
          </h2>
          <p className="text-wood-400 mb-8">
            Whether it's 10 gifts or 10,000, we'll make each one perfect.
          </p>
          <Link
            to="/custom"
            className="inline-flex items-center gap-2 px-8 py-4 bg-burn hover:bg-burn-light text-white font-semibold rounded-lg transition-colors no-underline"
          >
            Start Your Order
          </Link>
        </div>
      </section>
    </div>
  )
}
