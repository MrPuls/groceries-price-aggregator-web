export interface ProductItem {
  name: string
  availableStores: string[]
  storeIdMap: Record<string, number>
  imageUrl?: string
}
