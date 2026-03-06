import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, ChevronRight, ChevronLeft, ShoppingCart, Check } from 'lucide-react'
import {
  useDesignStore,
  NUT_OPTIONS,
  CONTAINER_NUT_CAPACITY,
  type ContainerType,
  type ContainerSize,
} from '../store/designStore'
import { useCartStore } from '../store/cartStore'
import { useNavigate } from 'react-router-dom'

const CONTAINERS: { type: ContainerType; name: string; emoji: string; bgClass: string; desc: string }[] = [
  { type: 'wooden-box', name: 'Wooden Box', emoji: '🪵', bgClass: 'bg-wood-400', desc: 'Classic walnut finish, brass hinges' },
  { type: 'bamboo-container', name: 'Bamboo Container', emoji: '🎍', bgClass: 'bg-forest-400', desc: 'Eco-friendly, natural finish' },
  { type: 'gift-tin', name: 'Gift Tin', emoji: '🥫', bgClass: 'bg-gold-500', desc: 'Brushed metal, modern look' },
]

const SIZES: { size: ContainerSize; label: string; desc: string }[] = [
  { size: 'small', label: 'Small', desc: '12oz of nuts' },
  { size: 'medium', label: 'Medium', desc: '24oz of nuts' },
  { size: 'large', label: 'Large', desc: '36oz of nuts' },
]

export default function CustomOrderPage() {
  const store = useDesignStore()
  const addItem = useCartStore((s) => s.addItem)
  const setCartOpen = useCartStore((s) => s.setCartOpen)
  const navigate = useNavigate()

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        store.setLogoFile(ev.target?.result as string, file.name)
      }
      reader.readAsDataURL(file)
    },
    [store]
  )

  const handleAddToCart = () => {
    const item = {
      id: `custom-${Date.now()}`,
      productId: store.containerType,
      productName: `Custom ${CONTAINERS.find((c) => c.type === store.containerType)?.name}`,
      containerType: store.containerType,
      size: store.containerSize,
      nuts: store.selectedNuts.map((n) => ({
        id: n.id,
        name: NUT_OPTIONS.find((o) => o.id === n.id)?.name || n.id,
        quantity: n.ounces,
      })),
      customLogo: store.logoFile || undefined,
      customLogoName: store.logoFileName || undefined,
      engraveText: store.engraveText || undefined,
      quantity: 1,
      unitPrice: store.getPrice(),
      image: CONTAINERS.find((c) => c.type === store.containerType)?.emoji || '📦',
    }
    addItem(item)
    setCartOpen(true)
    store.reset()
    navigate('/products')
  }

  const canProceed = () => {
    switch (store.step) {
      case 1: return true
      case 2: return store.logoFile !== null || store.engraveText.length > 0
      case 3: return store.selectedNuts.length > 0 && store.getTotalOunces() <= store.getMaxOunces()
      case 4: return true
      default: return true
    }
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-wood-900 mb-3">
            Design Your Gift
          </h1>
          <p className="text-wood-500">
            Customize every detail — container, engraving, and nut selection.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {['Container', 'Engraving', 'Nuts', 'Review'].map((label, i) => {
            const stepNum = i + 1
            const isActive = store.step === stepNum
            const isDone = store.step > stepNum
            return (
              <div key={label} className="flex items-center gap-2">
                <button
                  onClick={() => stepNum < store.step && store.setStep(stepNum)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border-none cursor-pointer ${
                    isActive
                      ? 'bg-burn text-white'
                      : isDone
                      ? 'bg-forest-500 text-white'
                      : 'bg-wood-100 text-wood-400'
                  }`}
                >
                  {isDone ? <Check size={14} /> : <span>{stepNum}</span>}
                  <span className="hidden sm:inline">{label}</span>
                </button>
                {i < 3 && <ChevronRight size={16} className="text-wood-300" />}
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Container Selection */}
          {store.step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <h2 className="font-display text-2xl font-bold text-wood-900 mb-6 text-center">
                Choose Your Container
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {CONTAINERS.map((c) => (
                  <button
                    key={c.type}
                    onClick={() => store.setContainerType(c.type)}
                    className={`p-6 rounded-xl border-2 transition-all cursor-pointer bg-white text-left ${
                      store.containerType === c.type
                        ? 'border-burn shadow-lg shadow-burn/10'
                        : 'border-wood-100 hover:border-wood-300'
                    }`}
                  >
                    <div className={`${c.bgClass} rounded-lg h-32 flex items-center justify-center text-5xl mb-4`}>
                      {c.emoji}
                    </div>
                    <h3 className="font-display font-semibold text-wood-900">{c.name}</h3>
                    <p className="text-sm text-wood-500 mt-1">{c.desc}</p>
                  </button>
                ))}
              </div>

              <h3 className="font-display text-lg font-semibold text-wood-900 mb-4 text-center">
                Select Size
              </h3>
              <div className="flex justify-center gap-4 mb-8">
                {SIZES.map((s) => (
                  <button
                    key={s.size}
                    onClick={() => store.setContainerSize(s.size)}
                    className={`px-6 py-3 rounded-lg border-2 font-medium transition-all cursor-pointer ${
                      store.containerSize === s.size
                        ? 'border-burn bg-burn/5 text-burn'
                        : 'border-wood-100 bg-white text-wood-600 hover:border-wood-300'
                    }`}
                  >
                    <div className="font-semibold">{s.label}</div>
                    <div className="text-xs opacity-70">{s.desc}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Logo & Engraving */}
          {store.step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <h2 className="font-display text-2xl font-bold text-wood-900 mb-6 text-center">
                Customize Your Engraving
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload Area */}
                <div>
                  <h3 className="font-semibold text-wood-900 mb-3">Upload Your Logo</h3>
                  {store.logoFile ? (
                    <div className="relative border-2 border-burn/30 rounded-xl p-4 bg-white">
                      <img
                        src={store.logoFile}
                        alt="Uploaded logo"
                        className="w-full h-48 object-contain"
                      />
                      <button
                        onClick={() => store.setLogoFile(null)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center border-none cursor-pointer hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                      <p className="text-sm text-wood-500 mt-2 text-center">
                        {store.logoFileName}
                      </p>

                      {/* Scale slider */}
                      <div className="mt-4">
                        <label className="text-sm font-medium text-wood-700">
                          Logo Size: {Math.round(store.logoScale * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0.3"
                          max="2"
                          step="0.1"
                          value={store.logoScale}
                          onChange={(e) => store.setLogoScale(parseFloat(e.target.value))}
                          className="w-full mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-wood-300 rounded-xl cursor-pointer hover:border-burn hover:bg-burn/5 transition-colors bg-white">
                      <Upload size={40} className="text-wood-400 mb-3" />
                      <span className="font-medium text-wood-600">
                        Drop your logo here
                      </span>
                      <span className="text-sm text-wood-400 mt-1">
                        PNG, SVG, or JPG (max 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  )}

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-wood-700 mb-2">
                      Add Text (optional)
                    </label>
                    <input
                      type="text"
                      value={store.engraveText}
                      onChange={(e) => store.setEngraveText(e.target.value)}
                      placeholder="e.g. Happy Holidays 2026!"
                      maxLength={40}
                      className="w-full px-4 py-3 border border-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-burn/30 focus:border-burn"
                    />
                    <p className="text-xs text-wood-400 mt-1">
                      {store.engraveText.length}/40 characters
                    </p>
                  </div>
                </div>

                {/* Live Preview */}
                <div>
                  <h3 className="font-semibold text-wood-900 mb-3">Live Preview</h3>
                  <div className="wood-texture rounded-xl overflow-hidden shadow-lg border-2 border-wood-600/30">
                    <div className="aspect-square flex flex-col items-center justify-center p-8 relative">
                      {/* Wood grain lines */}
                      <div
                        className="absolute inset-0 opacity-15"
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(85deg, transparent, transparent 30px, rgba(90,48,16,0.2) 30px, rgba(90,48,16,0.2) 31px)',
                        }}
                      />

                      <div className="relative z-10 flex flex-col items-center">
                        {store.logoFile && (
                          <img
                            src={store.logoFile}
                            alt="Logo preview"
                            className="mb-4 opacity-70"
                            style={{
                              width: `${store.logoScale * 120}px`,
                              height: `${store.logoScale * 120}px`,
                              objectFit: 'contain',
                              filter: 'sepia(1) brightness(0.4) contrast(1.5)',
                              mixBlendMode: 'multiply',
                            }}
                          />
                        )}
                        {store.engraveText && (
                          <p
                            className="font-engrave text-center text-wood-900/60"
                            style={{
                              fontSize: `${Math.max(14, 24 - store.engraveText.length * 0.3)}px`,
                              textShadow: '0 1px 0 rgba(0,0,0,0.1)',
                            }}
                          >
                            {store.engraveText}
                          </p>
                        )}
                        {!store.logoFile && !store.engraveText && (
                          <p className="text-wood-700/40 font-engrave text-center">
                            Upload a logo or add text
                            <br />
                            to see your preview
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-wood-400 mt-2 text-center">
                    Preview is approximate. Final engraving will be sharper and more detailed.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Nut Selection */}
          {store.step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <h2 className="font-display text-2xl font-bold text-wood-900 mb-2 text-center">
                Select Your Nuts
              </h2>
              <p className="text-center text-wood-500 mb-6">
                Fill your {CONTAINERS.find((c) => c.type === store.containerType)?.name?.toLowerCase()} with up to{' '}
                {CONTAINER_NUT_CAPACITY[store.containerSize]}oz of premium nuts.
              </p>

              {/* Capacity Bar */}
              <div className="max-w-md mx-auto mb-8">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-wood-600">
                    {store.getTotalOunces()}oz selected
                  </span>
                  <span className="text-wood-400">
                    {store.getMaxOunces()}oz capacity
                  </span>
                </div>
                <div className="h-3 bg-wood-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      store.getTotalOunces() > store.getMaxOunces()
                        ? 'bg-red-500'
                        : store.getTotalOunces() === store.getMaxOunces()
                        ? 'bg-forest-500'
                        : 'bg-burn'
                    }`}
                    style={{
                      width: `${Math.min(100, (store.getTotalOunces() / store.getMaxOunces()) * 100)}%`,
                    }}
                  />
                </div>
                {store.getTotalOunces() > store.getMaxOunces() && (
                  <p className="text-red-500 text-xs mt-1">
                    Over capacity! Remove some nuts to proceed.
                  </p>
                )}
              </div>

              {/* Nut Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {NUT_OPTIONS.map((nut) => {
                  const selected = store.selectedNuts.find((n) => n.id === nut.id)
                  return (
                    <div
                      key={nut.id}
                      className={`p-4 rounded-xl border-2 transition-all bg-white ${
                        selected
                          ? 'border-burn shadow-sm'
                          : 'border-wood-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{nut.image}</span>
                          <div>
                            <h4 className="font-semibold text-wood-900 text-sm">
                              {nut.name}
                            </h4>
                            <p className="text-xs text-wood-400">{nut.description}</p>
                            <p className="text-xs text-burn font-medium mt-0.5">
                              ${nut.pricePerOz.toFixed(2)}/oz
                            </p>
                          </div>
                        </div>

                        {selected ? (
                          <button
                            onClick={() => store.removeNut(nut.id)}
                            className="text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer p-1"
                          >
                            <X size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => store.addNut(nut.id)}
                            className="px-3 py-1 bg-burn/10 text-burn text-sm font-medium rounded-lg hover:bg-burn/20 border-none cursor-pointer"
                          >
                            Add
                          </button>
                        )}
                      </div>

                      {selected && (
                        <div className="mt-3 flex items-center gap-3">
                          <label className="text-xs text-wood-500">Ounces:</label>
                          <input
                            type="range"
                            min="2"
                            max={Math.min(16, store.getMaxOunces())}
                            step="2"
                            value={selected.ounces}
                            onChange={(e) =>
                              store.updateNutOunces(nut.id, parseInt(e.target.value))
                            }
                            className="flex-1"
                          />
                          <span className="text-sm font-medium text-wood-700 w-10">
                            {selected.ounces}oz
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {store.step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="font-display text-2xl font-bold text-wood-900 mb-6 text-center">
                Review Your Custom Gift
              </h2>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-wood-100 space-y-6">
                {/* Container */}
                <div className="flex items-center gap-4 pb-4 border-b border-wood-100">
                  <div className={`w-16 h-16 ${CONTAINERS.find((c) => c.type === store.containerType)?.bgClass} rounded-lg flex items-center justify-center text-3xl`}>
                    {CONTAINERS.find((c) => c.type === store.containerType)?.emoji}
                  </div>
                  <div>
                    <h3 className="font-semibold text-wood-900">
                      {CONTAINERS.find((c) => c.type === store.containerType)?.name} — {store.containerSize}
                    </h3>
                    <p className="text-sm text-wood-500">
                      {CONTAINER_NUT_CAPACITY[store.containerSize]}oz capacity
                    </p>
                  </div>
                </div>

                {/* Engraving */}
                <div className="pb-4 border-b border-wood-100">
                  <h4 className="text-sm font-medium text-wood-500 mb-2">Engraving</h4>
                  {store.logoFile && (
                    <div className="flex items-center gap-3">
                      <img
                        src={store.logoFile}
                        alt="Logo"
                        className="w-12 h-12 object-contain rounded border border-wood-100 p-1"
                      />
                      <span className="text-sm text-wood-700">{store.logoFileName}</span>
                    </div>
                  )}
                  {store.engraveText && (
                    <p className="font-engrave text-wood-700 mt-2">
                      "{store.engraveText}"
                    </p>
                  )}
                </div>

                {/* Nuts */}
                <div className="pb-4 border-b border-wood-100">
                  <h4 className="text-sm font-medium text-wood-500 mb-2">Nut Selection</h4>
                  <ul className="space-y-1">
                    {store.selectedNuts.map((n) => {
                      const nut = NUT_OPTIONS.find((o) => o.id === n.id)
                      return (
                        <li key={n.id} className="flex justify-between text-sm">
                          <span className="text-wood-700">
                            {nut?.image} {nut?.name}
                          </span>
                          <span className="text-wood-500">
                            {n.ounces}oz — ${((nut?.pricePerOz || 0) * n.ounces).toFixed(2)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center text-lg">
                  <span className="font-display font-semibold text-wood-900">
                    Total per unit
                  </span>
                  <span className="font-bold text-burn text-2xl">
                    ${store.getPrice().toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-burn hover:bg-burn-dark text-white font-semibold rounded-lg transition-colors border-none cursor-pointer text-lg"
                >
                  <ShoppingCart size={20} /> Add to Cart
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-10 max-w-2xl mx-auto">
          <button
            onClick={() => store.setStep(Math.max(1, store.step - 1))}
            disabled={store.step === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium border-none cursor-pointer transition-colors ${
              store.step === 1
                ? 'bg-wood-100 text-wood-300 cursor-not-allowed'
                : 'bg-wood-200 text-wood-700 hover:bg-wood-300'
            }`}
          >
            <ChevronLeft size={18} /> Back
          </button>

          {store.step < 4 && (
            <button
              onClick={() => store.setStep(store.step + 1)}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium border-none cursor-pointer transition-colors ${
                canProceed()
                  ? 'bg-burn text-white hover:bg-burn-dark'
                  : 'bg-wood-100 text-wood-300 cursor-not-allowed'
              }`}
            >
              Next <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
