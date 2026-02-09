export interface Series {
  id: string
  userId: string
  title: string
  url: string
  platform: string
  coverImage?: string
  createdAt: string
  updatedAt: string
}

export const createSeries = (overrides?: Partial<Series>): Series => ({
  id: 'series-123',
  userId: 'user-123',
  title: 'Test Manga Series',
  url: 'https://example.com/manga/test',
  platform: 'mangadex',
  coverImage: 'https://example.com/cover.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createSeriesList = (count: number, overrides?: Partial<Series>): Series[] => {
  return Array.from({ length: count }, (_, i) =>
    createSeries({
      id: `series-${i + 1}`,
      title: `Test Series ${i + 1}`,
      url: `https://example.com/manga/series-${i + 1}`,
      ...overrides,
    }),
  )
}
