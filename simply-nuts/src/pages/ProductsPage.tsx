import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import { useCartStore, type CartItem } from '../store/cartStore'
import { CONTAINER_PRICES, type ContainerType, type ContainerSize } from '../store/designStore'

interface Product {
  id: string
  name: string
  type: ContainerType
  description: string
  features: string[]
  emoji: string
  bgClass: string
  sizes: {
    size: ContainerSize
    label: string
    nutOz: number
    price: number
  }[]
}

const PRODUCTS: Product[] = [
  {
    id: 'wooden-box',
    name: 'Classic Wooden Gift Box',
    type: 'wooden-box',
    description: 'Handcrafted walnut-finished wooden box with brass hinges and magnetic closure. The premium surface is perfect for detailed laser engraving.',
    features: ['Real walnut veneer finish', 'Brass hinges & magnetic closure', 'Velvet-lined interior', 'Best engraving detail'],
    emoji: '🪵',
    bgClass: 'bg-wood-400',
    sizes: [
      { size: 'small', label: 'Small (6"x4"x3")', nutOz: 12, price: CONTAINER_PRICES['wooden-box'].small },
      { size: 'medium', label: 'Medium (8"x6"x4")', nutOz: 24, price: CONTAINER_PRICES['wooden-box'].medium },
      { size: 'large', label: 'Large (12"x8"x4")', nutOz: 36, price: CONTAINER_PRICES['wooden-box'].large },
    ],
  },
  {
    id: 'bamboo-container',
    name: 'Eco Bamboo Container',
    type: 'bamboo-container',
    description: 'Sustainable bamboo container with a natural finish. Eco-conscious gifting that looks great and tells your brand story.',
    features: ['100% sustainable bamboo', 'Sliding lid design', 'Natural matte finish', 'Eco-friendly choice'],
    emoji: '🎍',
    bgClass: 'bg-forest-400',
    sizes: [
      { size: 'small', label: 'Small (5"x5"x3")', nutOz: 12, price: CONTAINER_PRICES['bamboo-container'].small },
      { size: 'medium', label: 'Medium (7"x7"x4")', nutOz: 24, price: CONTAINER_PRICES['bamboo-container'].medium },
      { size: 'large', label: 'Large (10"x10"x4")', nutOz: 36, price: CONTAINER_PRICES['bamboo-container'].large },
    ],
  },
  {
    id: 'gift-tin',
    name: 'Premium Gift Tin',
    type: 'gift-tin',
    description: 'Elegant brushed metal tin with a custom-engraved lid. A modern, sophisticated option for corporate gifting.',
    features: ['Brushed stainless finish', 'Airtight seal', 'Reusable design', 'Modern aesthetic'],
    emoji: '🥫',
    bgClass: 'bg-gold-500',
    sizes: [
      { size: 'small', label: 'Small (5" round)', nutOz: 12, price: CONTAINER_PRICES['gift-tin'].small },
      { size: 'medium', label: 'Medium (7" round)', nutOz: 24, price: CONTAINER_PRICES['gift-tin'].medium },
      { size: 'large', label: 'Large (9" round)', nutOz: 36, price: CONTAINER_PRICES['gift-tin'].large },
    ],
  },
]

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const filterType = searchParams.get('type')
  const [selectedSizes, setSelectedSizes] = useState<Record<string, ContainerSize>>({})
  const addItem = useCartStore((s) => s.addItem)
  const setCartOpen = useCartStore((s) => s.setCartOpen)

  const filteredProducts = filterType
    ? PRODUCTS.filter((p) => p.type === filterType)
    : PRODUCTS

  const handleAddToCart = (product: Product) => {
    const size = selectedSizes[product.id] || 'medium'
    const sizeInfo = product.sizes.find((s) => s.size === size)!
    const item: CartItem = {
      id: `${product.id}-${size}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      containerType: product.type,
      size,
      nuts: [],
      quantity: 1,
      unitPrice: sizeInfo.price,
      image: product.emoji,
    }
    addItem(item)
    setCartOpen(true)
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-wood-900 mb-3">
            Our Gift Collections
          </h1>
          <p className="text-wood-500 max-w-xl mx-auto">
            Premium containers, laser-engraved with your logo, filled with the finest nuts.
            Each one a gift they'll remember.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <Link
            to="/products"
            className={`px-4 py-2 rounded-full text-sm font-medium no-underline transition-colors ${
              !filterType
                ? 'bg-wood-900 text-cream'
                : 'bg-wood-100 text-wood-600 hover:bg-wood-200'
            }`}
          >
            All
          </Link>
          {[
            { type: 'wooden-box', label: 'Wooden Boxes' },
            { type: 'bamboo-container', label: 'Bamboo' },
            { type: 'gift-tin', label: 'Gift Tins' },
          ].map((f) => (
            <Link
              key={f.type}
              to={`/products?type=${f.type}`}
              className={`px-4 py-2 rounded-full text-sm font-medium no-underline transition-colors ${
                filterType === f.type
                  ? 'bg-wood-900 text-cream'
                  : 'bg-wood-100 text-wood-600 hover:bg-wood-200'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Products */}
        <div className="space-y-16">
          {filteredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-wood-100"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Image */}
                <div className={`${product.bgClass} flex items-center justify-center text-[8rem] min-h-[300px]`}>
                  {product.emoji}
                </div>

                {/* Details */}
                <div className="p-8">
                  <h2 className="font-display text-2xl font-bold text-wood-900 mb-2">
                    {product.name}
                  </h2>
                  <p className="text-wood-500 text-sm mb-4">{product.description}</p>

                  <ul className="space-y-1 mb-6">
                    {product.features.map((f) => (
                      <li key={f} className="text-sm text-wood-600 flex items-center gap-2">
                        <span className="text-forest-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>

                  {/* Size selector */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-wood-700 mb-2">Select size:</p>
                    <div className="flex gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s.size}
                          onClick={() =>
                            setSelectedSizes((prev) => ({ ...prev, [product.id]: s.size }))
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                            (selectedSizes[product.id] || 'medium') === s.size
                              ? 'bg-wood-900 text-cream border-wood-900'
                              : 'bg-white text-wood-600 border-wood-200 hover:border-wood-400'
                          }`}
                        >
                          {s.label}
                          <span className="block text-xs mt-0.5 opacity-70">
                            ${s.price.toFixed(2)} · {s.nutOz}oz
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex items-center gap-2 px-6 py-3 bg-burn hover:bg-burn-dark text-white font-semibold rounded-lg transition-colors border-none cursor-pointer"
                    >
                      <ShoppingCart size={18} /> Add to Cart
                    </button>
                    <Link
                      to="/custom"
                      className="flex items-center gap-2 px-6 py-3 border-2 border-burn text-burn hover:bg-burn hover:text-white font-semibold rounded-lg transition-colors no-underline"
                    >
                      Customize <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bulk CTA */}
        <div className="mt-16 text-center bg-wood-900 rounded-2xl p-10 text-cream">
          <h3 className="font-display text-2xl font-bold mb-3">
            Need 100+ Units?
          </h3>
          <p className="text-wood-400 mb-6">
            Contact us for volume pricing, custom packaging, and direct-to-recipient shipping.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gold-500 hover:bg-gold-600 text-wood-950 font-semibold rounded-lg transition-colors no-underline"
          >
            Get Bulk Quote
          </Link>
        </div>
      </div>
    </div>
  )
}
