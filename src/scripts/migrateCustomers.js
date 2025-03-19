import { db } from '../firebase'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'

const migrateCustomers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'customers'))

    for (const document of querySnapshot.docs) {
      const data = document.data()

      // 既に移行済みの場合はスキップ
      if (data.lastName && data.firstName) {
        console.log(`Customer ${document.id} is already migrated`)
        continue
      }

      // 名前を姓と名に分割
      const nameParts = data.name.split(' ')
      const lastName = nameParts[0] || ''
      const firstName = nameParts.slice(1).join(' ') || ''

      // カナを姓と名に分割
      const kanaParts = data.kana.split(' ')
      const lastNameKana = kanaParts[0] || ''
      const firstNameKana = kanaParts.slice(1).join(' ') || ''

      // データを更新
      await updateDoc(doc(db, 'customers', document.id), {
        lastName,
        firstName,
        lastNameKana,
        firstNameKana,
        // 古いフィールドは残しておく（後で削除可能）
        // name: data.name,
        // kana: data.kana,
      })

      console.log(`Migrated customer ${document.id}: ${lastName} ${firstName}`)
    }

    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Error during migration:', error)
  }
}

// スクリプトを実行
migrateCustomers()
