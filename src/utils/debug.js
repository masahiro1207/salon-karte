/**
 * デバッグ用のユーティリティ関数
 */

import customerService from '../services/customerService'

/**
 * システムの状態を確認する
 */
export const checkSystemStatus = async () => {
  try {
    console.log('🔍 システム状態を確認中...')

    // 顧客データの取得
    const customers = await customerService.getAllCustomers()
    console.log(`📊 顧客数: ${customers.length}`)

    // 各顧客の統計情報を表示
    for (const customer of customers.slice(0, 3)) { // 最初の3人のみ表示
      const stats = await customerService.getCustomerWithStats(customer.id)
      console.log(`👤 ${customer.lastName}${customer.firstName}:`, {
        来店回数: stats.totalVisits || 0,
        総売上: stats.totalAmount || 0,
        予約数: stats.reservations?.length || 0,
        売上数: stats.sales?.length || 0,
        履歴数: stats.histories?.length || 0
      })
    }

    console.log('✅ システム状態確認完了')
    return { success: true, customerCount: customers.length }
  } catch (error) {
    console.error('❌ システム状態確認エラー:', error)
    return { success: false, error: error.message }
  }
}

/**
 * データの整合性をチェックする
 */
export const checkDataIntegrity = async () => {
  try {
    console.log('🔍 データ整合性をチェック中...')

    const customers = await customerService.getAllCustomers()
    let totalIssues = 0

    for (const customer of customers) {
      const integrity = await customerService.checkDataIntegrity(customer.id)
      if (!integrity.isValid) {
        console.warn(`⚠️ 顧客 ${customer.lastName}${customer.firstName} に問題があります:`, integrity.issues)
        totalIssues += integrity.issues.length
      }
    }

    if (totalIssues === 0) {
      console.log('✅ データ整合性チェック完了 - 問題なし')
    } else {
      console.log(`⚠️ データ整合性チェック完了 - ${totalIssues}件の問題を発見`)
    }

    return { success: true, totalIssues }
  } catch (error) {
    console.error('❌ データ整合性チェックエラー:', error)
    return { success: false, error: error.message }
  }
}

/**
 * テスト用のサンプルデータを作成する
 */
export const createSampleData = async () => {
  try {
    console.log('🧪 サンプルデータを作成中...')

    // サンプル顧客を作成
    const sampleCustomer = await customerService.createCustomer({
      lastName: 'テスト',
      firstName: '太郎',
      lastNameKana: 'テスト',
      firstNameKana: 'タロウ',
      phone: '090-1234-5678',
      notes: 'テスト用の顧客データです'
    })

    console.log('✅ サンプル顧客を作成しました:', sampleCustomer.id)

    // サンプル予約を作成
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0)

    const sampleReservation = await customerService.createReservation({
      customerId: sampleCustomer.id,
      customerName: 'テスト 太郎',
      dateTime: tomorrow,
      menu: 'カット',
      service: 'カット',
      serviceId: 'cut-001',
      duration: 60,
      notes: 'テスト用の予約です'
    })

    console.log('✅ サンプル予約を作成しました:', sampleReservation.id)

    // サンプル売上を作成
    const sampleSale = await customerService.createSale({
      customerId: sampleCustomer.id,
      customerName: 'テスト 太郎',
      dateTime: new Date(),
      menu: 'カット',
      price: 3000,
      discount: 0,
      paymentMethod: '現金',
      products: [],
      notes: 'テスト用の売上です'
    })

    console.log('✅ サンプル売上を作成しました:', sampleSale.id)

    return { success: true, customerId: sampleCustomer.id }
  } catch (error) {
    console.error('❌ サンプルデータ作成エラー:', error)
    return { success: false, error: error.message }
  }
}

/**
 * デバッグ情報をコンソールに表示する
 */
export const showDebugInfo = () => {
  console.log('🔧 サロンカート デバッグ情報')
  console.log('使用方法:')
  console.log('  checkSystemStatus() - システム状態を確認')
  console.log('  checkDataIntegrity() - データ整合性をチェック')
  console.log('  createSampleData() - サンプルデータを作成')
  console.log('')
  console.log('例:')
  console.log('  import { checkSystemStatus } from "@/utils/debug"')
  console.log('  checkSystemStatus()')
}

// グローバルにデバッグ関数を公開（開発環境のみ）
if (import.meta.env.DEV) {
  window.debugSalonKarte = {
    checkSystemStatus,
    checkDataIntegrity,
    createSampleData,
    showDebugInfo
  }

  console.log('🔧 デバッグ機能が利用可能です。window.debugSalonKarte を確認してください。')
}
