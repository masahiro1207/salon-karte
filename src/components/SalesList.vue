<template>
  <div class="mx-auto p-4 sm:p-8 bg-white max-w-8xl text-charcoal-black">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-4">
      <h2 class="text-xl sm:text-2xl font-bold">売上管理</h2>
      <button
        @click="saleform"
        class="w-full sm:w-auto bg-color3 hover:bg-light-gray text-white px-4 py-2 rounded-md"
      >
        売上追加
      </button>
    </div>
    <div class="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-2">
        <div class="w-full sm:w-1/2">
          <label for="startDate" class="block text-sm mb-1">開始日:</label>
          <input
            type="date"
            id="startDate"
            v-model="startDate"
            @change="filterSales"
            class="w-full border rounded-md px-2 py-1"
          />
        </div>
        <div class="w-full sm:w-1/2">
          <label for="endDate" class="block text-sm mb-1">終了日:</label>
          <input
            type="date"
            id="endDate"
            v-model="endDate"
            @change="filterSales"
            class="w-full border rounded-md px-2 py-1"
          />
        </div>
      </div>
      <div class="flex flex-col">
        <label for="customerFilter" class="block text-sm mb-1">顧客:</label>
        <select
          id="customerFilter"
          v-model="selectedCustomer"
          @change="filterSales"
          class="w-full border rounded-md px-2 py-1"
        >
          <option value="">すべて</option>
          <option v-for="customer in customers" :key="customer.id" :value="customer.id">
            {{ customer.name }}
          </option>
        </select>
      </div>
      <div class="flex flex-col">
        <label for="staffFilter" class="block text-sm mb-1">担当者:</label>
        <select
          id="staffFilter"
          v-model="selectedStaff"
          @change="filterSales"
          class="w-full border rounded-md px-2 py-1"
        >
          <option value="">すべて</option>
          <option v-for="staff in staffs" :key="staff" :value="staff">{{ staff }}</option>
        </select>
      </div>
      <div class="flex flex-col">
        <label for="menuFilter" class="block text-sm mb-1">メニュー:</label>
        <select
          id="menuFilter"
          v-model="selectedMenu"
          @change="filterSales"
          class="w-full border rounded-md px-2 py-1"
        >
          <option value="">すべて</option>
          <option v-for="menu in menus" :key="menu.id" :value="menu.name">{{ menu.name }}</option>
        </select>
      </div>
      <div class="flex flex-col">
        <label for="paymentMethod" class="block text-sm mb-1">支払い方法:</label>
        <select
          id="paymentMethod"
          v-model="selectedPaymentMethod"
          @change="filterSales"
          class="w-full border rounded-md px-2 py-1"
        >
          <option value="">すべて</option>
          <option value="現金">現金</option>
          <option value="クレジットカード">クレジットカード</option>
        </select>
      </div>
    </div>
    <div class="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-gray-100 p-4 rounded-lg">
        <div class="text-xs sm:text-sm text-gray-600">現金合計</div>
        <div class="text-lg sm:text-xl font-bold">¥{{ cashTotal.toLocaleString() }}</div>
      </div>
      <div class="bg-gray-100 p-4 rounded-lg">
        <div class="text-xs sm:text-sm text-gray-600">クレジット合計</div>
        <div class="text-lg sm:text-xl font-bold">¥{{ creditCardTotal.toLocaleString() }}</div>
      </div>
      <div class="bg-gray-100 p-4 rounded-lg">
        <div class="text-xs sm:text-sm text-gray-600">合計金額</div>
        <div class="text-lg sm:text-xl font-bold">¥{{ totalSales.toLocaleString() }}</div>
      </div>
      <div class="bg-gray-100 p-4 rounded-lg">
        <div class="text-xs sm:text-sm text-gray-600">合計件数</div>
        <div class="text-lg sm:text-xl font-bold">{{ filteredSales.length }}件</div>
      </div>
    </div>
    <div v-if="groupedSales.length > 0">
      <div v-for="group in groupedSales" :key="group.date" class="mb-8">
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 bg-gray-100 p-4 rounded-lg gap-2"
        >
          <h3 class="text-lg font-bold">{{ group.date }}</h3>
          <div class="flex flex-col sm:flex-row gap-2 sm:space-x-4 w-full sm:w-auto">
            <div class="text-sm">
              <span class="text-gray-600">現金: </span>
              <span class="font-bold">¥{{ group.cashAmount.toLocaleString() }}</span>
            </div>
            <div class="text-sm">
              <span class="text-gray-600">クレジット: </span>
              <span class="font-bold">¥{{ group.creditAmount.toLocaleString() }}</span>
            </div>
            <div class="text-sm">
              <span class="text-gray-600">合計: </span>
              <span class="font-bold">¥{{ group.totalAmount.toLocaleString() }}</span>
            </div>
          </div>
        </div>
        <div class="block sm:hidden space-y-4">
          <div
            v-for="sale in group.sales"
            :key="sale.id"
            class="bg-white rounded-lg shadow p-4 hover:bg-gray-50"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="font-medium">{{ sale.customerName }}</div>
              <div class="text-sm text-gray-600">{{ formatTime(sale.dateTime) }}</div>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div><span class="text-gray-600">メニュー:</span> {{ sale.menu }}</div>
              <div><span class="text-gray-600">料金:</span> ¥{{ sale.price.toLocaleString() }}</div>
              <div>
                <span class="text-gray-600">割引:</span> ¥{{
                  (sale.discount || 0).toLocaleString()
                }}
              </div>
              <div><span class="text-gray-600">支払方法:</span> {{ sale.paymentMethod }}</div>
            </div>
            <div class="mt-2 text-sm" v-if="sale.products && sale.products.length">
              <div class="text-gray-600">使用商品:</div>
              <div v-for="product in sale.products" :key="product.name">
                {{ product.name }} x {{ product.count }}
              </div>
            </div>
            <div class="mt-2 text-sm" v-if="sale.notes">
              <span class="text-gray-600">備考:</span> {{ sale.notes }}
            </div>
            <div class="flex justify-end space-x-2 mt-3">
              <button
                @click="editSale(sale.id)"
                class="bg-color3 hover:bg-opacity-90 px-3 py-1 rounded-md text-white text-sm"
              >
                編集
              </button>
              <button
                @click="deleteSale(sale.id)"
                class="bg-color3 hover:bg-opacity-90 px-3 py-1 rounded-md text-white text-sm"
              >
                削除
              </button>
            </div>
          </div>
        </div>
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full border-collapse table-auto min-w-[800px]">
            <thead class="bg-color1 text-white">
              <tr>
                <th class="border border-gray-300 p-2 text-color3 w-[2%]">時間</th>
                <th class="border border-gray-300 p-2 text-color3 w-[6%]">顧客</th>
                <th class="border border-gray-300 p-2 text-color3 w-[8%]">メニュー</th>
                <th class="border border-gray-300 p-2 text-color3 w-[2%]">料金</th>
                <th class="border border-gray-300 p-2 text-color3 w-[4%]">商品</th>
                <th class="border border-gray-300 p-2 text-color3 w-[4%]">割引</th>
                <th class="border border-gray-300 p-2 text-color3 w-[7%]">支払方法</th>
                <th class="border border-gray-300 p-2 text-color3 w-[15%]">備考</th>
                <th class="border border-gray-300 p-2 text-color3 w-[5%]">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in group.sales" :key="sale.id" class="hover:bg-gray-50">
                <td class="border border-gray-300 p-2  text-center">{{ formatTime(sale.dateTime) }}</td>
                <td class="border border-gray-300 p-2 whitespace-normal">{{ sale.customerName }}</td>
                <td class="border border-gray-300 p-2 whitespace-normal">{{ sale.menu }}</td>
                <td class="border border-gray-300 p-2 text-right">
                  ¥{{ sale.price.toLocaleString() }}
                </td>
                <td class="border border-gray-300 p-2 whitespace-normal">
                  <div v-for="product in sale.products" :key="product.name">
                    {{ product.name }} x {{ product.count }}
                  </div>
                </td>
                <td class="border border-gray-300 p-2 text-right">
                  ¥{{ (sale.discount || 0).toLocaleString() }}
                </td>
                <td class="border border-gray-300 p-2">{{ sale.paymentMethod }}</td>
                <td class="border border-gray-300 p-2 whitespace-normal">{{ sale.notes }}</td>
                <td class="border border-gray-300 p-2">
                  <div class="flex justify-center space-x-2">
                    <button
                      @click="editSale(sale.id)"
                      class="bg-color3 hover:bg-opacity-90 px-3 py-1 rounded-md text-white text-sm"
                    >
                      編集
                    </button>
                    <button
                      @click="deleteSale(sale.id)"
                      class="bg-color3 hover:bg-opacity-90 px-3 py-1 rounded-md text-white text-sm"
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <p v-else class="text-smoke-gray text-center py-4">登録されている売上はありません</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '../firebase'
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  getDoc,
  where,
} from 'firebase/firestore'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const sales = ref([])
const customers = ref([])
const menus = ref([])
const selectedCustomer = ref('')
const selectedStaff = ref('')
const selectedMenu = ref('')
const startDate = ref('')
const endDate = ref('')
const staffs = ref([])
const selectedPaymentMethod = ref('')

const formatDate = (input) => {
  if (input instanceof Date) {
    const year = input.getFullYear()
    const month = (input.getMonth() + 1).toString().padStart(2, '0')
    const day = input.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  if (input && typeof input.toDate === 'function') {
    const date = input.toDate()
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  if (typeof input === 'string') {
    const date = new Date(input)
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }

  return ''
}

const saleform = () => {
  router.push('/saleform')
}
const editSale = (id) => {
  const sale = sales.value.find((s) => s.id === id)
  if (sale) {
    router.push({
      path: `/editsale/${id}`,
      query: {
        customerId: sale.customerId,
        customerName: sale.customerName,
        dateTime: sale.dateTime.toDate ? sale.dateTime.toDate().toISOString() : sale.dateTime,
        menu: sale.menu,
        staff: sale.staff,
        price: sale.price,
        discount: sale.discount,
        paymentMethod: sale.paymentMethod,
        products: JSON.stringify(sale.products || []),
        notes: sale.notes,
      },
    })
  }
}
const deleteSale = async (id) => {
  if (confirm('本当に削除しますか？')) {
    try {
      // 売上データを削除
      await deleteDoc(doc(db, 'sales', id))

      // 関連する施術履歴を検索して削除
      const sale = sales.value.find((s) => s.id === id)
      if (sale) {
        const historiesQuery = query(
          collection(db, 'histories'),
          where('customerId', '==', sale.customerId),
          where('dateTime', '==', sale.dateTime),
        )
        const historiesSnapshot = await getDocs(historiesQuery)
        for (const historyDoc of historiesSnapshot.docs) {
          await deleteDoc(doc(db, 'histories', historyDoc.id))
        }
      }

      sales.value = sales.value.filter((sale) => sale.id !== id)
    } catch (e) {
      console.error('Error deleting document: ', e)
    }
  }
}

const filterSales = () => {
  // フィルター条件が変更されたときに実行される
}

const filteredSales = computed(() => {
  let filtered = sales.value
  if (startDate.value) {
    filtered = filtered.filter((sale) => {
      const saleDate = sale.dateTime.toDate ? sale.dateTime.toDate() : new Date(sale.dateTime)
      return saleDate >= new Date(startDate.value)
    })
  }
  if (endDate.value) {
    filtered = filtered.filter((sale) => {
      const saleDate = sale.dateTime.toDate ? sale.dateTime.toDate() : new Date(sale.dateTime)
      return saleDate <= new Date(endDate.value)
    })
  }

  if (selectedCustomer.value) {
    filtered = filtered.filter((sale) => sale.customerId === selectedCustomer.value)
  }

  if (selectedStaff.value) {
    filtered = filtered.filter((sale) => sale.staff === selectedStaff.value)
  }

  if (selectedMenu.value) {
    filtered = filtered.filter((sale) => sale.menu === selectedMenu.value)
  }
  if (selectedPaymentMethod.value) {
    filtered = filtered.filter((sale) => sale.paymentMethod === selectedPaymentMethod.value)
  }
  return filtered
})

const totalSales = computed(() => {
  return filteredSales.value.reduce((sum, sale) => sum + sale.price - (sale.discount || 0), 0)
})
const cashTotal = computed(() => {
  return filteredSales.value.reduce((sum, sale) => {
    if (sale.paymentMethod === '現金') {
      return sum + sale.price - (sale.discount || 0)
    }
    return sum
  }, 0)
})

const creditCardTotal = computed(() => {
  return filteredSales.value.reduce((sum, sale) => {
    if (sale.paymentMethod === 'クレジットカード') {
      return sum + sale.price - (sale.discount || 0)
    }
    return sum
  }, 0)
})

const groupedSales = computed(() => {
  const groups = {}
  filteredSales.value.forEach((sale) => {
    const date = formatDate(sale.dateTime)
    if (!groups[date]) {
      groups[date] = {
        sales: [],
        totalAmount: 0,
        cashAmount: 0,
        creditAmount: 0,
      }
    }
    groups[date].sales.push(sale)
    const amount = sale.price - (sale.discount || 0)
    groups[date].totalAmount += amount
    if (sale.paymentMethod === '現金') {
      groups[date].cashAmount += amount
    } else if (sale.paymentMethod === 'クレジットカード') {
      groups[date].creditAmount += amount
    }
  })

  // 日付ごとのグループを新しい順（降順）にソート
  return Object.entries(groups)
    .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
    .map(([date, data]) => ({
      date,
      ...data,
      // 各日付内の売上を時系列順（昇順）にソート
      sales: data.sales.sort((a, b) => {
        const timeA = a.dateTime.toDate ? a.dateTime.toDate() : new Date(a.dateTime)
        const timeB = b.dateTime.toDate ? b.dateTime.toDate() : new Date(b.dateTime)
        return timeA - timeB
      }),
    }))
})

const formatTime = (dateTime) => {
  if (!dateTime) return ''

  let date
  if (typeof dateTime === 'string') {
    date = new Date(dateTime)
  } else if (typeof dateTime.toDate === 'function') {
    date = dateTime.toDate()
  } else {
    date = new Date(dateTime)
  }

  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

onMounted(async () => {
  try {
    // URLクエリパラメータからデータを取得
    if (route.query.customerId) {
      selectedCustomer.value = route.query.customerId
    }
    if (route.query.startDate) {
      startDate.value = route.query.startDate
    }
    if (route.query.endDate) {
      endDate.value = route.query.endDate
    }
    if (route.query.selectedMenu) {
      selectedMenu.value = route.query.selectedMenu
    }
    if (route.query.selectedStaff) {
      selectedStaff.value = route.query.selectedStaff
    }

    // salesコレクションからデータを取得
    const q = query(collection(db, 'sales'), orderBy('createAt', 'desc'))
    const querySnapshot = await getDocs(q)
    sales.value = []
    const customerPromises = []
    const customerMap = {}

    for (const saleDoc of querySnapshot.docs) {
      const data = saleDoc.data()
      if (data.customerId) {
        customerPromises.push(getDoc(doc(db, 'customers', data.customerId)))
      }
    }

    const customerDocs = await Promise.all(customerPromises)
    customerDocs.forEach((customerDoc) => {
      if (customerDoc.exists()) {
        const data = customerDoc.data()
        customerMap[customerDoc.id] = `${data.lastName || ''} ${data.firstName || ''}`.trim()
      }
    })

    const menuSnapshot = await getDocs(collection(db, 'menus'))
    menus.value = menuSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.kana.localeCompare(b.kana, 'ja'))

    // 予約データを取得
    const reservationsSnapshot = await getDocs(collection(db, 'reservations'))
    const reservationsMap = new Map()
    reservationsSnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.customerId && data.dateTime) {
        // 予約時間を保存（customerIdをキーとして使用）
        reservationsMap.set(data.customerId, data.dateTime)
      }
    })

    for (const saleDoc of querySnapshot.docs) {
      const data = saleDoc.data()
      if (data.customerId) {
        const customerDoc = await getDoc(doc(db, 'customers', data.customerId))
        if (customerDoc.exists()) {
          const customerData = customerDoc.data()
          const customerName =
            `${customerData.lastName || ''} ${customerData.firstName || ''}`.trim()
          if (customerName) {
            const sale = {
              id: saleDoc.id,
              ...data,
              dateTime: reservationsMap.get(data.customerId) || data.dateTime,
              customerName: customerName,
            }
            if (sale.menu || sale.staff || sale.price) {
              sales.value.push(sale)
              if (!staffs.value.includes(data.staff)) {
                staffs.value.push(data.staff)
              }
            }
          }
        }
      }
    }

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
  } catch (e) {
    console.error('Error getting documents: ', e)
  }
})
</script>
<style scoped>
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
  -webkit-overflow-scrolling: touch;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}

@media (hover: none) {
  .hover\:bg-gray-50:active {
    background-color: rgba(249, 250, 251, 1);
  }
}

.hover\:bg-opacity-90 {
  transition: all 0.2s ease-in-out;
}
</style>
