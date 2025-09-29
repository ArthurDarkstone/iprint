/**
 * Unit conversion utilities for iprint
 */

export class DpiCalculator {
  private dpi = 0

  getDpi(): number {
    if (!this.dpi) {
      const testDiv = document.createElement('DIV')
      testDiv.style.cssText = 'width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden'
      document.body.appendChild(testDiv)
      this.dpi = testDiv.offsetHeight
      document.body.removeChild(testDiv)
    }
    return this.dpi
  }
}

export class PtConverter extends DpiCalculator {
  toPx(pt: number): number {
    return pt * (this.getDpi() / 72)
  }
}

export class PxConverter extends DpiCalculator {
  toPt(px: number): number {
    return px * (72 / this.getDpi())
  }
}

export class MmConverter {
  toPt(mm: number): number {
    return (72 / 25.4) * mm
  }

  toPx(mm: number): number {
    return new PtConverter().toPx(this.toPt(mm))
  }
}

export const pt: PtConverter = new PtConverter()
export const px: PxConverter = new PxConverter()
export const mm: MmConverter = new MmConverter()
