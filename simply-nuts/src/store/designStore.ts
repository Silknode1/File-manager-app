import { create } from 'zustand'

export type ContainerType = 'wooden-box' | 'bamboo-container' | 'gift-tin'
export type ContainerSize = 'small' | 'medium' | 'large'

export interface NutOption {
  id: string
  name: string
  description: string
  pricePerOz: number
  image: string
}

export const NUT_OPTIONS: NutOption[] = [
  { id: 'almonds', name: 'Roasted Almonds', description: 'California almonds, lightly salted', pricePerOz: 1.2, image: '🌰' },
  { id: 'cashews', name: 'Cashews', description: 'Whole premium cashews', pricePerOz: 1.5, image: '🥜' },
  { id: 'pecans', name: 'Candied Pecans', description: 'Brown sugar glazed pecans', pricePerOz: 1.8, image: '🌰' },
  { id: 'macadamia', name: 'Macadamia Nuts', description: 'Hawaiian macadamia, sea salt', pricePerOz: 2.5, image: '🥜' },
  { id: 'pistachios', name: 'Pistachios', description: 'Roasted & salted pistachios', pricePerOz: 1.6, image: '🌰' },
  { id: 'walnuts', name: 'Walnuts', description: 'California walnut halves', pricePerOz: 1.3, image: '🥜' },
  { id: 'mixed-premium', name: 'Premium Mix', description: 'Our signature blend of all nuts', pricePerOz: 1.7, image: '🌰' },
  { id: 'trail-mix', name: 'Trail Mix', description: 'Nuts, dried fruits & chocolate', pricePerOz: 1.4, image: '🥜' },
]

export const CONTAINER_PRICES: Record<ContainerType, Record<ContainerSize, number>> = {
  'wooden-box': { small: 24.99, medium: 39.99, large: 59.99 },
  'bamboo-container': { small: 19.99, medium: 34.99, large: 49.99 },
  'gift-tin': { small: 14.99, medium: 24.99, large: 39.99 },
}

export const CONTAINER_NUT_CAPACITY: Record<ContainerSize, number> = {
  small: 12,
  medium: 24,
  large: 36,
}

interface DesignState {
  step: number
  containerType: ContainerType
  containerSize: ContainerSize
  selectedNuts: { id: string; ounces: number }[]
  logoFile: string | null
  logoFileName: string | null
  engraveText: string
  logoScale: number
  logoX: number
  logoY: number
  setStep: (step: number) => void
  setContainerType: (type: ContainerType) => void
  setContainerSize: (size: ContainerSize) => void
  setSelectedNuts: (nuts: { id: string; ounces: number }[]) => void
  addNut: (id: string) => void
  removeNut: (id: string) => void
  updateNutOunces: (id: string, ounces: number) => void
  setLogoFile: (file: string | null, name?: string) => void
  setEngraveText: (text: string) => void
  setLogoScale: (scale: number) => void
  setLogoPosition: (x: number, y: number) => void
  reset: () => void
  getTotalOunces: () => number
  getMaxOunces: () => number
  getPrice: () => number
}

export const useDesignStore = create<DesignState>((set, get) => ({
  step: 1,
  containerType: 'wooden-box',
  containerSize: 'medium',
  selectedNuts: [],
  logoFile: null,
  logoFileName: null,
  engraveText: '',
  logoScale: 1,
  logoX: 50,
  logoY: 50,

  setStep: (step) => set({ step }),
  setContainerType: (containerType) => set({ containerType }),
  setContainerSize: (containerSize) => set({ containerSize }),
  setSelectedNuts: (selectedNuts) => set({ selectedNuts }),

  addNut: (id) =>
    set((state) => ({
      selectedNuts: [...state.selectedNuts, { id, ounces: 4 }],
    })),

  removeNut: (id) =>
    set((state) => ({
      selectedNuts: state.selectedNuts.filter((n) => n.id !== id),
    })),

  updateNutOunces: (id, ounces) =>
    set((state) => ({
      selectedNuts: state.selectedNuts.map((n) =>
        n.id === id ? { ...n, ounces } : n
      ),
    })),

  setLogoFile: (logoFile, logoFileName) =>
    set({ logoFile, logoFileName: logoFileName ?? null }),

  setEngraveText: (engraveText) => set({ engraveText }),
  setLogoScale: (logoScale) => set({ logoScale }),
  setLogoPosition: (x, y) => set({ logoX: x, logoY: y }),

  reset: () =>
    set({
      step: 1,
      containerType: 'wooden-box',
      containerSize: 'medium',
      selectedNuts: [],
      logoFile: null,
      logoFileName: null,
      engraveText: '',
      logoScale: 1,
      logoX: 50,
      logoY: 50,
    }),

  getTotalOunces: () =>
    get().selectedNuts.reduce((sum, n) => sum + n.ounces, 0),

  getMaxOunces: () => CONTAINER_NUT_CAPACITY[get().containerSize],

  getPrice: () => {
    const base = CONTAINER_PRICES[get().containerType][get().containerSize]
    const nutCost = get().selectedNuts.reduce((sum, n) => {
      const nut = NUT_OPTIONS.find((o) => o.id === n.id)
      return sum + (nut ? nut.pricePerOz * n.ounces : 0)
    }, 0)
    const logoCost = get().logoFile ? 5.0 : 0
    return base + nutCost + logoCost
  },
}))
