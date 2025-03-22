<template>
  <div class="container mx-auto p-8 bg-white text-charcoal-black">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-charcoal-black">施術履歴</h2>
        <!-- 顧客名を表示 -->
        <p v-if="customerName" class="text-navy text-2xl">{{ customerName }}</p>
      </div>
      <div>
        <button
          @click="addHistory"
          class="bg-color3 hover:bg-light-gray m-3 px-5 py-3 rounded-md text-white text-sm"
        >
          履歴追加
        </button>
        <!-- 戻るボタンを追加 -->
        <button
          @click="goBack"
          class="bg-smoke-gray hover:bg-light-gray px-4 py-2 rounded-md text-charcoal-black"
        >
          戻る
        </button>
      </div>
    </div>
    <div v-if="histories.length > 0" class="overflow-x-auto">
      <table class="w-full border-collapse table-auto">
        <thead class="bg-color1 text-white">
          <tr>
            <th class="border border-gray-300 p-2 text-color3">日付</th>
            <th class="border border-gray-300 p-2 text-color3">メニュー</th>
            <th class="border border-gray-300 p-2 text-color3">担当者</th>
            <th class="border border-gray-300 p-2 text-color3">料金</th>
            <th class="border border-gray-300 p-2 text-color3">商品</th>
            <th class="border border-gray-300 p-2 text-color3">備考</th>
            <th class="border border-gray-300 p-2 text-color3">編集</th>
            <th class="border border-gray-300 p-2 text-color3">削除</th>
          </tr>
        </thead>
        <tbody class="text-charcoal-black">
          <tr v-for="history in histories" :key="history.id" class="hover-bg-opacity">
            <td class="border border-gray-300 p-2 text-center">
              {{ formatDate(history.dateTime) }}
            </td>
            <td class="border border-gray-300 p-2">{{ history.menu }}</td>
            <td class="border border-gray-300 p-2 text-center">{{ history.staff }}</td>
            <td class="border border-gray-300 p-2 text-right">
              {{ history.price }}
            </td>
            <td class="border border-gray-300 p-2">
              <div v-for="product in history.products" :key="product.id">
                {{ product.name }} x {{ product.count }}
              </div>
            </td>
            <td class="border border-gray-300 p-2">{{ history.notes }}</td>
            <td class="border border-gray-300 p-2 text-center">
              <button
                @click="editHistory(history.id)"
                class="bg-color3 hover:bg-light-gray px-3 py-1 rounded-md text-white text-sm"
              >
                編集
              </button>
            </td>
            <td class="border border-gray-300 p-2 text-center">
              <button
                @click="deleteHistory(history.id)"
                class="bg-color3 hover:bg-light-gray px-3 py-1 rounded-md text-white text-sm"
              >
                削除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="text-smoke-gray">登録されている履歴はありません</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase'
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore'
import { useRouter, useRoute } from 'vue-router'

const histories = ref([])
const customerName = ref('')
const router = useRouter()
const route = useRoute()
const customerId = route.params.id

const formatDate = (dateTime) => {
  if (!dateTime) return ''

  let date
  if (typeof dateTime === 'string') {
    date = new Date(dateTime)
  } else if (typeof dateTime.toDate === 'function') {
    date = dateTime.toDate()
  } else {
    date = new Date(dateTime)
  }

  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}
const goBack = () => {
  router.push('/customer')
}
const editHistory = (id) => {
  router.push(`/edithistory/${id}`)
}
const addHistory = () => {
  router.push(`/addhistory/${customerId}`)
}
const deleteHistory = async (id) => {
  if (confirm('本当に削除しますか？')) {
    try {
      // 施術履歴を削除
      await deleteDoc(doc(db, 'histories', id))

      // 関連する売上データを検索して削除
      const salesQuery = query(
        collection(db, 'sales'),
        where('customerId', '==', customerId),
        where('dateTime', '==', histories.value.find((h) => h.id === id).dateTime),
      )
      const salesSnapshot = await getDocs(salesQuery)
      for (const saleDoc of salesSnapshot.docs) {
        await deleteDoc(doc(db, 'sales', saleDoc.id))
      }

      histories.value = histories.value.filter((history) => history.id !== id)
    } catch (e) {
      console.error('Error deleting document: ', e)
    }
  }
}

onMounted(async () => {
  try {
    // 基本的なクエリを作成（customerId でフィルタリング）
    const q = query(
      collection(db, 'histories'),
      where('customerId', '==', customerId),
      orderBy('createAt', 'desc'), // dateTimeの代わりにcreateAtでソート
    )
    const querySnapshot = await getDocs(q)

    // データの取得と変換
    histories.value = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        dateTime: data.dateTime, // Timestampをそのまま保持
        price: data.price || 0,
        products: data.products || [],
        paymentMethod: data.paymentMethod || '現金',
      }
    })

    // 顧客名を取得
    const customerRef = doc(db, 'customers', customerId)
    const customerSnap = await getDoc(customerRef)
    if (customerSnap.exists()) {
      customerName.value = customerSnap.data().name
    }
  } catch (e) {
    console.error('Error getting documents: ', e)
    // エラーメッセージを表示
    if (e.message.includes('requires an index')) {
      console.log('インデックスの作成が必要です。以下のURLからインデックスを作成してください：')
      console.log(e.message.match(/https:\/\/.*$/)[0])
    }
  }
})
</script>
<style scoped>
.hover-bg-opacity:hover {
  background-color: rgba(255, 251, 0, 0.4); /* LightGrayの背景色に透明度を設定 */
  transition: background-color 0.3s ease; /* ホバー時のトランジションをスムーズにする */
}
</style>
