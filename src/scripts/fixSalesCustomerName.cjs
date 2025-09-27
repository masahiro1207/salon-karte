const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } = require('firebase/firestore');

// Firebase設定
const firebaseConfig = {
  // ここにFirebase設定を追加
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixSalesCustomerName() {
  try {
    console.log('売上データの顧客名修復を開始します...');

    // 顧客データを取得
    const customersSnapshot = await getDocs(collection(db, 'customers'));
    const customerMap = {};

    customersSnapshot.forEach((doc) => {
      const data = doc.data();
      customerMap[doc.id] = `${data.lastName || ''} ${data.firstName || ''}`.trim();
    });

    console.log(`${customersSnapshot.size}件の顧客データを取得しました`);

    // 売上データを取得
    const salesSnapshot = await getDocs(collection(db, 'sales'));
    const salesToUpdate = [];

    salesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.customerName && data.customerId && customerMap[data.customerId]) {
        salesToUpdate.push({
          id: doc.id,
          customerId: data.customerId,
          customerName: customerMap[data.customerId]
        });
      }
    });

    console.log(`${salesToUpdate.length}件の売上データを修復します`);

    if (salesToUpdate.length === 0) {
      console.log('修復が必要な売上データはありません');
      return;
    }

    // バッチで更新
    const batch = writeBatch(db);
    let updateCount = 0;

    for (const sale of salesToUpdate) {
      const saleRef = doc(db, 'sales', sale.id);
      batch.update(saleRef, {
        customerName: sale.customerName,
        updatedAt: new Date()
      });
      updateCount++;

      // バッチサイズ制限（Firestoreの制限は500件）
      if (updateCount >= 500) {
        await batch.commit();
        console.log(`${updateCount}件を更新しました`);
        updateCount = 0;
      }
    }

    // 残りの更新をコミット
    if (updateCount > 0) {
      await batch.commit();
      console.log(`残り${updateCount}件を更新しました`);
    }

    console.log(`売上データの顧客名修復が完了しました。合計${salesToUpdate.length}件を更新しました`);

  } catch (error) {
    console.error('修復中にエラーが発生しました:', error);
  }
}

// スクリプト実行
if (require.main === module) {
  fixSalesCustomerName().then(() => {
    console.log('修復スクリプトが完了しました');
    process.exit(0);
  }).catch((error) => {
    console.error('スクリプト実行エラー:', error);
    process.exit(1);
  });
}

module.exports = { fixSalesCustomerName };
