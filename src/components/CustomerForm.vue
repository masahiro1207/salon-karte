<template>
  <div class="bg-off-white p-8 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4 text-charcoal-black">顧客情報登録</h2>
    <form @submit.prevent="submitForm" class="space-y-4">
      <div class="flex flex-col">
        <label for="name" class="text-charcoal-black">名前</label>
        <input
          type="text"
          id="name"
          v-model="customer.name"
          class="border border-gray-300 rounded-md px-3 py-2 text-charcoal-black"
        />
      </div>
      <div class="flex flex-col">
        <label for="kana" class="text-charcoal-black">フリガナ</label>
        <input
          type="text"
          id="kana"
          v-model="customer.kana"
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
import { ref } from 'vue'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore' // serverTimestamp を追加
import { useRouter } from 'vue-router'

const customer = ref({
  name: '',
  kana: '',
  phone: '',
  notes: '',
})
const router = useRouter()

const submitForm = async () => {
  try {
    const docRef = await addDoc(collection(db, 'customers'), {
      name: customer.value.name,
      kana: customer.value.kana,
      phone: customer.value.phone,
      notes: customer.value.notes,
      createAt: serverTimestamp(), //customerIdを作成
    })
    console.log('Document written with ID: ', docRef.id)
    // フォームをリセット
    customer.value = {
      name: '',
      kana: '',
      phone: '',
      notes: '',
    }
    router.push('/customer') // 一覧画面に戻る
  } catch (e) {
    console.error('Error adding document: ', e)
  }
}
const goBack = () => {
  router.push('/customer') // 一覧画面に戻る
}
</script>
