<template>
  <div class="container mx-auto p-8 bg-gray-50 min-h-screen">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">新規予約</h2>
        <button
          @click="router.back()"
          class="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition duration-200"
        >
          <span class="material-icons">close</span>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 日付選択 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">予約日</label>
          <input
            type="date"
            v-model="formData.date"
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-color3 focus:border-transparent"
            required
          />
        </div>

        <!-- 時間選択 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">時間</label>
          <select
            v-model="formData.time"
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-color3 focus:border-transparent"
            required
          >
            <option v-for="time in timeSlots" :key="time" :value="time">
              {{ time }}
            </option>
          </select>
        </div>

        <!-- 顧客選択 -->
        <div class="customer-select">
          <label class="block text-sm font-medium text-gray-700 mb-1">お客様</label>
          <div class="relative">
            <input
              type="text"
              v-model="customerSearch"
              @input="filterCustomers"
              @focus="showCustomerList = true"
              @click.stop
              placeholder="お客様を検索..."
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-color3 focus:border-transparent"
            />
            <!-- 顧客リストのドロップダウン -->
            <div
              v-if="showCustomerList && filteredCustomers.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              @click.stop
            >
              <div
                v-for="customer in filteredCustomers"
                :key="customer.id"
                @click="selectCustomer(customer)"
                class="p-2 hover:bg-gray-100 cursor-pointer"
              >
                <div class="font-medium">{{ customer.name }}</div>
              </div>
            </div>
            <!-- 選択された顧客の表示 -->
            <div v-if="selectedCustomerName" class="mt-2 text-sm text-gray-600">
              選択中: {{ selectedCustomerName }}
            </div>
            <div class="mt-2">
              <button
                type="button"
                @click="goToAddCustomer"
                class="px-4 py-2 bg-color3 text-white hover:bg-light-gray rounded-lg transition duration-200"
              >
                新規顧客登録
              </button>
            </div>
          </div>
        </div>

        <!-- メニュー選択 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">メニュー</label>
          <select
            v-model="formData.menu"
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-color3 focus:border-transparent"
            required
          >
            <option value="">選択してください</option>
            <option v-for="menu in menus" :key="menu.name" :value="menu.name">
              {{ menu.name }} ({{ menu.duration }}分)
            </option>
          </select>
        </div>

        <!-- スタッフ選択 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">担当スタッフ</label>
          <select
            v-model="formData.staff"
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-color3 focus:border-transparent"
            required
          >
            <option value="">選択してください</option>
            <option v-for="staff in staffList" :key="staff" :value="staff">
              {{ staff }}
            </option>
          </select>
        </div>

        <!-- 備考 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">備考</label>
          <textarea
            v-model="formData.notes"
            rows="3"
            class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-color3 focus:border-transparent"
          ></textarea>
        </div>

        <!-- 送信ボタン -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="router.back()"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            キャンセル
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-color3 text-white rounded-lg hover:bg-opacity-90 transition duration-200"
          >
            予約を登録
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { format } from 'date-fns'

const router = useRouter()
const route = useRoute()

// フォームデータの初期化
const formData = ref({
  date: '',
  time: '',
  customerId: '',
  menu: '',
  staff: '',
  notes: '',
})

// 顧客一覧
const customers = ref([])
// メニュー一覧
const menus = ref([])
// スタッフ一覧（仮のデータ）
const staffList = ['山田', '鈴木', '田中', '吉田']

// 新しく追加する状態管理
const customerSearch = ref('')
const showCustomerList = ref(false)
const filteredCustomers = ref([])
const selectedCustomerName = computed(() => {
  const selected = customers.value.find((c) => c.id === formData.value.customerId)
  return selected ? selected.name : ''
})

// 時間スロットの生成（9:00 から 20:00 まで30分間隔）
const timeSlots = computed(() => {
  const slots = []
  for (let hour = 9; hour <= 20; hour++) {
    slots.push(`${hour}:00`)
    if (hour < 20) {
      slots.push(`${hour}:30`)
    }
  }
  return slots
})

// 顧客データの取得
const fetchCustomers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'customers'))
    customers.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching customers:', error)
  }
}

// メニューデータの取得
const fetchMenus = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'menus'))
    menus.value = querySnapshot.docs.map((doc) => doc.data())
  } catch (error) {
    console.error('Error fetching menus:', error)
  }
}

// URLパラメータから日時を設定
const setInitialDateTime = () => {
  const datetimeParam = route.query.datetime

  if (datetimeParam) {
    try {
      const datetime = new Date(decodeURIComponent(datetimeParam))
      formData.value.date = format(datetime, 'yyyy-MM-dd')
      formData.value.time = format(datetime, 'HH:mm')
    } catch (error) {
      console.error('Error parsing datetime:', error)
      setDefaultDateTime()
    }
  } else {
    setDefaultDateTime()
  }
}

// デフォルトの日時を設定
const setDefaultDateTime = () => {
  formData.value.date = format(new Date(), 'yyyy-MM-dd')
  formData.value.time = '09:00'
}

// 顧客検索フィルター
const filterCustomers = () => {
  const search = customerSearch.value.toLowerCase()
  filteredCustomers.value = customers.value.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search) ||
      (customer.phone && customer.phone.includes(search)),
  )
}

// 顧客選択処理
const selectCustomer = (customer) => {
  formData.value.customerId = customer.id
  customerSearch.value = customer.name
  showCustomerList.value = false
}

// 予約の登録
const handleSubmit = async () => {
  try {
    const [hours, minutes] = formData.value.time.split(':').map(Number)
    const reservationDate = new Date(formData.value.date)
    reservationDate.setHours(hours, minutes, 0, 0)

    await addDoc(collection(db, 'reservations'), {
      customerId: formData.value.customerId,
      dateTime: Timestamp.fromDate(reservationDate),
      menu: formData.value.menu,
      staff: formData.value.staff,
      notes: formData.value.notes,
    })

    alert('予約を登録しました')
    router.push('/')
  } catch (error) {
    console.error('Error adding reservation:', error)
    alert('予約の登録に失敗しました')
  }
}

// グローバルクリックハンドラーを参照として保持
const handleClickOutside = (e) => {
  const customerSelect = document.querySelector('.customer-select')
  if (customerSelect && !customerSelect.contains(e.target)) {
    showCustomerList.value = false
  }
}

// 新規顧客登録ページへ遷移する関数
const goToAddCustomer = () => {
  router.push('/addcustomer') // <- 修正
}

onMounted(async () => {
  await Promise.all([fetchCustomers(), fetchMenus()])
  setInitialDateTime()
  filterCustomers()

  // イベントリスナーを追加
  document.addEventListener('click', handleClickOutside)
})

// コンポーネントのアンマウント時にイベントリスナーを削除
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* スクロールバーのスタイル */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}
</style>
