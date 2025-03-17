<template>
  <div class="bg-off-white p-8 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4 text-charcoal-black">顧客情報編集</h2>
    <form @submit.prevent="submitForm" class="space-y-4">
      <div class="flex flex-col">
        <label for="name" class="text-charcoal-black">名前</label>
        <input
          type="text"
          id="name"
          v-model="customer.name"
          required
          class="border border-gray-300 rounded-md px-3 py-2 text-charcoal-black"
        />
      </div>
      <div class="flex flex-col">
        <label for="kana" class="text-charcoal-black">フリガナ</label>
        <input
          type="text"
          id="kana"
          v-model="customer.kana"
          required
          class="border border-gray-300 rounded-md px-3 py-2 text-charcoal-black"
        />
      </div>
      <div class="flex flex-col">
        <label for="phone" class="text-charcoal-black">電話番号</label>
        <input
          type="text"
          id="phone"
          v-model="customer.phone"
          class="border border-gray-300 rounded-md px-3 py-2 text-charcoal-black"
        />
      </div>
      <div class="flex flex-col">
        <label for="notes" class="text-charcoal-black">備考</label>
        <textarea
          id="notes"
          v-model="customer.notes"
          class="border border-gray-300 rounded-md px-3 py-2 text-charcoal-black"
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
import { ref, onMounted } from 'vue'
import { db } from '../firebase'
import { getDoc, doc, updateDoc } from 'firebase/firestore' // getDoc, doc, updateDocを追加
import { useRouter, useRoute } from 'vue-router' // useRouteを追加

const customer = ref({
  name: '',
  kana: '',
  phone: '',
  notes: '',
})
const router = useRouter()
const route = useRoute() // useRouteを初期化
const customerId = route.params.id // customerIdを取得

// デバッグ用のログを追加
console.log('Route params:', route.params)
console.log('Customer ID:', customerId)

const submitForm = async () => {
  try {
    if (!customerId) {
      throw new Error('顧客IDが見つかりません')
    }
    const docRef = doc(db, 'customers', customerId)
    await updateDoc(docRef, customer.value)
    console.log('Document updated with ID: ', customerId)
    router.push('/customer') // 顧客一覧画面に戻る
  } catch (e) {
    console.error('Error updating document: ', e)
    alert('顧客情報の更新に失敗しました')
  }
}

const goBack = () => {
  router.push('/customer') // 顧客一覧画面に戻る
}

onMounted(async () => {
  try {
    if (!customerId) {
      console.error('Customer ID is missing')
      alert('顧客IDが見つかりません')
      router.push('/customer')
      return
    }

    console.log('Fetching customer data for ID:', customerId)
    const docRef = doc(db, 'customers', customerId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      console.log('Customer data:', docSnap.data())
      customer.value = docSnap.data()
    } else {
      console.error('No document found for ID:', customerId)
      alert('顧客情報が見つかりません')
      router.push('/customer')
    }
  } catch (error) {
    console.error('Error fetching customer:', error)
    alert('顧客情報の取得に失敗しました')
    router.push('/customer')
  }
})
</script>
