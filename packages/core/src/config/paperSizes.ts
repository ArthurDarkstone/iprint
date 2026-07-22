/**
 * Paper size presets in mm, mirroring hiprint HiPrintlib paper constants.
 */
export const paperSizes: Record<string, { width: number, height: number }> = {
  A1: { width: 594, height: 841 },
  A2: { width: 420, height: 594 },
  A3: { width: 297, height: 420 },
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  A6: { width: 105, height: 148 },
  A7: { width: 74, height: 105 },
  A8: { width: 52, height: 74 },
  B1: { width: 707, height: 1000 },
  B2: { width: 500, height: 707 },
  B3: { width: 353, height: 500 },
  B4: { width: 250, height: 353 },
  B5: { width: 176, height: 250 },
  B6: { width: 125, height: 176 },
  B7: { width: 88, height: 125 },
  B8: { width: 62, height: 88 },
}

export function getPaperSize(name: string): { width: number, height: number } | undefined {
  return paperSizes[name.toUpperCase()]
}
