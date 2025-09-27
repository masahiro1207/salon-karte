import { db } from '../firebase'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import {
  validateCustomer,
  validateReservation,
  validateSale,
  validateHistory,
  checkDataIntegrity
} from '../utils/validation'

/**
 * 顧客データを中心とした統合サービス
 * 顧客データの変更時に予約、売上、履歴データを自動同期
 */
class CustomerService {
  constructor() {
    this.customersCollection = collection(db, 'customers')
    this.reservationsCollection = collection(db, 'reservations')
    this.salesCollection = collection(db, 'sales')
    this.historiesCollection = collection(db, 'histories')
  }

  /**
   * 顧客データを作成し、関連データの整合性を保つ
   */
  async createCustomer(customerData) {
    try {
      // バリデーション
      const validation = validateCustomer(customerData)
      if (!validation.isValid) {
        throw new Error(`バリデーションエラー: ${validation.errors.join(', ')}`)
      }

      const batch = writeBatch(db)

      // 顧客データの準備
      const customerRef = doc(this.customersCollection)
      const customerDoc = {
        ...customerData,
        id: customerRef.id,
        createAt: serverTimestamp(),
        lastVisit: null,
        totalVisits: 0,
        totalAmount: 0
      }

      batch.set(customerRef, customerDoc)
      await batch.commit()

      return customerDoc
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  /**
   * 顧客データを更新し、関連データを同期
   */
  async updateCustomer(customerId, updateData) {
    try {
      const batch = writeBatch(db)

      // 顧客データを更新
      const customerRef = doc(this.customersCollection, customerId)
      batch.update(customerRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      })

      // 関連する予約データの顧客名を更新
      const reservationsQuery = query(
        this.reservationsCollection,
        where('customerId', '==', customerId)
      )
      const reservationsSnapshot = await getDocs(reservationsQuery)

      reservationsSnapshot.forEach((reservationDoc) => {
        const reservationRef = doc(this.reservationsCollection, reservationDoc.id)
        batch.update(reservationRef, {
          customerName: `${updateData.lastName || ''} ${updateData.firstName || ''}`.trim(),
          updatedAt: serverTimestamp()
        })
      })

      // 関連する売上データの顧客名を更新
      const salesQuery = query(
        this.salesCollection,
        where('customerId', '==', customerId)
      )
      const salesSnapshot = await getDocs(salesQuery)

      salesSnapshot.forEach((saleDoc) => {
        const saleRef = doc(this.salesCollection, saleDoc.id)
        batch.update(saleRef, {
          customerName: `${updateData.lastName || ''} ${updateData.firstName || ''}`.trim(),
          updatedAt: serverTimestamp()
        })
      })

      // 関連する履歴データの顧客名を更新
      const historiesQuery = query(
        this.historiesCollection,
        where('customerId', '==', customerId)
      )
      const historiesSnapshot = await getDocs(historiesQuery)

      historiesSnapshot.forEach((historyDoc) => {
        const historyRef = doc(this.historiesCollection, historyDoc.id)
        batch.update(historyRef, {
          customerName: `${updateData.lastName || ''} ${updateData.firstName || ''}`.trim(),
          updatedAt: serverTimestamp()
        })
      })

      await batch.commit()

      return { success: true, message: '顧客データと関連データを更新しました' }
    } catch (error) {
      console.error('Error updating customer:', error)
      throw error
    }
  }

  /**
   * 顧客データを削除し、関連データの処理
   */
  async deleteCustomer(customerId) {
    try {
      // 関連データの確認
      const [reservationsSnapshot, salesSnapshot, historiesSnapshot] = await Promise.all([
        getDocs(query(this.reservationsCollection, where('customerId', '==', customerId))),
        getDocs(query(this.salesCollection, where('customerId', '==', customerId))),
        getDocs(query(this.historiesCollection, where('customerId', '==', customerId)))
      ])

      if (reservationsSnapshot.size > 0 || salesSnapshot.size > 0 || historiesSnapshot.size > 0) {
        throw new Error('関連する予約、売上、履歴データが存在するため削除できません')
      }

      // 顧客データを削除
      await deleteDoc(doc(this.customersCollection, customerId))

      return { success: true, message: '顧客データを削除しました' }
    } catch (error) {
      console.error('Error deleting customer:', error)
      throw error
    }
  }

  /**
   * 予約を作成し、顧客データを更新
   */
  async createReservation(reservationData) {
    try {
      // バリデーション
      const validation = validateReservation(reservationData)
      if (!validation.isValid) {
        throw new Error(`バリデーションエラー: ${validation.errors.join(', ')}`)
      }

      const batch = writeBatch(db)

      // 予約データを作成
      const reservationRef = doc(this.reservationsCollection)
      const reservationDoc = {
        ...reservationData,
        id: reservationRef.id,
        createAt: serverTimestamp()
      }
      batch.set(reservationRef, reservationDoc)

      // 顧客の最終来店日を更新（予約日時を設定）
      if (reservationData.customerId) {
        const customerRef = doc(this.customersCollection, reservationData.customerId)
        batch.update(customerRef, {
          lastReservation: reservationData.dateTime,
          updatedAt: serverTimestamp()
        })
      }

      await batch.commit()
      return reservationDoc
    } catch (error) {
      console.error('Error creating reservation:', error)
      throw error
    }
  }

  /**
   * 売上を作成し、顧客データを更新
   */
  async createSale(saleData) {
    try {
      // バリデーション
      const validation = validateSale(saleData)
      if (!validation.isValid) {
        throw new Error(`バリデーションエラー: ${validation.errors.join(', ')}`)
      }

      const batch = writeBatch(db)

      // 顧客名を取得
      let customerName = saleData.customerName || ''
      if (saleData.customerId && !customerName) {
        const customerDoc = await getDoc(doc(this.customersCollection, saleData.customerId))
        if (customerDoc.exists()) {
          const customerData = customerDoc.data()
          customerName = `${customerData.lastName || ''} ${customerData.firstName || ''}`.trim()
        }
      }

      // 売上データを作成
      const saleRef = doc(this.salesCollection)
      const saleDoc = {
        ...saleData,
        customerName: customerName,
        id: saleRef.id,
        createAt: serverTimestamp()
      }
      batch.set(saleRef, saleDoc)

      // 顧客の統計情報を更新
      if (saleData.customerId) {
        const customerRef = doc(this.customersCollection, saleData.customerId)

        // 既存の顧客データを取得
        const customerDoc = await getDoc(customerRef)
        const customerData = customerDoc.data()

        batch.update(customerRef, {
          lastVisit: saleData.dateTime,
          totalVisits: (customerData.totalVisits || 0) + 1,
          totalAmount: (customerData.totalAmount || 0) + (saleData.price || 0),
          updatedAt: serverTimestamp()
        })
      }

      await batch.commit()
      return saleDoc
    } catch (error) {
      console.error('Error creating sale:', error)
      throw error
    }
  }

  /**
   * 履歴を作成し、顧客データを更新
   */
  async createHistory(historyData) {
    try {
      // バリデーション
      const validation = validateHistory(historyData)
      if (!validation.isValid) {
        throw new Error(`バリデーションエラー: ${validation.errors.join(', ')}`)
      }

      const batch = writeBatch(db)

      // 顧客名を取得
      let customerName = historyData.customerName || ''
      if (historyData.customerId && !customerName) {
        const customerDoc = await getDoc(doc(this.customersCollection, historyData.customerId))
        if (customerDoc.exists()) {
          const customerData = customerDoc.data()
          customerName = `${customerData.lastName || ''} ${customerData.firstName || ''}`.trim()
        }
      }

      // 履歴データを作成
      const historyRef = doc(this.historiesCollection)
      const historyDoc = {
        ...historyData,
        customerName: customerName,
        id: historyRef.id,
        createAt: serverTimestamp()
      }
      batch.set(historyRef, historyDoc)

      // 売上データも同時に作成
      const saleRef = doc(this.salesCollection)
      const saleDoc = {
        ...historyData,
        customerName: customerName,
        historyId: historyRef.id, // 履歴IDを追加
        id: saleRef.id,
        createAt: serverTimestamp()
      }
      batch.set(saleRef, saleDoc)

      // 顧客の統計情報を更新
      if (historyData.customerId) {
        const customerRef = doc(this.customersCollection, historyData.customerId)

        // 既存の顧客データを取得
        const customerDoc = await getDoc(customerRef)
        const customerData = customerDoc.data()

        batch.update(customerRef, {
          lastVisit: historyData.dateTime,
          totalVisits: (customerData.totalVisits || 0) + 1,
          totalAmount: (customerData.totalAmount || 0) + (historyData.price || 0),
          updatedAt: serverTimestamp()
        })
      }

      await batch.commit()
      return historyDoc
    } catch (error) {
      console.error('Error creating history:', error)
      throw error
    }
  }

  /**
   * 顧客の完全な情報を取得（統計情報含む）
   */
  async getCustomerWithStats(customerId) {
    try {
      const customerDoc = await getDoc(doc(this.customersCollection, customerId))
      if (!customerDoc.exists()) {
        throw new Error('顧客が見つかりません')
      }

      const customerData = customerDoc.data()

      // 関連データを取得
      const [reservationsSnapshot, salesSnapshot, historiesSnapshot] = await Promise.all([
        getDocs(query(this.reservationsCollection, where('customerId', '==', customerId))),
        getDocs(query(this.salesCollection, where('customerId', '==', customerId))),
        getDocs(query(this.historiesCollection, where('customerId', '==', customerId)))
      ])

      return {
        ...customerData,
        reservations: reservationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        sales: salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        histories: historiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      }
    } catch (error) {
      console.error('Error getting customer with stats:', error)
      throw error
    }
  }

  /**
   * 全顧客の一覧を取得（統計情報含む）
   */
  async getAllCustomers() {
    try {
      const customersSnapshot = await getDocs(
        query(this.customersCollection, orderBy('lastNameKana', 'asc'))
      )

      return customersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error getting all customers:', error)
      throw error
    }
  }

  /**
   * データの整合性をチェック
   */
  async checkDataIntegrity(customerId) {
    return await checkDataIntegrity(customerId, this)
  }

  /**
   * データの整合性を修復
   */
  async repairDataIntegrity(customerId) {
    try {
      const customer = await this.getCustomerWithStats(customerId)
      const expectedName = `${customer.lastName || ''} ${customer.firstName || ''}`.trim()

      const batch = writeBatch(db)
      let repairCount = 0

      // 予約データの顧客名を修復
      customer.reservations.forEach((reservation) => {
        if (reservation.customerName !== expectedName) {
          const reservationRef = doc(this.reservationsCollection, reservation.id)
          batch.update(reservationRef, {
            customerName: expectedName,
            updatedAt: serverTimestamp()
          })
          repairCount++
        }
      })

      // 売上データの顧客名を修復
      customer.sales.forEach((sale) => {
        if (sale.customerName !== expectedName) {
          const saleRef = doc(this.salesCollection, sale.id)
          batch.update(saleRef, {
            customerName: expectedName,
            updatedAt: serverTimestamp()
          })
          repairCount++
        }
      })

      // 履歴データの顧客名を修復
      customer.histories.forEach((history) => {
        if (history.customerName !== expectedName) {
          const historyRef = doc(this.historiesCollection, history.id)
          batch.update(historyRef, {
            customerName: expectedName,
            updatedAt: serverTimestamp()
          })
          repairCount++
        }
      })

      if (repairCount > 0) {
        await batch.commit()
        return { success: true, repairedCount: repairCount }
      }

      return { success: true, repairedCount: 0 }
    } catch (error) {
      console.error('Error repairing data integrity:', error)
      throw error
    }
  }
}

export default new CustomerService()
