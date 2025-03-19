<template>
  <div class="bg-off-white p-8 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4 text-charcoal-black">新規予約</h2>
    <form @submit.prevent="submitForm" class="space-y-4">
      <div class="flex flex-col">
        <label for="customer" class="text-charcoal-black">顧客</label>
        <div class="flex space-x-2">
          <input
            type="text"
            id="customer"
            v-model="searchQuery"
            @input="searchCustomers"
            class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-charcoal-black"
            placeholder="名前、カナ、電話番号で検索"
          />
          <button
            type="button"
            @click="router.push('/addcustomer')"
            class="bg-color3 text-white px-4 py-2 rounded-md hover:bg-opacity-90"
          >
            新規顧客
          </button>
        </div>
        <div
          v-if="searchQuery && filteredCustomers.length > 0"
          class="mt-1 max-h-60 overflow-y-auto"
        >
          <ul class="border border-gray-300 rounded-md bg-white">
            <li
              v-for="customer in filteredCustomers"
              :key="customer.id"
              @click="selectCustomer(customer)"
              class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
            >
              <div class="flex justify-between items-center">
                <div>
                  <div class="font-medium">{{ customer.lastName }}{{ customer.firstName }}</div>
                  <div class="text-sm text-gray-600">
                    {{ customer.lastNameKana }}{{ customer.firstNameKana }}
                  </div>
                </div>
                <div class="text-sm text-gray-500">{{ customer.phone }}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="flex flex-col">
        <label for="date" class="text-charcoal-black">日付</label>
        <input
          type="date"
          id="date"
          v-model="reservation.date"
          class="border border-gray-300 rounded-md px-3 py-2 text-charcoal-black"
          required
        />
      </div>

      <div class="flex flex-col">
        <label for="time" class="text-charcoal-black">時間</label>
        <input
          type="time"
          id="time"
          v-model="reservation.time"
          class="border border-gray-300 rounded-md px-3 py-2 text-charcoal-black"
          required
        />
      </div>

      <div class="flex flex-col">
        <label for="service" class="text-charcoal-black">施術内容</label>
        <select
          id="service"
          v-model="reservation.service"
          @change="handleServiceSelect"
          class="border border-gray-300 rounded-md px-3 py-2 text-charcoal-black"
          required
        >
          <option value="">施術内容を選択してください</option>
          <option v-for="menu in menus" :key="menu.id" :value="menu.name">
            {{ menu.name }} ({{ menu.duration }}分)
          </option>
        </select>
      </div>

      <div class="flex flex-col">
        <label for="notes" class="text-charcoal-black">備考</label>
        <textarea
          id="notes"
          v-model="reservation.notes"
          class="border border-gray-300 rounded-md px-3 py-2 text-charcoal-black"
        ></textarea>
      </div>

      <div class="flex justify-end mt-4 space-x-2">
        <button type="submit" class="bg-color3 text-white px-4 py-2 rounded-md hover:bg-opacity-90">
          予約する
        </button>
        <button
          type="button"
          @click="router.push('/reservations')"
          class="bg-smoke-gray text-charcoal-black px-4 py-2 rounded-md hover:bg-light-gray"
        >
          キャンセル
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'

const router = useRouter()
const route = useRoute()
const searchQuery = ref('')
const customers = ref([])
const selectedCustomer = ref(null)

const reservation = ref({
  customerId: '',
  customerName: '',
  date: '',
  time: '',
  service: '',
  serviceId: '',
  duration: 0,
  notes: '',
  menu: '',
})

const menus = ref([])

// 顧客データを取得
const fetchCustomers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'customers'))
    customers.value = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        lastName: data.lastName || '',
        firstName: data.firstName || '',
        lastNameKana: data.lastNameKana || '',
        firstNameKana: data.firstNameKana || '',
        phone: data.phone || '',
        email: data.email || '',
      }
    })
  } catch (e) {
    console.error('Error fetching customers: ', e)
  }
}

// メニューデータを取得
const fetchMenus = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'menus'))
    menus.value = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || '',
        price: data.price || 0,
        duration: data.duration || 0,
      }
    })
  } catch (e) {
    console.error('Error fetching menus: ', e)
  }
}

// 顧客検索
const filteredCustomers = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return customers.value.filter((customer) => {
    const lastName = customer.lastName?.toLowerCase() || ''
    const firstName = customer.firstName?.toLowerCase() || ''
    const lastNameKana = customer.lastNameKana?.toLowerCase() || ''
    const firstNameKana = customer.firstNameKana?.toLowerCase() || ''
    const phone = customer.phone?.toLowerCase() || ''

    return (
      lastName.includes(query) ||
      firstName.includes(query) ||
      lastNameKana.includes(query) ||
      firstNameKana.includes(query) ||
      phone.includes(query)
    )
  })
})

// 顧客選択
const selectCustomer = (customer) => {
  selectedCustomer.value = customer
  reservation.value.customerId = customer.id
  reservation.value.customerName = `${customer.lastName}${customer.firstName}`
  searchQuery.value = `${customer.lastName}${customer.firstName}`
}

// メニュー選択時の処理を修正
const handleServiceSelect = (event) => {
  const selectedMenu = menus.value.find((menu) => menu.name === event.target.value)
  if (selectedMenu) {
    reservation.value.serviceId = selectedMenu.id
    reservation.value.duration = selectedMenu.duration
    reservation.value.menu = selectedMenu.name
  }
}

// 初期データ取得とURLパラメータの処理
onMounted(() => {
  fetchCustomers()
  fetchMenus()

  // URLクエリパラメータから日時を取得
  const dateTime = route.query.dateTime
  if (dateTime) {
    const decodedDateTime = decodeURIComponent(dateTime)
    const date = new Date(decodedDateTime)

    // 日付と時間をフォーマット
    const formattedDate = date.toISOString().split('T')[0]
    const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`

    console.log('Received dateTime:', dateTime)
    console.log('Parsed date:', date)
    console.log('Formatted date:', formattedDate)
    console.log('Formatted time:', formattedTime)

    // 予約フォームに設定
    reservation.value.date = formattedDate
    reservation.value.time = formattedTime
  }

  // URLクエリパラメータからメニュー情報を取得
  const menu = route.query.menu
  if (menu) {
    const decodedMenu = decodeURIComponent(menu)
    console.log('Received menu:', decodedMenu)
    reservation.value.service = decodedMenu
    reservation.value.menu = decodedMenu
    // メニューの詳細情報を設定
    const selectedMenu = menus.value.find((m) => m.name === decodedMenu)
    if (selectedMenu) {
      reservation.value.serviceId = selectedMenu.id
      reservation.value.duration = selectedMenu.duration
    }
  }
})

// フォーム送信
const submitForm = async () => {
  if (!selectedCustomer.value) {
    alert('顧客を選択してください')
    return
  }

  try {
    // 日付と時間を結合して日時を作成
    const [year, month, day] = reservation.value.date.split('-')
    const [hours, minutes] = reservation.value.time.split(':')

    // ローカル時間として日時を作成
    const localDateTime = new Date(year, month - 1, day, hours, minutes)

    console.log('Local dateTime:', localDateTime)

    // 予約データを作成
    const reservationData = {
      customerId: reservation.value.customerId,
      customerName: reservation.value.customerName,
      dateTime: localDateTime,
      service: reservation.value.service,
      serviceId: reservation.value.serviceId,
      duration: reservation.value.duration,
      notes: reservation.value.notes,
      createAt: serverTimestamp(),
    }

    console.log('Saving reservation:', reservationData)

    await addDoc(collection(db, 'reservations'), reservationData)

    // 予約一覧ページに戻る際に、予約が作成された週の日付を渡す
    const reservationDate = new Date(localDateTime)
    const weekStart = new Date(reservationDate)
    weekStart.setDate(reservationDate.getDate() - reservationDate.getDay() + 1) // 月曜日に設定

    router.push({
      path: '/reservations',
      query: {
        weekStart: weekStart.toISOString(),
      },
    })
  } catch (e) {
    console.error('Error adding reservation: ', e)
  }
}
</script>
