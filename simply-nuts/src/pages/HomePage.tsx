import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gift, Pen, Truck, Star, ArrowRight } from 'lucide-react'
import LaserEngraveHero from '../components/LaserEngraveHero'

const FEATURES = [
  {
    icon: Pen,
    title: 'Custom Engraving',
    desc: 'Upload your company logo and watch it laser engraved onto premium containers.',
  },
  {
    icon: Gift,
    title: 'Premium Nuts',
    desc: 'Hand-selected almonds, cashews, pecans, macadamia, and more.',
  },
  {
    icon: Truck,
    title: 'Bulk Shipping',
    desc: 'Order 10 or 10,000. We ship directly to your client list.',
  },
  {
    icon: Star,
    title: 'Memorable Gifts',
    desc: 'Make an impression that lasts far beyond the holiday season.',
  },
]

const PRODUCTS_PREVIEW = [
  {
    name: 'Wooden Gift Box',
    price: 'From $24.99',
    desc: 'Classic walnut-finished wooden box with brass hinges',
    bg: 'bg-wood-400',
    emoji: '🪵',
    type: 'wooden-box',
  },
  {
    name: 'Bamboo Container',
    price: 'From $19.99',
    desc: 'Eco-friendly bamboo with natural finish',
    bg: 'bg-forest-400',
    emoji: '🎍',
    type: 'bamboo-container',
  },
  {
    name: 'Gift Tin',
    price: 'From $14.99',
    desc: 'Elegant brushed metal tin with custom lid engraving',
    bg: 'bg-gold-500',
    emoji: '🥫',
    type: 'gift-tin',
  },
]

const TESTIMONIALS = [
  {
    quote: "Our clients absolutely loved the personalized wooden boxes. The engraving quality was exceptional and the nuts were fresh and delicious.",
    name: 'Sarah Chen',
    role: 'VP of Client Relations, TechCorp',
  },
  {
    quote: "Simply Nuts made our holiday gifting effortless. We ordered 500 custom boxes and every single one was perfect.",
    name: 'Marcus Williams',
    role: 'Operations Director, Summit Financial',
  },
  {
    quote: "The bamboo containers with our logo were such a hit. Multiple clients called to thank us personally!",
    name: 'Jennifer Park',
    role: 'Marketing Manager, GreenLeaf Co',
  },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-wood-950 via-wood-900 to-wood-800 pt-16 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-burn/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 text-center">
          <motion.p
            className="text-gold-400 font-engrave text-sm tracking-widest uppercase mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Custom Laser-Engraved Corporate Gifts
          </motion.p>

          <motion.h1
            className="font-display text-5xl md:text-7xl font-bold text-cream mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Make Every Gift
            <br />
            <span className="text-gold-400">Unforgettable</span>
          </motion.h1>

          <motion.div
            className="my-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <LaserEngraveHero />
          </motion.div>

          <motion.p
            className="text-wood-300 text-lg max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            We laser-engrave your company logo onto premium wooden boxes, bamboo
            containers, and gift tins — then fill them with the finest nuts for
            your clients and team.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Link
              to="/custom"
              className="inline-flex items-center gap-2 px-8 py-4 bg-burn hover:bg-burn-light text-white font-semibold rounded-lg transition-all hover:scale-105 no-underline shadow-lg shadow-burn/30"
            >
              Start Custom Order <ArrowRight size={18} />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-wood-950 font-semibold rounded-lg transition-all no-underline"
            >
              Browse Products
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-wood-900 mb-4">
            Why Companies Choose Simply Nuts
          </h2>
          <p className="text-center text-wood-500 mb-12 max-w-xl mx-auto">
            From custom design to doorstep delivery, we handle everything.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className="text-center p-6 rounded-xl bg-white shadow-sm border border-wood-100 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-burn/10 text-burn mb-4">
                  <f.icon size={28} />
                </div>
                <h3 className="font-display font-semibold text-lg text-wood-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-wood-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20 bg-wood-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-wood-900 mb-4">
            Choose Your Container
          </h2>
          <p className="text-center text-wood-500 mb-12">
            Each one laser-engraved with your company logo
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRODUCTS_PREVIEW.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Link
                  to={`/products?type=${p.type}`}
                  className="block no-underline group"
                >
                  <div className={`${p.bg} rounded-t-xl h-48 flex items-center justify-center text-7xl group-hover:scale-105 transition-transform`}>
                    {p.emoji}
                  </div>
                  <div className="bg-white rounded-b-xl p-6 border border-wood-100 border-t-0">
                    <h3 className="font-display font-semibold text-lg text-wood-900">
                      {p.name}
                    </h3>
                    <p className="text-sm text-wood-500 mt-1">{p.desc}</p>
                    <p className="text-burn font-semibold mt-3">{p.price}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-wood-900 text-cream">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Choose Container', desc: 'Pick your box, bamboo, or tin' },
              { step: '02', title: 'Upload Logo', desc: 'Our tool previews your engraving' },
              { step: '03', title: 'Select Nuts', desc: 'Mix and match premium varieties' },
              { step: '04', title: 'We Ship', desc: 'Direct to you or your client list' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="text-5xl font-display font-bold text-burn/30 mb-2">
                  {s.step}
                </div>
                <h3 className="font-display text-lg font-semibold text-gold-400 mb-1">
                  {s.title}
                </h3>
                <p className="text-wood-400 text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/custom"
              className="inline-flex items-center gap-2 px-8 py-4 bg-burn hover:bg-burn-light text-white font-semibold rounded-lg transition-colors no-underline"
            >
              Start Your Custom Order <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-wood-900 mb-12">
            What Our Clients Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                className="bg-white p-6 rounded-xl shadow-sm border border-wood-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex gap-1 text-gold-400 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-wood-600 text-sm italic mb-4">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-wood-900 text-sm">{t.name}</p>
                  <p className="text-wood-400 text-xs">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-wood-800 to-wood-900 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cream mb-4">
            Ready to Impress Your Clients?
          </h2>
          <p className="text-wood-300 mb-8">
            Get started with a custom order or contact us for bulk pricing.
            Minimum order: 10 units.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/custom"
              className="inline-flex items-center gap-2 px-8 py-4 bg-burn hover:bg-burn-light text-white font-semibold rounded-lg transition-colors no-underline"
            >
              Design Your Gift
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-wood-400 text-wood-300 hover:bg-wood-700 font-semibold rounded-lg transition-colors no-underline"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
