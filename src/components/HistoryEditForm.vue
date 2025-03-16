<template>
  <div class="bg-off-white p-8 rounded-lg shadow-md text-charcoal-black mx-auto max-w-4xl">
    <h2 class="text-2xl font-bold mb-4">施術履歴編集</h2>
    <p class="mb-4">顧客名：{{ customerName }}</p>
    <form @submit.prevent="submitForm" class="space-y-4">
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
        <label for="notes">備考</label>
        <textarea
          id="notes"
          v-model="history.notes"
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
import { ref, onMounted, toRaw, watch } from 'vue'
import { db } from '../firebase'
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  Timestamp,
  query,
  where,
  getDocs as firestoreGetDocs,
} from 'firebase/firestore'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const historyId = route.params.id
const customerName = ref('')
const menus = ref([])

// 元のデータを保持する変数
const originalHistory = ref({
  customerId: '',
  dateTime: '',
  menu: '',
  staff: '',
  price: null,
  paymentMethod: '現金',
  products: [{ name: '', count: 1 }],
  notes: '',
})

const history = ref({
  customerId: '',
  dateTime: '',
  menu: '',
  staff: '',
  price: null,
  paymentMethod: '現金',
  products: [{ name: '', count: 1 }],
  notes: '',
})

const addProduct = () => {
  history.value.products.push({ name: '', count: 1 })
}

const removeProduct = (index) => {
  history.value.products.splice(index, 1)
}

const formatDate = (input) => {
  // Check if the input is already a valid date object
  if (input instanceof Date) {
    const year = input.getFullYear()
    const month = (input.getMonth() + 1).toString().padStart(2, '0')
    const day = input.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Check if the input is a Timestamp object
  if (input && typeof input.toDate === 'function') {
    const date = input.toDate()
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Check if the input is a string
  if (typeof input === 'string') {
    const date = new Date(input)
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }

  return '' // Invalid input
}

const goBack = () => {
  router.push(`/history/${history.value.customerId}`)
}

const submitForm = async () => {
  try {
    const docRef = doc(db, 'histories', historyId)

    // 既存のデータを取得
    const existingDoc = await getDoc(docRef)
    const existingData = existingDoc.exists() ? existingDoc.data() : {}

    // 更新データの作成
    const formattedHistory = {
      customerId: history.value.customerId,
      dateTime: Timestamp.fromDate(new Date(history.value.dateTime)),
      menu: history.value.menu,
      staff: history.value.staff,
      price: Number(history.value.price),
      paymentMethod: history.value.paymentMethod,
      products: history.value.products.filter(p => p.name && p.count), // 空の商品を除外
      notes: history.value.notes,
      updateAt: Timestamp.now(),
      createAt: existingData.createAt || Timestamp.now(), // 既存のcreateAtを保持、なければ現在時刻
    }

    // 履歴を更新
    await updateDoc(docRef, formattedHistory)
    console.log('History updated with ID: ', historyId)

    // 更新された履歴情報のIDを使って関連する売上情報を検索
    const q = query(collection(db, 'sales'), where('historyId', '==', historyId))
    const querySnapshot = await firestoreGetDocs(q)

    // 関連する売上情報が見つかった場合、その情報を更新
    for (const doc of querySnapshot.docs) {
      const salesRef = doc.ref
      const existingSale = await getDoc(salesRef)
      const existingSaleData = existingSale.exists() ? existingSale.data() : {}

      const formattedSale = {
        customerId: history.value.customerId,
        dateTime: Timestamp.fromDate(new Date(history.value.dateTime)),
        menu: history.value.menu,
        staff: history.value.staff,
        price: Number(history.value.price),
        paymentMethod: history.value.paymentMethod,
        products: history.value.products.filter(p => p.name && p.count), // 空の商品を除外
        notes: history.value.notes,
        updateAt: Timestamp.now(),
        createAt: existingSaleData.createAt || Timestamp.now(), // 既存のcreateAtを保持
        historyId: historyId // historyIdを保持
      }

      await updateDoc(salesRef, formattedSale)
      console.log('Sale updated with ID: ', doc.id)
    }

    router.push(`/history/${history.value.customerId}`)
  } catch (e) {
    console.error('Error updating documents: ', e)
  }
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

    // 履歴データを取得
    const docRef = doc(db, 'histories', historyId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()

      // 日付を適切にフォーマット
      const formattedDate = formatDate(data.dateTime)

      // データを設定
      history.value = {
        customerId: data.customerId,
        dateTime: formattedDate,
        menu: data.menu,
        staff: data.staff,
        price: data.price,
        paymentMethod: data.paymentMethod || '現金',
        products: data.products || [{ name: '', count: 1 }],
        notes: data.notes || '',
      }

      // メニューに応じた価格をセット
      if (history.value.menu) {
        const selectedMenu = menus.value.find((menu) => menu.name === history.value.menu)
        if (selectedMenu && !history.value.price) {
          history.value.price = selectedMenu.price
        }
      }

      // 顧客名を取得
      const customerRef = doc(db, 'customers', history.value.customerId)
      const customerSnap = await getDoc(customerRef)
      if (customerSnap.exists()) {
        customerName.value = customerSnap.data().name
      }
    }
  } catch (e) {
    console.error('Error getting documents: ', e)
  }
})
</script>
