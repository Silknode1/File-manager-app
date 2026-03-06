import { create } from 'zustand'

export interface NutSelection {
  id: string
  name: string
  quantity: number
}

export interface CartItem {
  id: string
  productId: string
  productName: string
  containerType: 'wooden-box' | 'bamboo-container' | 'gift-tin'
  size: 'small' | 'medium' | 'large'
  nuts: NutSelection[]
  customLogo?: string
  customLogoName?: string
  engraveText?: string
  quantity: number
  unitPrice: number
  image: string
}

interface CartStore {
  items: CartItem[]
  isCartOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isCartOpen: false,

  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
      ),
    })),

  clearCart: () => set({ items: [] }),

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  setCartOpen: (open) => set({ isCartOpen: open }),

  getTotal: () =>
    get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),

  getItemCount: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),
}))
