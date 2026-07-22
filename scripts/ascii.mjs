import sharp from 'sharp'

const file = process.argv[2] || 'scripts/shot-full.png'
const cols = Number(process.argv[3]) || 160
const chars = ' .:-=+*#%@'

const img = sharp(file).flatten({ background: '#fff' })
const meta = await img.metadata()
const rows = Math.max(1, Math.round(cols * (meta.height / meta.width) * 0.45))
const resized = await img.resize(cols, rows * 2, { fit: 'fill' }).raw().ensureAlpha().toBuffer({ resolveWithObject: true })

const { data, info } = resized
let out = ''
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * 4
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    const idx = Math.min(chars.length - 1, Math.floor((1 - lum) * (chars.length - 1)))
    out += chars[idx]
  }
  out += '\n'
}
console.log(out)
