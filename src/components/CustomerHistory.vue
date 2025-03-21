<template>
  <div class="min-h-screen bg-off-white p-4 sm:p-8">
    <!-- ヘッダーセクション -->
    <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800">{{ customerName }}様の履歴</h2>
          <p class="text-sm text-gray-600 mt-1">{{ customerKana }}</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <button
            @click="goToSalesList"
            class="w-full sm:w-auto bg-color1 hover:bg-opacity-90 text-white px-4 sm:px-6 py-2 rounded-full shadow-sm transition duration-200 ease-in-out flex items-center justify-center space-x-2"
          >
            <span class="material-icons text-xl">receipt_long</span>
            <span>売上一覧</span>
          </button>
          <button
            @click="addHistory"
            class="w-full sm:w-auto bg-color3 hover:bg-opacity-90 text-white px-4 sm:px-6 py-2 rounded-full shadow-sm transition duration-200 ease-in-out flex items-center justify-center space-x-2"
          >
            <span class="material-icons text-xl">add</span>
            <span>施術履歴追加</span>
          </button>
        </div>
      </div>

      <!-- フィルター -->
      <div class="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">期間</label>
          <div class="flex space-x-2">
            <input
              type="date"
              v-model="startDate"
              class="flex-1 border border-gray-300 rounded-md px-3 py-2"
            />
            <input
              type="date"
              v-model="endDate"
              class="flex-1 border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">メニュー</label>
          <select v-model="selectedMenu" class="w-full border border-gray-300 rounded-md px-3 py-2">
            <option value="">すべて</option>
            <option v-for="menu in menus" :key="menu.id" :value="menu.name">
              {{ menu.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">担当者</label>
          <select
            v-model="selectedStaff"
            class="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">すべて</option>
            <option v-for="staff in staffs" :key="staff" :value="staff">
              {{ staff }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 顧客基本情報 -->
    <div class="mb-8 bg-white rounded-lg shadow-sm p-6 max-w-7xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">{{ customerName }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-gray-600">電話番号</p>
          <p class="text-lg">{{ customerPhone }}</p>
        </div>
        <div>
          <p class="text-gray-600">最終来店日</p>
          <p class="text-lg">{{ lastVisitDate }}</p>
        </div>
        <div>
          <p class="text-gray-600">総施術回数</p>
          <p class="text-lg">{{ totalVisits }}回</p>
        </div>
        <div>
          <p class="text-gray-600">総利用金額</p>
          <p class="text-lg">¥{{ totalAmount?.toLocaleString() }}</p>
        </div>
      </div>
    </div>

    <!-- 集計情報 -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 max-w-7xl mx-auto">
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="text-sm text-gray-600">総施術回数</div>
        <div class="text-2xl font-bold text-gray-800">{{ filteredHistories.length }}回</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="text-sm text-gray-600">総売上</div>
        <div class="text-2xl font-bold text-gray-800">¥{{ totalSales.toLocaleString() }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="text-sm text-gray-600">現金</div>
        <div class="text-2xl font-bold text-gray-800">¥{{ cashTotal.toLocaleString() }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="text-sm text-gray-600">クレジット</div>
        <div class="text-2xl font-bold text-gray-800">¥{{ creditCardTotal.toLocaleString() }}</div>
      </div>
    </div>

    <!-- 履歴一覧 -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden max-w-7xl mx-auto">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse min-w-[1000px]">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-600">日時</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-600">メニュー</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-600">担当者</th>
              <th class="px-6 py-4 text-right text-sm font-medium text-gray-600">料金</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-600">支払方法</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-600">備考</th>
              <th class="px-6 py-4 text-center text-sm font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="history in filteredHistories" :key="history.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">{{ formatDateTime(history.dateTime) }}</td>
              <td class="px-6 py-4">{{ history.menu }}</td>
              <td class="px-6 py-4">{{ history.staff }}</td>
              <td class="px-6 py-4 text-right">¥{{ history.price.toLocaleString() }}</td>
              <td class="px-6 py-4">{{ history.paymentMethod }}</td>
              <td class="px-6 py-4">{{ history.notes }}</td>
              <td class="px-6 py-4">
                <div class="flex justify-center space-x-2">
                  <button
                    @click="editHistory(history.id)"
                    class="text-color3 hover:text-opacity-80"
                  >
                    <span class="material-icons">edit</span>
                  </button>
                  <button
                    @click="deleteHistory(history.id)"
                    class="text-red-500 hover:text-opacity-80"
                  >
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../firebase'
import {
  collection,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  updateDoc,
  addDoc,
} from 'firebase/firestore'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const customerId = route.params.id

const customerName = ref('')
const customerKana = ref('')
const customerPhone = ref('')
const lastVisitDate = ref('')
const totalVisits = ref(0)
const totalAmount = ref(0)
const histories = ref([])
const menus = ref([])
const staffs = ref([])
const startDate = ref('')
const endDate = ref('')
const selectedMenu = ref('')
const selectedStaff = ref('')

const filteredHistories = computed(() => {
  let filtered = histories.value

  if (startDate.value) {
    filtered = filtered.filter((history) => {
      const historyDate = history.dateTime.toDate()
      return historyDate >= new Date(startDate.value)
    })
  }

  if (endDate.value) {
    filtered = filtered.filter((history) => {
      const historyDate = history.dateTime.toDate()
      return historyDate <= new Date(endDate.value)
    })
  }

  if (selectedMenu.value) {
    filtered = filtered.filter((history) => history.menu === selectedMenu.value)
  }

  if (selectedStaff.value) {
    filtered = filtered.filter((history) => history.staff === selectedStaff.value)
  }

  return filtered
})

const totalSales = computed(() => {
  return filteredHistories.value.reduce((sum, history) => sum + history.price, 0)
})

const cashTotal = computed(() => {
  return filteredHistories.value.reduce((sum, history) => {
    if (history.paymentMethod === '現金') {
      return sum + history.price
    }
    return sum
  }, 0)
})

const creditCardTotal = computed(() => {
  return filteredHistories.value.reduce((sum, history) => {
    if (history.paymentMethod === 'クレジットカード') {
      return sum + history.price
    }
    return sum
  }, 0)
})

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = dateTime.toDate()
  return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
    .getDate()
    .toString()
    .padStart(2, '0')}`
}

const addHistory = async () => {
  try {
    // 履歴データを作成
    const historyData = {
      customerId: customerId,
      dateTime: new Date(),
      menu: '',
      staff: '',
      price: 0,
      paymentMethod: '現金',
      products: [],
      notes: '',
      createAt: new Date(),
    }

    // 履歴データを保存
    const historyRef = await addDoc(collection(db, 'histories'), historyData)

    // 売上データを作成
    const saleData = {
      customerId: customerId,
      dateTime: new Date(),
      menu: '',
      staff: '',
      price: 0,
      paymentMethod: '現金',
      products: [],
      notes: '',
      createAt: new Date(),
    }

    // 売上データを保存
    await addDoc(collection(db, 'sales'), saleData)

    // 編集画面に遷移
    router.push(`/edithistory/${historyRef.id}`)
  } catch (e) {
    console.error('Error adding history: ', e)
    alert('履歴の追加に失敗しました。')
  }
}

const editHistory = (id) => {
  const historyData = histories.value.find((history) => history.id === id)
  router.push({
    path: `/edithistory/${id}`,
    query: {
      price: historyData.price,
      menu: historyData.menu,
      staff: historyData.staff,
      paymentMethod: historyData.paymentMethod,
      products: JSON.stringify(historyData.products),
      notes: historyData.notes,
    },
  })
}

const deleteHistory = async (id) => {
  if (confirm('この履歴を削除してもよろしいですか？')) {
    try {
      await deleteDoc(doc(db, 'histories', id))
      histories.value = histories.value.filter((history) => history.id !== id)
    } catch (e) {
      console.error('Error deleting document: ', e)
      alert('履歴の削除に失敗しました。')
    }
  }
}

const goToSalesList = () => {
  router.push({
    path: '/sales',
    query: {
      customerId: customerId,
      customerName: customerName.value,
      startDate: startDate.value,
      endDate: endDate.value,
      selectedMenu: selectedMenu.value,
      selectedStaff: selectedStaff.value,
    },
  })
}

// 顧客情報を取得する関数
const fetchCustomerInfo = async () => {
  try {
    const customerRef = doc(db, 'customers', customerId)
    const customerSnap = await getDoc(customerRef)
    if (customerSnap.exists()) {
      const customerData = customerSnap.data()
      customerName.value = `${customerData.lastName || ''} ${customerData.firstName || ''}`.trim()
      customerKana.value =
        `${customerData.lastNameKana || ''} ${customerData.firstNameKana || ''}`.trim()
      customerPhone.value = customerData.phone
    }
  } catch (e) {
    console.error('Error getting customer info: ', e)
  }
}

// 履歴情報から集計データを計算
const calculateHistoryStats = (histories) => {
  if (!histories || histories.length === 0) {
    lastVisitDate.value = 'なし'
    totalVisits.value = 0
    totalAmount.value = 0
    return
  }

  // 最終来店日を計算
  const latestHistory = histories[0]
  lastVisitDate.value = formatDateTime(latestHistory.dateTime)

  // 総施術回数
  totalVisits.value = histories.length

  // 総利用金額
  totalAmount.value = histories.reduce((sum, history) => sum + (history.price || 0), 0)
}

onMounted(async () => {
  try {
    // 顧客情報を取得
    await fetchCustomerInfo()

    // メニュー一覧を取得
    const menuSnapshot = await getDocs(collection(db, 'menus'))
    menus.value = menuSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.kana.localeCompare(b.kana, 'ja'))

    // 顧客の履歴を取得
    const historyQuery = query(
      collection(db, 'histories'),
      where('customerId', '==', customerId),
      orderBy('dateTime', 'desc'),
    )
    const historySnapshot = await getDocs(historyQuery)
    histories.value = historySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // 履歴情報から集計データを計算
    calculateHistoryStats(histories.value)

    // 担当者一覧の取得
    const uniqueStaffs = new Set(histories.value.map((history) => history.staff))
    staffs.value = Array.from(uniqueStaffs)

    // URLクエリパラメータから履歴情報を取得
    const notes = route.query.notes
    if (notes) {
      // 最新の履歴の備考を更新
      if (histories.value.length > 0) {
        const latestHistory = histories.value[0]
        if (latestHistory.notes !== decodeURIComponent(notes)) {
          // 備考が異なる場合は更新
          const historyRef = doc(db, 'histories', latestHistory.id)
          await updateDoc(historyRef, {
            notes: decodeURIComponent(notes),
          })
          // 履歴一覧を更新
          latestHistory.notes = decodeURIComponent(notes)
        }
      }
    }
  } catch (e) {
    console.error('Error getting documents: ', e)
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* スクロールバーのカスタマイズ */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}

/* テーブルの最小幅を設定 */
.min-w-[1000px] {
  min-width: 1000px;
}
</style>
