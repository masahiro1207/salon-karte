/**
 * 会計・履歴の来店日の「年-月」に対応する Goodnotes 共有リンク。
 * キーは yyyy-mm（ローカル日付）。未登録の月は CustomerHistory でグレーアウト。
 */
export const GOODNOTES_MONTH_LINKS = {
  '2026-03': 'https://web.goodnotes.com/s/05ZpLOeu42zYb2NceRAMZQ',
  '2026-04': 'https://share.goodnotes.com/s/mOOIQf6LQmwkwpNMdi1IBS',
  '2026-05': 'https://web.goodnotes.com/s/URKZeKK8TQHJzzBgx8Jp8U',
  '2026-06': 'https://web.goodnotes.com/s/rSphC24LulRXRzqyyRt2mm',
  '2026-07': 'https://web.goodnotes.com/s/ejs74Eqyap5jNMLel8y0TT',
  '2026-08': 'https://web.goodnotes.com/s/tFWorz4MiAVwB9qDtIJ5N7',
  '2026-09': 'https://web.goodnotes.com/s/NxOKSE4y9HllfzSrIFVntk',
  '2026-10': 'https://web.goodnotes.com/s/1dbkCW7nuUJ6wCgRf6Bj8k',
  '2026-11': 'https://web.goodnotes.com/s/ttegoUBUH6FNm5jW2VikdB',
  '2026-12': 'https://share.goodnotes.com/s/khuF7xASZRjPmim1alVuUO',
}

function toDate(dateTime) {
  if (!dateTime) return null
  if (typeof dateTime.toDate === 'function') return dateTime.toDate()
  if (typeof dateTime === 'object' && dateTime !== null && 'seconds' in dateTime) {
    return new Date(dateTime.seconds * 1000)
  }
  const d = new Date(dateTime)
  return Number.isNaN(d.getTime()) ? null : d
}

/** @returns {string | null} */
export function getGoodnotesUrlForDateTime(dateTime) {
  const d = toDate(dateTime)
  if (!d) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const key = `${y}-${m}`
  return GOODNOTES_MONTH_LINKS[key] ?? null
}
