export interface ReadingProgress {
  id: string
  userId: string
  seriesId: string
  chapter: number
  scrollPosition: number
  lastReadAt: string
  createdAt: string
  updatedAt: string
}

export const createReadingProgress = (
  overrides?: Partial<ReadingProgress>,
): ReadingProgress => ({
  id: 'progress-123',
  userId: 'user-123',
  seriesId: 'series-123',
  chapter: 5,
  scrollPosition: 0.5,
  lastReadAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createReadingProgressList = (
  count: number,
  overrides?: Partial<ReadingProgress>,
): ReadingProgress[] => {
  return Array.from({ length: count }, (_, i) =>
    createReadingProgress({
      id: `progress-${i + 1}`,
      seriesId: `series-${i + 1}`,
      chapter: i + 1,
      ...overrides,
    }),
  )
}
