<template>
  <div class="bg-off-white p-8 rounded-lg shadow-md text-charcoal-black mx-auto max-w-6xl">
    <h2 class="text-2xl font-bold mb-4">施術履歴追加</h2>
    <p class="mb-4">顧客名：{{ customerName }}</p>

    <!-- 履歴一覧 -->
    <div class="mb-8">
      <h3 class="text-xl font-bold mb-4">過去の履歴</h3>

      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="w-full border-collapse">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">日時</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">メニュー</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">担当者</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">料金</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">支払方法</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">使用商品</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">備考</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="historyItem in customerHistories"
              :key="historyItem.id"
              class="hover:bg-gray-50"
            >
              <td class="px-4 py-3">{{ formatDateTime(historyItem.dateTime) }}</td>
              <td class="px-4 py-3">{{ historyItem.menu }}</td>
              <td class="px-4 py-3">{{ historyItem.staff }}</td>
              <td class="px-4 py-3">¥{{ historyItem.price?.toLocaleString() }}</td>
              <td class="px-4 py-3">{{ historyItem.paymentMethod }}</td>
              <td class="px-4 py-3">
                <div v-for="product in historyItem.products" :key="product.name">
                  {{ product.name }} x {{ product.count }}
                </div>
              </td>
              <td class="px-4 py-3">{{ historyItem.notes }}</td>
              <td class="px-4 py-3">
                <button
                  @click="editHistory(historyItem)"
                  class="bg-color3 hover:bg-opacity-90 px-3 py-1 rounded-md text-white text-sm"
                >
                  編集
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新規履歴追加フォーム -->
    <form @submit.prevent="submitForm" class="space-y-4">
      <h3 class="text-xl font-bold mb-4">{{ isEditing ? '履歴編集' : '新規履歴追加' }}</h3>
      <div class="flex flex-col">
        <label for="dateTime">日時</label>
        <input
          type="date"
          id="dateTime"
          v-model="history.dateTime"
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        />
      </div>
      <div class="flex flex-col">
        <label for="menu">メニュー</label>
        <select
          id="menu"
          v-model="history.menu"
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        >
          <option v-for="menu in menus" :key="menu.id" :value="menu.name">{{ menu.name }}</option>
        </select>
      </div>
      <div class="flex flex-col">
        <label for="staff">担当者</label>
        <input
          type="text"
          id="staff"
          v-model="history.staff"
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        />
      </div>
      <div class="flex flex-col">
        <label for="price">料金</label>
        <input
          type="number"
          id="price"
          v-model="history.price"
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        />
      </div>
      <div class="flex flex-col">
        <label for="paymentMethod">支払い方法</label>
        <select
          id="paymentMethod"
          v-model="history.paymentMethod"
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        >
          <option value="現金">現金</option>
          <option value="クレジットカード">クレジットカード</option>
        </select>
      </div>
      <div class="flex flex-col">
        <label for="products">使用商品</label>
        <div v-for="(product, index) in history.products" :key="index" class="mb-2">
          <input
            type="text"
            v-model="product.name"
            placeholder="商品名"
            class="border border-gray-300 rounded-md px-3 py-2 w-40 mr-2 text-charcoal-black"
          />
          <input
            type="number"
            v-model="product.count"
            placeholder="個数"
            class="border border-gray-300 rounded-md px-3 py-2 w-20 mr-2 text-charcoal-black"
          />
          <button
            type="button"
            @click="removeProduct(index)"
            class="bg-smoke-gray hover:bg-light-gray px-2 py-1 rounded-md text-charcoal-black text-sm"
          >
            削除
          </button>
        </div>
        <button
          type="button"
          @click="addProduct"
          class="bg-smoke-gray hover:bg-light-gray px-3 py-1 rounded-md text-charcoal-black text-sm"
        >
          商品追加
        </button>
      </div>
      <div class="flex flex-col">
        <label for="notes">施術履歴</label>
        <textarea
          id="notes"
          v-model="history.notes"
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        ></textarea>
      </div>
      <div class="flex justify-end mt-4 space-x-2">
        <button type="submit" class="bg-black hover:bg-dark-gray text-white px-4 py-2 rounded-md">
          登録
        </button>
        <button
          type="button"
          @click="goBack"
          class="bg-smoke-gray hover:bg-light-gray text-charcoal-black px-4 py-2 rounded-md"
        >
          戻る
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { db } from '../firebase'
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  Timestamp,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const customerId = route.params.id
const customerName = ref('')
const menus = ref([])
const customerHistories = ref([])

const history = ref({
  customerId: customerId,
  dateTime: new Date().toISOString().split('T')[0],
  menu: '',
  staff: '',
  price: null,
  paymentMethod: '現金',
  products: [{ name: '', count: 1 }],
  notes: '',
  reservationId: null,
})

const isEditing = ref(false)
const editingHistoryId = ref(null)

const addProduct = () => {
  history.value.products.push({ name: '', count: 1 })
}

const removeProduct = (index) => {
  history.value.products.splice(index, 1)
}

const goBack = () => {
  router.push('/reservations')
}

const editHistory = (historyItem) => {
  console.log('editHistory input:', historyItem)
  isEditing.value = true
  editingHistoryId.value = historyItem.id

  let dateTime
  try {
    if (historyItem.dateTime instanceof Timestamp) {
      dateTime = historyItem.dateTime.toDate()
    } else if (typeof historyItem.dateTime === 'object' && historyItem.dateTime.seconds) {
      dateTime = new Date(historyItem.dateTime.seconds * 1000)
    } else {
      dateTime = new Date(historyItem.dateTime)
    }
    console.log('parsed dateTime:', dateTime)
  } catch (e) {
    console.error('Error parsing dateTime:', e)
    dateTime = new Date()
  }

  history.value = {
    customerId: historyItem.customerId,
    dateTime: dateTime.toISOString().split('T')[0],
    menu: historyItem.menu,
    staff: historyItem.staff,
    price: historyItem.price,
    paymentMethod: historyItem.paymentMethod,
    products: historyItem.products || [{ name: '', count: 1 }],
    notes: historyItem.notes,
    reservationId: historyItem.reservationId,
  }
}

const submitForm = async () => {
  try {
    if (!history.value.dateTime || !history.value.menu || !history.value.staff || !history.value.price) {
      alert('必須項目が入力されていません。')
      return
    }

    const formattedHistory = {
      customerId: history.value.customerId,
      dateTime: Timestamp.fromDate(new Date(history.value.dateTime)),
      menu: history.value.menu,
      staff: history.value.staff,
      price: Number(history.value.price),
      paymentMethod: history.value.paymentMethod,
      products: history.value.products.filter((p) => p.name && p.count),
      notes: history.value.notes,
      updateAt: Timestamp.now(),
      reservationId: history.value.reservationId || null,
    }

    if (isEditing.value && editingHistoryId.value) {
      // 既存の履歴を更新
      const historyRef = doc(db, 'histories', editingHistoryId.value)
      await updateDoc(historyRef, formattedHistory)

      // 対応する売上データを検索して更新
      const salesQuery = query(
        collection(db, 'sales'),
        where('historyId', '==', editingHistoryId.value)
      )
      const salesSnapshot = await getDocs(salesQuery)

      if (!salesSnapshot.empty) {
        const saleDoc = salesSnapshot.docs[0]
        await updateDoc(doc(db, 'sales', saleDoc.id), formattedHistory)
      }

      alert('施術履歴を更新しました。')
    } else {
      // 新規履歴を追加
      formattedHistory.createAt = Timestamp.now()
      const newHistoryRef = await addDoc(collection(db, 'histories'), formattedHistory)

      // 売上データを作成
      const saleData = {
        ...formattedHistory,
        historyId: newHistoryRef.id,
        createAt: Timestamp.now(),
      }
      await addDoc(collection(db, 'sales'), saleData)

      // 予約データに施術履歴フラグを更新
      if (history.value.reservationId) {
        const reservationRef = doc(db, 'reservations', history.value.reservationId)
        await updateDoc(reservationRef, {
          hasTreatmentHistory: true,
        })
      }

      // 顧客の最終来店日を更新
      const customerRef = doc(db, 'customers', history.value.customerId)
      await updateDoc(customerRef, {
        lastVisit: Timestamp.fromDate(new Date(history.value.dateTime)),
      })

      alert('施術履歴を登録しました。')
    }

    // フォームをリセット
    isEditing.value = false
    editingHistoryId.value = null
    history.value = {
      customerId: customerId,
      dateTime: new Date().toISOString().split('T')[0],
      menu: '',
      staff: '',
      price: null,
      paymentMethod: '現金',
      products: [{ name: '', count: 1 }],
      notes: '',
      reservationId: null,
    }

    // 履歴一覧を更新
    await fetchHistories()
  } catch (e) {
    console.error('Error saving document: ', e)
    alert('施術履歴の保存に失敗しました。')
  }
}

// 履歴一覧を取得する関数を分離
const fetchHistories = async () => {
  try {
    const historyQuery = query(
      collection(db, 'histories'),
      where('customerId', '==', customerId),
      orderBy('dateTime', 'desc'),
    )
    const historySnapshot = await getDocs(historyQuery)
    customerHistories.value = historySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (e) {
    console.error('Error fetching histories: ', e)
  }
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  console.log('formatDateTime input:', dateTime, typeof dateTime)

  let date
  try {
    if (dateTime instanceof Timestamp) {
      date = dateTime.toDate()
    } else if (typeof dateTime === 'object' && dateTime.seconds) {
      date = new Date(dateTime.seconds * 1000)
    } else {
      date = new Date(dateTime)
    }
    console.log('formatted date:', date)
  } catch (e) {
    console.error('Error formatting date:', e)
    return ''
  }

  return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
    .getDate()
    .toString()
    .padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`
}

watch(
  () => history.value.menu,
  (newMenu) => {
    const selectedMenu = menus.value.find((menu) => menu.name === newMenu)
    if (selectedMenu) {
      history.value.price = selectedMenu.price
    }
  },
)

onMounted(async () => {
  try {
    // メニュー一覧を取得
    const menuSnapshot = await getDocs(collection(db, 'menus'))
    menus.value = menuSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.kana.localeCompare(b.kana, 'ja'))

    // 顧客名を取得
    const customerRef = doc(db, 'customers', customerId)
    const customerSnap = await getDoc(customerRef)
    if (customerSnap.exists()) {
      customerName.value = customerSnap.data().name
    }

    // 顧客の履歴を取得
    await fetchHistories()

    // URLクエリパラメータから予約情報を取得
    const datetime = route.query.datetime
    const menu = route.query.menu
    const staff = route.query.staff
    const price = route.query.price
    const reservationId = route.query.reservationId

    if (datetime) {
      const date = new Date(decodeURIComponent(datetime))
      history.value.dateTime = date.toISOString().split('T')[0]
    }
    if (menu) {
      history.value.menu = decodeURIComponent(menu)
    }
    if (staff) {
      history.value.staff = decodeURIComponent(staff)
    }
    if (price) {
      history.value.price = Number(price)
    }
    if (reservationId) {
      history.value.reservationId = reservationId
    }
  } catch (e) {
    console.error('Error getting documents: ', e)
  }
})
</script>
