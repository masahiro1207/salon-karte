<template>
  <div class="bg-off-white p-8 rounded-lg shadow-md text-charcoal-black mx-auto max-w-4xl">
    <h2 class="text-2xl font-bold mb-4">売上編集</h2>
    <form @submit.prevent="submitForm" class="space-y-4">
      <div class="flex flex-col">
        <label for="sale-dateTime">日時</label>
        <input
          type="date"
          id="sale-dateTime"
          v-model="sale.dateTime"
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        />
      </div>
      <div class="flex flex-col">
        <label for="sale-customer">顧客</label>
        <select
          id="sale-customer"
          v-model="sale.customerId"
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        >
          <option v-for="customer in customers" :key="customer.id" :value="customer.id">
            {{ customer.name }}
          </option>
        </select>
      </div>
      <div class="flex flex-col">
        <label for="sale-menu">メニュー</label>
        <select
          id="sale-menu"
          v-model="sale.menu"
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        >
          <option v-for="menu in menus" :key="menu.id" :value="menu.name">{{ menu.name }}</option>
        </select>
      </div>
      <div class="flex flex-col">
        <label for="sale-staff">担当者</label>
        <input
          type="text"
          id="sale-staff"
          v-model="sale.staff"
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        />
      </div>
      <div class="flex flex-col">
        <label for="sale-price">料金</label>
        <input
          type="number"
          id="sale-price"
          v-model="sale.price"
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        />
      </div>
      <div class="flex flex-col">
        <label for="sale-discount">割引</label>
        <input
          type="number"
          id="sale-discount"
          v-model="sale.discount"
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        />
      </div>
      <div class="flex flex-col">
        <label for="sale-paymentMethod">支払い方法</label>
        <select
          id="sale-paymentMethod"
          v-model="sale.paymentMethod"
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        >
          <option value="現金">現金</option>
          <option value="クレジットカード">クレジットカード</option>
        </select>
      </div>
      <div class="flex flex-col">
        <label for="sale-products">使用商品</label>
        <div v-for="(product, index) in sale.products" :key="index" class="mb-2">
          <input
            type="text"
            :id="'sale-product-name-' + index"
            v-model="product.name"
            placeholder="商品名"
            class="border border-gray-300 rounded-md px-3 py-2 w-40 mr-2 text-charcoal-black"
          />
          <input
            type="number"
            :id="'sale-product-count-' + index"
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
        <label for="sale-notes">備考</label>
        <textarea
          id="sale-notes"
          v-model="sale.notes"
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
import { ref, onMounted, toRaw } from 'vue'
import { db } from '../firebase'
import { collection, getDoc, doc, getDocs, updateDoc, Timestamp } from 'firebase/firestore'
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()
const router = useRouter()
const saleId = route.params.id
const customers = ref([])
const menus = ref([])
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}
//元のデータを保持する変数
const originalSale = ref({
  customerId: '',
  dateTime: '',
  menu: '',
  staff: '',
  price: null,
  products: [{ name: '', count: 1 }],
  notes: '',
  paymentMethod: '現金',
  discount: null,
})
const sale = ref({
  customerId: '',
  dateTime: '',
  menu: '',
  staff: '',
  price: null,
  discount: null,
  paymentMethod: '現金',
  products: [{ name: '', count: 1 }],
  notes: '',
})
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
    const docRef = doc(db, 'sales', saleId)
    const formattedSale = {
      ...sale.value,
      dateTime: Timestamp.fromDate(new Date(sale.value.dateTime)),
    }
    await updateDoc(docRef, formattedSale)
    console.log('Document updated with ID: ', saleId)
    // originalSaleに最新のsaleオブジェクトをコピー
    Object.assign(originalSale.value, toRaw(sale.value))
    router.push('/sales')
  } catch (e) {
    console.error('Error updating document: ', e)
  }
}

onMounted(async () => {
  try {
    const customerSnapshot = await getDocs(collection(db, 'customers'))
    customers.value = customerSnapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          name: `${data.lastName || ''} ${data.firstName || ''}`.trim(),
          ...data,
        }
      })
      .sort((a, b) => {
        const kanaA = (a.lastNameKana || '') + (a.firstNameKana || '')
        const kanaB = (b.lastNameKana || '') + (b.firstNameKana || '')
        return kanaA.localeCompare(kanaB, 'ja')
      })
    const menuSnapshot = await getDocs(collection(db, 'menus'))
    menus.value = menuSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const kanaA = (a.kana || '') + (a.lastNameKana || '') + (a.firstNameKana || '')
        const kanaB = (b.kana || '') + (b.lastNameKana || '') + (b.firstNameKana || '')
        return kanaA.localeCompare(kanaB, 'ja')
      })
    const docRef = doc(db, 'sales', saleId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      // 元のデータをoriginalSaleにコピー（ディープコピー）
      Object.assign(originalSale.value, toRaw(docSnap.data()))
      originalSale.value.dateTime = formatDate(docSnap.data().dateTime.toDate())

      // クエリパラメータからデータを取得
      const queryData = route.query
      if (queryData.customerId) {
        originalSale.value.customerId = queryData.customerId
      }
      if (queryData.dateTime) {
        originalSale.value.dateTime = formatDate(new Date(queryData.dateTime))
      }
      if (queryData.menu) {
        originalSale.value.menu = queryData.menu
      }
      if (queryData.staff) {
        originalSale.value.staff = queryData.staff
      }
      if (queryData.price) {
        originalSale.value.price = Number(queryData.price)
      }
      if (queryData.discount) {
        originalSale.value.discount = Number(queryData.discount)
      }
      if (queryData.paymentMethod) {
        originalSale.value.paymentMethod = queryData.paymentMethod
      }
      if (queryData.products) {
        originalSale.value.products = JSON.parse(queryData.products)
      }
      if (queryData.notes) {
        originalSale.value.notes = queryData.notes
      }

      // 予約情報から引き継ぐ
      const eventId = route.query.eventId
      if (eventId) {
        const reservationRef = doc(db, 'reservations', eventId)
        const reservationSnap = await getDoc(reservationRef)
        if (reservationSnap.exists()) {
          originalSale.value.dateTime = formatDate(reservationSnap.data().dateTime.toDate())
        }
      }

      // 初期値をセット
      sale.value = JSON.parse(JSON.stringify(originalSale.value))
    }
  } catch (e) {
    console.error('Error getting document: ', e)
  }
})
</script>
