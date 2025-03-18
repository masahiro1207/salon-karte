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
            placeholder="顧客名で検索"
          />
          <button
            type="button"
            @click="router.push('/addcustomer')"
            class="bg-color3 text-white px-4 py-2 rounded-md hover:bg-opacity-90"
          >
            新規顧客
          </button>
        </div>
        <div v-if="filteredCustomers.length > 0" class="mt-1">
          <ul class="border border-gray-300 rounded-md bg-white">
            <li
              v-for="customer in filteredCustomers"
              :key="customer.id"
              @click="selectCustomer(customer)"
              class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {{ customer.lastName }}{{ customer.firstName }}
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
        <input
          type="text"
          id="service"
          v-model="reservation.service"
          class="border border-gray-300 rounded-md px-3 py-2 text-charcoal-black"
          required
        />
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'

const router = useRouter()
const searchQuery = ref('')
const customers = ref([])
const selectedCustomer = ref(null)

const reservation = ref({
  customerId: '',
  customerName: '',
  date: '',
  time: '',
  service: '',
  notes: '',
})

// 顧客データを取得
const fetchCustomers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'customers'))
    customers.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (e) {
    console.error('Error fetching customers: ', e)
  }
}

// 顧客検索
const filteredCustomers = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return customers.value.filter((customer) => {
    const fullName = `${customer.lastName}${customer.firstName}`.toLowerCase()
    return fullName.includes(query)
  })
})

// 顧客選択
const selectCustomer = (customer) => {
  selectedCustomer.value = customer
  reservation.value.customerId = customer.id
  reservation.value.customerName = `${customer.lastName}${customer.firstName}`
  searchQuery.value = ''
}

// フォーム送信
const submitForm = async () => {
  if (!selectedCustomer.value) {
    alert('顧客を選択してください')
    return
  }

  try {
    await addDoc(collection(db, 'reservations'), {
      ...reservation.value,
      createAt: serverTimestamp(),
    })
    router.push('/reservations')
  } catch (e) {
    console.error('Error adding reservation: ', e)
  }
}

// 初期データ取得
fetchCustomers()
</script>
