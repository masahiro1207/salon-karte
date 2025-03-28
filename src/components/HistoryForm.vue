<template>
  <div class="bg-off-white p-8 rounded-lg shadow-md text-charcoal-black mx-auto max-w-4xl">
    <h2 class="text-2xl font-bold mb-4">施術履歴登録</h2>
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
      <!-- 支払い方法の追加 -->
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
import { ref, onMounted, watch } from 'vue'
import { db } from '../firebase'
import { collection, addDoc, getDocs, getDoc, doc, Timestamp, updateDoc } from 'firebase/firestore'
import { useRouter, useRoute } from 'vue-router'
import { format } from 'date-fns'

const router = useRouter()
const route = useRoute()
const customerId = route.params.id
const historyId = route.params.historyId
const customerName = ref('')
const menus = ref([])
const history = ref({
  customerId: customerId,
  dateTime: '',
  menu: '',
  staff: '',
  price: null,
  paymentMethod: '現金', // 初期値を現金に設定
  products: [{ name: '', count: 1 }],
  notes: '',
})
const addProduct = () => {
  history.value.products.push({ name: '', count: 1 })
}

const removeProduct = (index) => {
  history.value.products.splice(index, 1)
}
const goBack = () => {
  router.push(`/history/${customerId}`)
}
const submitForm = async () => {
  try {
    if (!history.value.dateTime) {
      alert('日時を入力してください。')
      return
    }

    const formattedHistory = {
      ...history.value,
      dateTime: Timestamp.fromDate(new Date(history.value.dateTime)),
      createAt: Timestamp.now(),
    }

    // 編集時は既存のデータを更新、新規作成時は新しいデータを追加
    if (historyId) {
      const historyRef = doc(db, 'histories', historyId)
      await updateDoc(historyRef, formattedHistory)
    } else {
      const historyRef = await addDoc(collection(db, 'histories'), formattedHistory)
      console.log('Document written with ID: ', historyRef.id)
    }

    // 顧客の最終来店日を更新
    const customerRef = doc(db, 'customers', customerId)
    await updateDoc(customerRef, {
      lastVisit: formattedHistory.dateTime,
    })

    // 売上データも作成
    const saleData = {
      ...formattedHistory,
      createAt: Timestamp.now(),
    }
    await addDoc(collection(db, 'sales'), saleData)

    router.push(`/history/${customerId}`) // 一覧画面に戻る
  } catch (e) {
    console.error('Error adding document: ', e)
    alert('履歴の保存に失敗しました。')
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

    // 顧客名を取得
    const docRef = doc(db, 'customers', customerId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      customerName.value = docSnap.data().name
    } else {
      console.log('No such document!')
    }

    // 編集時は既存のデータを取得
    if (historyId) {
      const historyRef = doc(db, 'histories', historyId)
      const historySnap = await getDoc(historyRef)
      if (historySnap.exists()) {
        const historyData = historySnap.data()
        history.value = {
          ...historyData,
          dateTime: format(historyData.dateTime.toDate(), 'yyyy-MM-dd'),
        }
      }
    } else {
      // 新規作成時はフォームデータの初期化
      const initializeForm = () => {
        const datetimeParam = route.query.datetime
        const menuParam = route.query.menu

        if (datetimeParam) {
          try {
            const datetime = new Date(decodeURIComponent(datetimeParam))
            history.value.dateTime = format(datetime, 'yyyy-MM-dd')
          } catch (error) {
            console.error('Error parsing datetime:', error)
            // エラーの場合は現在の日時を設定
            const now = new Date()
            history.value.dateTime = format(now, 'yyyy-MM-dd')
          }
        }

        if (menuParam) {
          history.value.menu = decodeURIComponent(menuParam)
        }
      }

      initializeForm()
    }
  } catch (e) {
    console.error('Error getting documents: ', e)
  }
})
</script>
