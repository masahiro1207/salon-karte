<template>
  <div class="min-h-screen bg-off-white p-4 sm:p-8">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-8">
      <h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        {{ isEditMode ? '売上編集' : '売上登録' }}
      </h2>

      <form @submit.prevent="submitForm" class="space-y-4 sm:space-y-6">
        <!-- 日時 -->
        <div class="flex flex-col">
          <label for="dateTime" class="mb-1 sm:mb-2 text-sm sm:text-base font-medium">日時</label>
          <input
            type="date"
            id="dateTime"
            v-model="sale.dateTime"
            class="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-color3 focus:border-transparent"
          />
        </div>

        <!-- 顧客 -->
        <div class="flex flex-col">
          <label for="customer" class="mb-1 sm:mb-2 text-sm sm:text-base font-medium">顧客</label>
          <select
            id="customer"
            v-model="sale.customerId"
            class="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-color3 focus:border-transparent"
          >
            <option v-for="customer in customers" :key="customer.id" :value="customer.id">
              {{ customer.name }}
            </option>
          </select>
        </div>

        <!-- メニュー -->
        <div class="flex flex-col">
          <label for="menu" class="mb-1 sm:mb-2 text-sm sm:text-base font-medium">メニュー</label>
          <select
            id="menu"
            v-model="sale.menu"
            class="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-color3 focus:border-transparent"
          >
            <option v-for="menu in menus" :key="menu.id" :value="menu.name">{{ menu.name }}</option>
          </select>
        </div>

        <!-- 担当者 -->
        <div class="flex flex-col">
          <label for="staff" class="mb-1 sm:mb-2 text-sm sm:text-base font-medium">担当者</label>
          <input
            type="text"
            id="staff"
            v-model="sale.staff"
            class="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-color3 focus:border-transparent"
          />
        </div>

        <!-- 料金と割引 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label for="price" class="mb-1 sm:mb-2 text-sm sm:text-base font-medium">料金</label>
            <input
              type="number"
              id="price"
              v-model="sale.price"
              class="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-color3 focus:border-transparent"
            />
          </div>
          <div class="flex flex-col">
            <label for="discount" class="mb-1 sm:mb-2 text-sm sm:text-base font-medium">割引</label>
            <input
              type="number"
              id="discount"
              v-model="sale.discount"
              class="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-color3 focus:border-transparent"
            />
          </div>
        </div>

        <!-- 支払い方法 -->
        <div class="flex flex-col">
          <label for="paymentMethod" class="mb-1 sm:mb-2 text-sm sm:text-base font-medium"
            >支払い方法</label
          >
          <select
            id="paymentMethod"
            v-model="sale.paymentMethod"
            class="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-color3 focus:border-transparent"
          >
            <option value="現金">現金</option>
            <option value="クレジットカード">クレジットカード</option>
          </select>
        </div>

        <!-- 使用商品 -->
        <div class="flex flex-col">
          <label class="mb-1 sm:mb-2 text-sm sm:text-base font-medium">使用商品</label>
          <div class="space-y-3">
            <div
              v-for="(product, index) in sale.products"
              :key="index"
              class="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center"
            >
              <input
                type="text"
                v-model="product.name"
                placeholder="商品名"
                class="flex-1 px-3 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-color3 focus:border-transparent"
              />
              <div class="flex gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  v-model="product.count"
                  placeholder="個数"
                  class="w-24 px-3 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-color3 focus:border-transparent"
                />
                <button
                  type="button"
                  @click="removeProduct(index)"
                  class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm sm:text-base transition-colors"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            @click="addProduct"
            class="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm sm:text-base transition-colors"
          >
            商品追加
          </button>
        </div>

        <!-- 備考 -->
        <div class="flex flex-col">
          <label for="notes" class="mb-1 sm:mb-2 text-sm sm:text-base font-medium">備考</label>
          <textarea
            id="notes"
            v-model="sale.notes"
            class="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base h-24 focus:ring-2 focus:ring-color3 focus:border-transparent"
          ></textarea>
        </div>

        <!-- ボタン -->
        <div class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-6">
          <button
            type="button"
            @click="goBack"
            class="w-full sm:w-auto px-6 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm sm:text-base transition-colors"
          >
            戻る
          </button>
          <button
            type="submit"
            class="w-full sm:w-auto px-6 py-2 sm:py-3 bg-color3 hover:bg-opacity-90 text-white rounded-lg text-sm sm:text-base transition-colors"
          >
            {{ isEditMode ? '更新' : '登録' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { db } from '../firebase'
import { collection, addDoc, getDocs, Timestamp, doc, updateDoc } from 'firebase/firestore'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const sale = ref({
  customerId: '', // 初期値を""にする
  dateTime: '', // 初期値を""にする
  menu: '',
  staff: '',
  price: null,
  discount: null,
  paymentMethod: '現金', // 追加
  products: [{ name: '', count: 1 }],
  notes: '',
})
// 修正

const customers = ref([])
const menus = ref([])
//修正
const isEditMode = ref(false)
//修正
const saleId = route.query.saleId

//修正
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

  // Handle invalid input (return empty string or throw an error)
  return '' // Or throw new Error("Invalid date input")
}
const addProduct = () => {
  sale.value.products.push({ name: '', count: 1 })
}

const removeProduct = (index) => {
  sale.value.products.splice(index, 1)
}

const goBack = () => {
  router.push('/sales')
}

const submitForm = async () => {
  try {
    // 日付が文字列形式で入力されているため、新しいDateオブジェクトを作成
    const dateTime = new Date(sale.value.dateTime)

    const formattedSale = {
      ...sale.value,
      dateTime: Timestamp.fromDate(dateTime),
      createdAt: Timestamp.now(), // createAtをcreatedAtに修正
      // 数値型のフィールドを確実に数値に変換
      price: Number(sale.value.price) || 0,
      discount: Number(sale.value.discount) || 0,
      // 空の商品を除外
      products: sale.value.products.filter((product) => product.name.trim() !== ''),
    }

    if (isEditMode.value && saleId) {
      const docRef = doc(db, 'sales', saleId)
      await updateDoc(docRef, formattedSale)
      console.log('Document updated with ID: ', saleId)
    } else {
      const docRef = await addDoc(collection(db, 'sales'), formattedSale)
      console.log('Document successfully written with ID: ', docRef.id)
    }
    router.push('/sales')
  } catch (e) {
    console.error('Error adding/updating document: ', e)
    alert('保存中にエラーが発生しました。')
  }
}
//メニュー選択したら、価格をセットする
watch(
  () => sale.value.menu,
  (newMenu) => {
    const selectedMenu = menus.value.find((menu) => menu.name === newMenu)
    sale.value.price = selectedMenu ? selectedMenu.price : null
  },
)
onMounted(async () => {
  try {
    // 顧客とメニューのデータを取得
    const customerSnapshot = await getDocs(collection(db, 'customers'))
    customers.value = customerSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.kana.localeCompare(b.kana, 'ja'))

    const menuSnapshot = await getDocs(collection(db, 'menus'))
    menus.value = menuSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.kana.localeCompare(b.kana, 'ja'))

    // URLクエリパラメータから予約情報を取得
    const customerId = route.query.customerId
    const eventId = route.query.eventId
    const menu = decodeURIComponent(route.query.menu || '')
    const dateTime = route.query.dateTime
      ? new Date(decodeURIComponent(route.query.dateTime))
      : new Date()
    const staff = route.query.staff ? decodeURIComponent(route.query.staff) : ''

    // 予約情報をフォームに設定
    if (customerId && eventId) {
      sale.value = {
        ...sale.value,
        customerId,
        dateTime: formatDate(dateTime),
        menu,
        staff,
        price: null,
        discount: 0,
        paymentMethod: '現金',
        products: [{ name: '', count: 1 }],
        notes: '',
      }

      // メニューの価格を設定
      const selectedMenu = menus.value.find((m) => m.name === menu)
      if (selectedMenu) {
        sale.value.price = selectedMenu.price
      }
    }
  } catch (e) {
    console.error('Error getting documents:', e)
  }
})
</script>
