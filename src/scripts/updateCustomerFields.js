import { db } from '../firebase'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'

const updateCustomerFields = async () => {
  try {
    // 顧客コレクションを取得
    const querySnapshot = await getDocs(collection(db, 'customers'))

    // 更新対象の顧客数をカウント
    let updateCount = 0

    // 各顧客データを更新
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data()

      // lastNameとfirstNameが存在する場合のみ更新
      if (data.lastName || data.firstName) {
        const name = `${data.lastName || ''}${data.firstName || ''}`
        const kana = `${data.lastNameKana || ''}${data.firstNameKana || ''}`

        // 更新データを準備
        const updateData = {
          name,
          kana,
        }

        // 更新を実行
        await updateDoc(doc(db, 'customers', docSnapshot.id), updateData)
        updateCount++

        console.log(`Updated customer: ${docSnapshot.id}`, {
          name,
          kana,
        })
      }
    }

    console.log(`Update completed. Updated ${updateCount} customers.`)
  } catch (error) {
    console.error('Error updating customer fields:', error)
  }
}

// スクリプトを実行
updateCustomerFields()
