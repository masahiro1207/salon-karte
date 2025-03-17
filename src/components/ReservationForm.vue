<template>
  <div class="bg-off-white p-8 rounded-lg shadow-md text-charcoal-black mx-auto max-w-4xl">
    <h2 class="text-2xl font-bold mb-4">予約登録</h2>
    <form @submit.prevent="submitForm" class="space-y-4">
      <div class="flex flex-col">
        <label for="dateTime">日時</label>
        <input
          type="datetime-local"
          id="dateTime"
          v-model="reservation.dateTime"
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        />
      </div>
      <div class="flex flex-col">
        <label for="customerSearch">顧客検索</label>
        <input
          type="text"
          id="customerSearch"
          v-model="searchKeyword"
          placeholder="顧客名で検索"
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        />
      </div>
      <div class="flex flex-col">
        <label for="customer">顧客</label>
        <div class="relative">
          <select
            id="customer"
            v-model="reservation.customerId"
            class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
            @change="selectCustomer"
          >
            <option v-for="customer in filteredCustomers" :key="customer.id" :value="customer.id">
              {{ customer.name }}
            </option>
          </select>
        </div>
        <p v-if="selectedCustomer" class="mt-2">
          選択中の顧客: {{ selectedCustomer.name }} ({{ selectedCustomer.kana }})
        </p>
      </div>
      <div class="flex flex-col">
        <label for="menu">メニュー</label>
        <select
          id="menu"
          v-model="reservation.menu"
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
          v-model="reservation.staff"
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        />
      </div>
      <div class="flex flex-col">
        <label for="notes">備考</label>
        <textarea
          id="notes"
          v-model="reservation.notes"
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
import { ref, onMounted, computed } from 'vue'
import { db } from '../firebase'
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const customers = ref([])
const menus = ref([])
const searchKeyword = ref('') // 検索キーワードを格納するref
const selectedCustomer = ref(null) //選択した顧客

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}
//顧客を選択した時の処理
const selectCustomer = () => {
  const selected = customers.value.find((c) => c.id === reservation.value.customerId)
  selectedCustomer.value = selected ? selected : null
}

const reservation = ref({
  customerId: '',
  dateTime: '',
  menu: '',
  staff: '',
  notes: '',
})

const goBack = () => {
  router.push('/')
}

const submitForm = async () => {
  try {
    const formattedReservation = {
      ...reservation.value,
      dateTime: Timestamp.fromDate(new Date(reservation.value.dateTime)),
    }
    const docRef = await addDoc(collection(db, 'reservations'), formattedReservation)
    console.log('Document written with ID: ', docRef.id)
    //施術履歴に登録する
    const formattedHistory = {
      customerId: reservation.value.customerId,
      dateTime: Timestamp.fromDate(new Date(reservation.value.dateTime)),
      menu: reservation.value.menu,
      staff: '',
      price: 0,
      paymentMethod: '現金',
      products: [],
      notes: '',
      createAt: Timestamp.now(),
    }
    await addDoc(collection(db, 'histories'), formattedHistory)
    router.push('/')
  } catch (e) {
    console.error('Error adding document: ', e)
  }
}
const filteredCustomers = computed(() => {
  const keyword = searchKeyword.value.toLowerCase()
  return customers.value.filter(
    (customer) =>
      customer.name.toLowerCase().includes(keyword) ||
      (customer.kana && customer.kana.toLowerCase().includes(keyword)) ||
      (customer.phone && customer.phone.toLowerCase().includes(keyword)),
  )
})
onMounted(async () => {
  try {
    const customerSnapshot = await getDocs(collection(db, 'customers'))
    customers.value = customerSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    const menuSnapshot = await getDocs(collection(db, 'menus'))
    menus.value = menuSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.kana.localeCompare(b.kana, 'ja'))

    // URLからdateTimeパラメータを取得
    const dateTimeParam = route.query.dateTime

    // dateTimeパラメータがある場合、reservation.dateTimeにセット
    if (dateTimeParam) {
      const date = new Date(dateTimeParam)
      reservation.value.dateTime = formatDate(date).slice(0, 16)
    } else {
      const now = new Date() // 現在日時を取得
      const formattedDateTime = formatDate(now) // formatDate 関数でフォーマット
      reservation.value.dateTime = formattedDateTime.slice(0, 16) // v-modelの予約日時をセット
    }
  } catch (e) {
    console.error('Error getting documents: ', e)
  }
})
</script>
