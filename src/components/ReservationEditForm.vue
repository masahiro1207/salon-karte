<template>
  <div class="bg-off-white p-8 rounded-lg shadow-md text-charcoal-black mx-auto max-w-4xl">
    <h2 class="text-2xl font-bold mb-4">予約編集</h2>
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
        <select
          id="customer"
          v-model="reservation.customerId"
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
          @change="selectCustomer"
        >
          <option value="">顧客を選択してください</option>
          <option v-for="customer in filteredCustomers" :key="customer.id" :value="customer.id">
            {{ customer.lastName }} {{ customer.firstName }}
          </option>
        </select>
        <p v-if="selectedCustomer" class="mt-2">
          選択中の顧客: {{ selectedCustomer.lastName }} {{ selectedCustomer.firstName }} ({{
            selectedCustomer.lastNameKana
          }}
          {{ selectedCustomer.firstNameKana }})
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
          更新
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
import {
  collection,
  getDocs,
  getDoc,
  doc,
  Timestamp,
  updateDoc
} from 'firebase/firestore'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const reservationId = route.params.id
const customers = ref([])
const menus = ref([])
const searchKeyword = ref('') // 検索キーワードを格納するref
const selectedCustomer = ref(null) //選択した顧客
const originalCustomerId = ref('')
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const reservation = ref({
  customerId: '',
  dateTime: '',
  menu: '',
  staff: '',
  notes: '',
})
//顧客を選択した時の処理
const selectCustomer = () => {
  const selected = customers.value.find((c) => c.id === reservation.value.customerId)
  selectedCustomer.value = selected || null
}
const goBack = () => {
  router.push('/')
}

const submitForm = async () => {
  try {
    const formattedReservation = {
      dateTime: Timestamp.fromDate(new Date(reservation.value.dateTime)),
      menu: reservation.value.menu || '',
      staff: reservation.value.staff || '',
      notes: reservation.value.notes || '',
      customerId: reservation.value.customerId,
    }

    //顧客を編集している場合、更新する処理を追加
    if (originalCustomerId.value !== reservation.value.customerId) {
      formattedReservation.customerId = reservation.value.customerId
    }

    const docRef = doc(db, 'reservations', reservationId)
    await updateDoc(docRef, formattedReservation)
    console.log('Document updated with ID: ', reservationId)

    router.push('/')
  } catch (e) {
    console.error('Error updating document: ', e)
  }
}
const filteredCustomers = computed(() => {
  const keyword = searchKeyword.value.toLowerCase()
  return customers.value.filter((customer) => {
    const name = `${customer.lastName || ''} ${customer.firstName || ''}`.trim()
    const kana = `${customer.lastNameKana || ''} ${customer.firstNameKana || ''}`.trim()
    return name.toLowerCase().includes(keyword) || kana.toLowerCase().includes(keyword)
  })
})

onMounted(async () => {
  try {
    // 顧客データの取得
    const customerSnapshot = await getDocs(collection(db, 'customers'))
    customers.value = customerSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // メニューデータの取得
    const menuSnapshot = await getDocs(collection(db, 'menus'))
    menus.value = menuSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.kana.localeCompare(b.kana, 'ja'))

    // 予約データの取得
    const docRef = doc(db, 'reservations', reservationId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      originalCustomerId.value = data.customerId
      reservation.value = {
        customerId: data.customerId,
        dateTime: formatDate(data.dateTime.toDate()).slice(0, 16),
        menu: data.menu,
        staff: data.staff,
        notes: data.notes,
      }
      // 選択された顧客を取得
      await selectCustomer()
    } else {
      console.log('No such document!')
    }
  } catch (e) {
    console.error('Error getting documents: ', e)
  }
})
</script>
