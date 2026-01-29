/**
 * データの整合性を保つためのバリデーション機能
 */

/**
 * 顧客データのバリデーション
 */
export const validateCustomer = (customerData) => {
  const errors = []

  // 必須フィールドのチェック
  if (!customerData.lastName?.trim()) {
    errors.push('姓は必須です')
  }
  if (!customerData.firstName?.trim()) {
    errors.push('名は必須です')
  }
  if (!customerData.lastNameKana?.trim()) {
    errors.push('姓（フリガナ）は必須です')
  }
  if (!customerData.firstNameKana?.trim()) {
    errors.push('名（フリガナ）は必須です')
  }

  // フリガナの形式チェック
  const kanaRegex = /^[ァ-ヶー\s]+$/
  if (customerData.lastNameKana && !kanaRegex.test(customerData.lastNameKana)) {
    errors.push('姓（フリガナ）はカタカナで入力してください')
  }
  if (customerData.firstNameKana && !kanaRegex.test(customerData.firstNameKana)) {
    errors.push('名（フリガナ）はカタカナで入力してください')
  }

  // 電話番号の形式チェック
  if (customerData.phone) {
    const phoneRegex = /^[0-9-+()\s]+$/
    if (!phoneRegex.test(customerData.phone)) {
      errors.push('電話番号の形式が正しくありません')
    }
  }

  // 文字数制限
  if (customerData.lastName && customerData.lastName.length > 50) {
    errors.push('姓は50文字以内で入力してください')
  }
  if (customerData.firstName && customerData.firstName.length > 50) {
    errors.push('名は50文字以内で入力してください')
  }
  if (customerData.notes && customerData.notes.length > 500) {
    errors.push('備考は500文字以内で入力してください')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 予約データのバリデーション
 */
export const validateReservation = (reservationData) => {
  const errors = []

  // 必須フィールドのチェック
  if (!reservationData.customerId) {
    errors.push('顧客を選択してください')
  }
  if (!reservationData.dateTime) {
    errors.push('日時を選択してください')
  }
  if (!reservationData.menu?.trim()) {
    errors.push('メニューを選択してください')
  }

  // 日時の妥当性チェック
  if (reservationData.dateTime) {
    const reservationDate = new Date(reservationData.dateTime)
    const now = new Date()

    // 過去の日時でないかチェック（過去1時間以内は許可）
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    if (reservationDate < oneHourAgo) {
      errors.push('過去の日時は選択できません')
    }

    // 1年先より先の日時でないかチェック
    const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
    if (reservationDate > oneYearLater) {
      errors.push('1年先より先の日時は選択できません')
    }
  }

  // 備考の文字数制限
  if (reservationData.notes && reservationData.notes.length > 500) {
    errors.push('備考は500文字以内で入力してください')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 売上データのバリデーション
 */
export const validateSale = (saleData) => {
  const errors = []

  // 必須フィールドのチェック
  if (!saleData.customerId) {
    errors.push('顧客を選択してください')
  }
  if (!saleData.dateTime) {
    errors.push('日時を選択してください')
  }
  if (!saleData.menu?.trim()) {
    errors.push('メニューを選択してください')
  }

  // 価格の妥当性チェック
  if (saleData.price !== null && saleData.price !== undefined) {
    const price = Number(saleData.price)
    if (isNaN(price) || price < 0) {
      errors.push('価格は0以上の数値で入力してください')
    }
    if (price > 1000000) {
      errors.push('価格は1,000,000円以下で入力してください')
    }
  }

  // 割引の妥当性チェック
  if (saleData.discount !== null && saleData.discount !== undefined) {
    const discount = Number(saleData.discount)
    if (isNaN(discount) || discount < 0) {
      errors.push('割引は0以上の数値で入力してください')
    }
    if (discount > 100) {
      errors.push('割引は100%以下で入力してください')
    }
  }

  // 商品データの妥当性チェック
  if (saleData.products && Array.isArray(saleData.products)) {
    saleData.products.forEach((product, index) => {
      if (product.name?.trim() && (!product.count || product.count <= 0)) {
        errors.push(`商品${index + 1}の個数は1以上で入力してください`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 履歴データのバリデーション
 */
export const validateHistory = (historyData) => {
  const errors = []

  // 必須フィールドのチェック
  if (!historyData.customerId) {
    errors.push('顧客IDが指定されていません')
  }
  if (!historyData.dateTime) {
    errors.push('日時を選択してください')
  }
  if (!historyData.menu?.trim()) {
    errors.push('メニューを選択してください')
  }

  // 価格の必須 & 妥当性チェック（0はOK）
  const isPriceMissing =
    historyData.price === null || historyData.price === undefined || historyData.price === ''
  if (isPriceMissing) {
    errors.push('料金を入力してください')
  } else {
    const price = Number(historyData.price)
    if (isNaN(price) || price < 0) {
      errors.push('価格は0以上の数値で入力してください')
    }
    if (price > 1000000) {
      errors.push('価格は1,000,000円以下で入力してください')
    }
  }

  // 支払い方法の妥当性チェック
  const validPaymentMethods = ['現金', 'クレジットカード', '電子マネー', '銀行振込', 'その他']
  if (historyData.paymentMethod && !validPaymentMethods.includes(historyData.paymentMethod)) {
    errors.push('支払い方法が正しくありません')
  }

  // 商品データの妥当性チェック
  if (historyData.products && Array.isArray(historyData.products)) {
    historyData.products.forEach((product, index) => {
      if (product.name?.trim() && (!product.count || product.count <= 0)) {
        errors.push(`商品${index + 1}の個数は1以上で入力してください`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 重複チェック用の顧客データ比較
 */
export const compareCustomers = (customer1, customer2) => {
  // 姓名の完全一致
  const nameMatch =
    customer1.lastName === customer2.lastName &&
    customer1.firstName === customer2.firstName

  // カナの完全一致
  const kanaMatch =
    customer1.lastNameKana === customer2.lastNameKana &&
    customer1.firstNameKana === customer2.firstNameKana

  // 電話番号の一致（両方入力されている場合のみ）
  const phoneMatch =
    customer1.phone &&
    customer2.phone &&
    customer1.phone === customer2.phone

  return {
    nameMatch,
    kanaMatch,
    phoneMatch,
    isDuplicate: nameMatch || kanaMatch || phoneMatch
  }
}

/**
 * データの整合性チェック
 */
export const checkDataIntegrity = async (customerId, customerService) => {
  try {
    const customer = await customerService.getCustomerWithStats(customerId)
    const issues = []

    // 顧客名の整合性チェック
    const expectedName = `${customer.lastName || ''} ${customer.firstName || ''}`.trim()

    // 予約データの顧客名チェック
    customer.reservations.forEach((reservation, index) => {
      if (reservation.customerName !== expectedName) {
        issues.push(`予約${index + 1}の顧客名が一致しません`)
      }
    })

    // 売上データの顧客名チェック
    customer.sales.forEach((sale, index) => {
      if (sale.customerName !== expectedName) {
        issues.push(`売上${index + 1}の顧客名が一致しません`)
      }
    })

    // 履歴データの顧客名チェック
    customer.histories.forEach((history, index) => {
      if (history.customerName !== expectedName) {
        issues.push(`履歴${index + 1}の顧客名が一致しません`)
      }
    })

    return {
      isValid: issues.length === 0,
      issues
    }
  } catch (error) {
    console.error('Data integrity check failed:', error)
    return {
      isValid: false,
      issues: ['データの整合性チェックに失敗しました']
    }
  }
}
