const admin = require('firebase-admin')
const path = require('path')

// サービスアカウントの初期化
const serviceAccount = require(path.join(__dirname, '../../service-account-key.json'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'salon-chillo'
})

const db = admin.firestore()

const fixCustomerKana = async () => {
  try {
    const customersRef = db.collection('customers')
    const querySnapshot = await customersRef.get()

    let fixedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const doc of querySnapshot.docs) {
      const data = doc.data()

      // 既に正しい形式の場合はスキップ
      if (data.lastNameKana && data.firstNameKana &&
          data.lastNameKana !== data.kana &&
          data.firstNameKana !== data.kana) {
        skippedCount++
        continue
      }

      // カナを姓と名に分割
      if (data.kana) {
        try {
          const kanaParts = data.kana.split('　')
          const lastNameKana = kanaParts[0] || ''
          const firstNameKana = kanaParts[1] || ''

          // カナフィールドを更新
          await doc.ref.update({
            lastNameKana,
            firstNameKana,
          })

          fixedCount++
          console.log(`Fixed customer: ${doc.id} (${lastNameKana} ${firstNameKana})`)
        } catch (error) {
          console.error(`Error fixing customer ${doc.id}:`, error)
          errorCount++
        }
      }
    }

    console.log('Fix completed:')
    console.log(`- Fixed: ${fixedCount} customers`)
    console.log(`- Skipped: ${skippedCount} customers`)
    console.log(`- Errors: ${errorCount} customers`)
  } catch (error) {
    console.error('Fix failed:', error)
  }
}

// スクリプトを実行
fixCustomerKana()
