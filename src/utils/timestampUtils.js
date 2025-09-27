/**
 * FirestoreのTimestampオブジェクトを安全に処理するユーティリティ関数
 */

/**
 * 様々な形式の日時データをJavaScriptのDateオブジェクトに変換
 * @param {any} dateTime - 変換する日時データ
 * @returns {Date|null} 変換されたDateオブジェクト、変換できない場合はnull
 */
export const safeToDate = (dateTime) => {
  if (!dateTime) return null

  try {
    // FirestoreのTimestampオブジェクトの場合
    if (dateTime && typeof dateTime.toDate === 'function') {
      return dateTime.toDate()
    }

    // FirestoreのTimestampオブジェクトの構造を持つ場合（シリアライズされた状態）
    if (dateTime && typeof dateTime === 'object' && 'seconds' in dateTime) {
      return new Date(dateTime.seconds * 1000 + (dateTime.nanoseconds || 0) / 1000000)
    }

    // 文字列の場合
    if (typeof dateTime === 'string') {
      const date = new Date(dateTime)
      return isNaN(date.getTime()) ? null : date
    }

    // 数値の場合（タイムスタンプ）
    if (typeof dateTime === 'number') {
      const date = new Date(dateTime)
      return isNaN(date.getTime()) ? null : date
    }

    // 既にDateオブジェクトの場合
    if (dateTime instanceof Date) {
      return isNaN(dateTime.getTime()) ? null : dateTime
    }

    // その他のオブジェクトの場合
    if (typeof dateTime === 'object') {
      const date = new Date(dateTime)
      return isNaN(date.getTime()) ? null : date
    }

    return null
  } catch (error) {
    console.warn('日時の変換エラー:', error, dateTime)
    return null
  }
}

/**
 * 日時データを安全にフォーマット
 * @param {any} dateTime - フォーマットする日時データ
 * @param {string} format - フォーマット形式（'YYYY-MM-DD' または 'YYYY-MM-DD HH:mm'）
 * @returns {string} フォーマットされた日時文字列
 */
export const safeFormatDate = (dateTime, format = 'YYYY-MM-DD') => {
  const date = safeToDate(dateTime)
  if (!date) return ''

  try {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')

    if (format === 'YYYY-MM-DD') {
      return `${year}-${month}-${day}`
    } else if (format === 'YYYY-MM-DD HH:mm') {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }

    return `${year}-${month}-${day}`
  } catch (error) {
    console.warn('日時のフォーマットエラー:', error, dateTime)
    return ''
  }
}

/**
 * 2つの日時データを安全に比較
 * @param {any} dateTime1 - 比較する日時データ1
 * @param {any} dateTime2 - 比較する日時データ2
 * @returns {number} 比較結果（-1: dateTime1 < dateTime2, 0: 等しい, 1: dateTime1 > dateTime2）
 */
export const safeCompareDates = (dateTime1, dateTime2) => {
  const date1 = safeToDate(dateTime1)
  const date2 = safeToDate(dateTime2)

  if (!date1 && !date2) return 0
  if (!date1) return -1
  if (!date2) return 1

  return date1.getTime() - date2.getTime()
}

/**
 * 日時データが有効かどうかをチェック
 * @param {any} dateTime - チェックする日時データ
 * @returns {boolean} 有効な場合true
 */
export const isValidDateTime = (dateTime) => {
  return safeToDate(dateTime) !== null
}
