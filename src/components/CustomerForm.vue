<template>
  <div class="bg-off-white p-8 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4 text-charcoal-black">顧客情報登録</h2>
    <form @submit.prevent="submitForm" class="space-y-4">
      <div class="flex flex-col">
        <label for="lastName" class="text-charcoal-black">姓</label>
        <input
          type="text"
          id="lastName"
          v-model="customer.lastName"
          @input="handleLastNameChange"
          class="border border-gray-300 rounded-md px-3 py-2 text-charcoal-black"
          required
        />
      </div>
      <div class="flex flex-col">
        <label for="firstName" class="text-charcoal-black">名</label>
        <input
          type="text"
          id="firstName"
          v-model="customer.firstName"
          @input="handleFirstNameChange"
          class="border border-gray-300 rounded-md px-3 py-2 text-charcoal-black"
          required
        />
      </div>
      <div class="flex flex-col">
        <label for="lastNameKana" class="text-charcoal-black">姓（フリガナ）</label>
        <input
          type="text"
          id="lastNameKana"
          v-model="customer.lastNameKana"
          class="border border-gray-300 rounded-md px-3 py-2 text-charcoal-black bg-gray-50"
          required
          readonly
        />
      </div>
      <div class="flex flex-col">
        <label for="firstNameKana" class="text-charcoal-black">名（フリガナ）</label>
        <input
          type="text"
          id="firstNameKana"
          v-model="customer.firstNameKana"
          class="border border-gray-300 rounded-md px-3 py-2 text-charcoal-black bg-gray-50"
          required
          readonly
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
import { ref, onMounted, computed } from 'vue'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'
import { useRouter } from 'vue-router'

const customer = ref({
  lastName: '',
  firstName: '',
  lastNameKana: '',
  firstNameKana: '',
  phone: '',
  notes: '',
})

// 漢字からカタカナへの変換関数
const convertToKana = (text) => {
  if (!text) return ''
  try {
    // ひらがなをカタカナに変換
    const hiragana = text.replace(/[\u3041-\u3096]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) + 0x60),
    )
    // カタカナを返す
    return hiragana
  } catch (error) {
    console.error('Error converting to kana:', error)
    return ''
  }
}

// 姓の変更を監視
const handleLastNameChange = () => {
  customer.value.lastNameKana = convertToKana(customer.value.lastName)
}

// 名の変更を監視
const handleFirstNameChange = () => {
  customer.value.firstNameKana = convertToKana(customer.value.firstName)
}

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

onMounted(() => {
  fetchCustomers()
})

// 重複チェック
const checkDuplicates = () => {
  const newCustomer = customer.value
  const duplicates = existingCustomers.value.filter((existing) => {
    // 姓名が完全一致
    const nameMatch =
      existing.lastName === newCustomer.lastName && existing.firstName === newCustomer.firstName
    // 電話番号が一致（電話番号が入力されている場合のみ）
    const phoneMatch = newCustomer.phone && existing.phone === newCustomer.phone
    // カナが一致
    const kanaMatch =
      existing.lastNameKana === newCustomer.lastNameKana &&
      existing.firstNameKana === newCustomer.firstNameKana

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
        .map(
          (d) =>
            `名前: ${d.lastName}${d.firstName}, カナ: ${d.lastNameKana}${d.firstNameKana}, 電話番号: ${d.phone}`,
        )
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
      lastName: customer.value.lastName,
      firstName: customer.value.firstName,
      lastNameKana: customer.value.lastNameKana,
      firstNameKana: customer.value.firstNameKana,
      phone: customer.value.phone,
      notes: customer.value.notes,
      createAt: serverTimestamp(),
    })
    console.log('Document written with ID: ', docRef.id)
    // フォームをリセット
    customer.value = {
      lastName: '',
      firstName: '',
      lastNameKana: '',
      firstNameKana: '',
      phone: '',
      notes: '',
    }
    router.push('/customer')
  } catch (e) {
    console.error('Error adding document: ', e)
  }
}

const goBack = () => {
  router.push('/customer') // 一覧画面に戻る
}

// 新規顧客登録ページへ遷移する関数
const goToAddCustomer = () => {
  router.push('/addcustomer')
}
</script>
