const admin = require('firebase-admin')
const path = require('path')

// サービスアカウントの初期化
const serviceAccount = require(path.join(__dirname, '../../service-account-key.json'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'salon-chillo'
})

const db = admin.firestore()

const migrateCustomers = async () => {
  try {
    const customersRef = db.collection('customers')
    const querySnapshot = await customersRef.get()

    let migratedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const doc of querySnapshot.docs) {
      const data = doc.data()

      // 既に新しい形式のデータの場合はスキップ
      if (data.lastName && data.firstName) {
        skippedCount++
        continue
      }

      // 古い形式のデータを新しい形式に変換
      if (data.name && data.kana) {
        try {
          // 名前を姓と名に分割（スペースで区切られている場合）
          const nameParts = data.name.split(' ')
          const lastName = nameParts[0] || ''
          const firstName = nameParts[1] || ''

          // カナを姓と名に分割（スペースで区切られている場合）
          const kanaParts = data.kana.split(' ')
          const lastNameKana = kanaParts[0] || ''
          const firstNameKana = kanaParts[1] || ''

          // 新しい形式でデータを更新
          await doc.ref.update({
            lastName,
            firstName,
            lastNameKana,
            firstNameKana,
            // 古いフィールドは削除しない（バックアップとして残す）
          })

          migratedCount++
          console.log(`Migrated customer: ${doc.id}`)
        } catch (error) {
          console.error(`Error migrating customer ${doc.id}:`, error)
          errorCount++
        }
      }
    }

    console.log('Migration completed:')
    console.log(`- Migrated: ${migratedCount} customers`)
    console.log(`- Skipped: ${skippedCount} customers`)
    console.log(`- Errors: ${errorCount} customers`)
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// スクリプトを実行
migrateCustomers()
