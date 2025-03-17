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
import { ref, onMounted } from 'vue'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'
import { useRouter } from 'vue-router'

const customer = ref({
  name: '',
  kana: '',
  phone: '',
  notes: '',
})
const router = useRouter()
const existingCustomers = ref([])

// 顧客データを取得
const fetchCustomers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'customers'))
    existingCustomers.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (e) {
    console.error('Error fetching customers: ', e)
  }
}

// 重複チェック
const checkDuplicates = () => {
  const newCustomer = customer.value
  const duplicates = existingCustomers.value.filter((existing) => {
    // 名前が完全一致
    const nameMatch = existing.name === newCustomer.name
    // 電話番号が一致（電話番号が入力されている場合のみ）
    const phoneMatch = newCustomer.phone && existing.phone === newCustomer.phone
    // カナが一致
    const kanaMatch = existing.kana === newCustomer.kana

    return nameMatch || phoneMatch || kanaMatch
  })

  return duplicates
}

const submitForm = async () => {
  try {
    // 重複チェック
    const duplicates = checkDuplicates()
    if (duplicates.length > 0) {
      const duplicateDetails = duplicates
        .map((d) => `名前: ${d.name}, カナ: ${d.kana}, 電話番号: ${d.phone}`)
        .join('\n')

      if (
        !confirm(
          `以下の顧客と重複する可能性があります。\n\n${duplicateDetails}\n\n登録を続行しますか？`,
        )
      ) {
        return
      }
    }

    const docRef = await addDoc(collection(db, 'customers'), {
      name: customer.value.name,
      kana: customer.value.kana,
      phone: customer.value.phone,
      notes: customer.value.notes,
      createAt: serverTimestamp(),
    })
    console.log('Document written with ID: ', docRef.id)
    // フォームをリセット
    customer.value = {
      name: '',
      kana: '',
      phone: '',
      notes: '',
    }
    router.push('/customer')
  } catch (e) {
    console.error('Error adding document: ', e)
  }
}

onMounted(() => {
  fetchCustomers()
})

const goBack = () => {
  router.push('/customer') // 一覧画面に戻る
}
</script>
