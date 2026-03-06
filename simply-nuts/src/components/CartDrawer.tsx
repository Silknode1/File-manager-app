import { X, Trash2, Plus, Minus } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useNavigate } from 'react-router-dom'

export default function CartDrawer() {
  const { items, isCartOpen, setCartOpen, removeItem, updateQuantity, getTotal } = useCartStore()
  const navigate = useNavigate()

  if (!isCartOpen) return null

  const containerLabels: Record<string, string> = {
    'wooden-box': 'Wooden Box',
    'bamboo-container': 'Bamboo Container',
    'gift-tin': 'Gift Tin',
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-cream z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-wood-200">
          <h2 className="font-display text-xl font-bold text-wood-900">Your Cart</h2>
          <button
            onClick={() => setCartOpen(false)}
            className="p-1 text-wood-500 hover:text-wood-700 bg-transparent border-none cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-wood-400">
              <p className="text-4xl mb-3">🥜</p>
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm mt-1">Add some delicious gifts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-wood-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-wood-900 text-sm">
                        {containerLabels[item.containerType]} — {item.size}
                      </h3>
                      {item.customLogoName && (
                        <p className="text-xs text-burn mt-0.5">
                          Custom logo: {item.customLogoName}
                        </p>
                      )}
                      {item.engraveText && (
                        <p className="text-xs text-wood-500 mt-0.5 font-engrave">
                          "{item.engraveText}"
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-wood-300 hover:text-red-500 bg-transparent border-none cursor-pointer p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-wood-100 flex items-center justify-center text-wood-600 hover:bg-wood-200 border-none cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-wood-100 flex items-center justify-center text-wood-600 hover:bg-wood-200 border-none cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-semibold text-wood-900">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-wood-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-wood-700">Total</span>
              <span className="text-xl font-bold text-wood-900">
                ${getTotal().toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => {
                setCartOpen(false)
                navigate('/checkout')
              }}
              className="w-full py-3 bg-burn hover:bg-burn-dark text-white font-semibold rounded-lg transition-colors border-none cursor-pointer text-base"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}
