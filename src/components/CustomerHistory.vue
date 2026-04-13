<template>
  <div class="min-h-screen bg-off-white p-4 sm:p-8">
    <!-- ヘッダーセクション -->
    <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6 max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800">{{ customerName }}様の会計・顧客</h2>
          <p class="text-sm text-gray-600 mt-1">{{ customerKana }}</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <button
            @click="goToSalesList"
            class="w-full sm:w-auto bg-color1 hover:bg-opacity-90 text-white px-4 sm:px-6 py-2 rounded-full shadow-sm transition duration-200 ease-in-out flex items-center justify-center space-x-2"
          >
            <span class="material-icons text-xl">receipt_long</span>
            <span>売上一覧</span>
          </button>
          <button
            @click="addSale"
            class="w-full sm:w-auto bg-color3 hover:bg-opacity-90 text-white px-4 sm:px-6 py-2 rounded-full shadow-sm transition duration-200 ease-in-out flex items-center justify-center space-x-2"
          >
            <span class="material-icons text-xl">add</span>
            <span>売上を追加</span>
          </button>
        </div>
      </div>

      <p
        class="mt-4 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
      >
        手書きカルテ・施術メモは Goodnotes で管理します。ここでは会計（売上）のみを扱います。
      </p>

      <!-- フィルター -->
      <div class="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">期間</label>
          <div class="flex space-x-2">
            <input
              type="date"
              v-model="startDate"
              class="flex-1 border border-gray-300 rounded-md px-3 py-2"
            />
            <input
              type="date"
              v-model="endDate"
              class="flex-1 border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">メニュー</label>
          <select v-model="selectedMenu" class="w-full border border-gray-300 rounded-md px-3 py-2">
            <option value="">すべて</option>
            <option v-for="menu in menus" :key="menu.id" :value="menu.name">
              {{ menu.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 顧客基本情報 -->
    <div class="mb-8 bg-white rounded-lg shadow-sm p-6 max-w-7xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">{{ customerName }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-gray-600">電話番号</p>
          <p class="text-lg">{{ customerPhone }}</p>
        </div>
        <div>
          <p class="text-gray-600">最終記録日（売上）</p>
          <p class="text-lg">{{ lastVisitDate }}</p>
        </div>
        <div>
          <p class="text-gray-600">売上登録件数</p>
          <p class="text-lg">{{ totalVisits }}件</p>
        </div>
        <div>
          <p class="text-gray-600">売上累計（割引後・全期間）</p>
          <p class="text-lg">¥{{ totalAmount?.toLocaleString() }}</p>
        </div>
      </div>
    </div>

    <!-- 集計情報（フィルター後・売上のみ） -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 max-w-7xl mx-auto">
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="text-sm text-gray-600">売上件数（表示中）</div>
        <div class="text-2xl font-bold text-gray-800">{{ filteredSales.length }}件</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="text-sm text-gray-600">総売上（表示中）</div>
        <div class="text-2xl font-bold text-gray-800">¥{{ totalSalesFiltered.toLocaleString() }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="text-sm text-gray-600">現金（表示中）</div>
        <div class="text-2xl font-bold text-gray-800">¥{{ cashTotalFiltered.toLocaleString() }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="text-sm text-gray-600">クレジット（表示中）</div>
        <div class="text-2xl font-bold text-gray-800">¥{{ creditCardTotalFiltered.toLocaleString() }}</div>
      </div>
    </div>

    <!-- 会計（売上）一覧 -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-2 max-w-7xl mx-auto">会計（売上）</h3>
      <div class="bg-white rounded-lg shadow-sm overflow-hidden max-w-7xl mx-auto">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse min-w-[1000px]">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-600">日時</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-600">メニュー</th>
                <th class="px-6 py-4 text-right text-sm font-medium text-gray-600">金額（割引後）</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-600">支払方法</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-600">備考</th>
                <th class="px-6 py-4 text-center text-sm font-medium text-gray-600">GNカルテ</th>
                <th class="px-6 py-4 text-center text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="sale in displayedSales" :key="sale.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">{{ formatDateTime(sale.dateTime) }}</td>
                <td class="px-6 py-4">{{ sale.menu }}</td>
                <td class="px-6 py-4 text-right">¥{{ netPrice(sale).toLocaleString() }}</td>
                <td class="px-6 py-4">{{ sale.paymentMethod }}</td>
                <td class="px-6 py-4">{{ sale.notes }}</td>
                <td class="px-6 py-4 text-center">
                  <a
                    v-if="goodnotesUrl(sale.dateTime)"
                    :href="goodnotesUrl(sale.dateTime)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-emerald-700"
                  >
                    開く
                  </a>
                  <span
                    v-else
                    class="inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-400 text-xs font-medium px-3 py-1.5 cursor-not-allowed select-none"
                    title="この来店年月のGoodnotesリンクは未設定です"
                  >
                    GN
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-center space-x-2">
                    <button
                      @click="editSale(sale.id)"
                      class="text-color3 hover:text-opacity-80"
                      type="button"
                    >
                      <span class="material-icons">edit</span>
                    </button>
                    <button
                      @click="deleteSale(sale.id)"
                      class="text-red-500 hover:text-opacity-80"
                      type="button"
                    >
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredSales.length > 3" class="px-6 py-4 bg-gray-50 border-t">
          <button
            type="button"
            @click="toggleShowAllSales"
            class="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span
              class="material-icons transform transition-transform"
              :class="{ 'rotate-180': showAllSales }"
            >
              expand_more
            </span>
            <span>
              {{ showAllSales ? '折り畳む' : `さらに${filteredSales.length - 3}件を表示` }}
            </span>
          </button>
        </div>
        <p v-if="filteredSales.length === 0" class="px-6 py-8 text-center text-gray-500 text-sm">
          該当する売上がありません。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../firebase'
import {
  collection,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  query,
  where,
  updateDoc,
} from 'firebase/firestore'
import { useRouter, useRoute } from 'vue-router'
import { Timestamp } from 'firebase/firestore'
import { getGoodnotesUrlForDateTime } from '../config/goodnotesMonthLinks'

const router = useRouter()
const route = useRoute()
const customerId = route.params.id

const customerName = ref('')
const customerKana = ref('')
const customerPhone = ref('')
const lastVisitDate = ref('')
const totalVisits = ref(0)
const totalAmount = ref(0)
const sales = ref([])
const menus = ref([])
const startDate = ref('')
const endDate = ref('')
const selectedMenu = ref('')
const showAllSales = ref(false)

const toDate = (dateTime) => {
  if (!dateTime) return null
  if (dateTime instanceof Timestamp) return dateTime.toDate()
  if (typeof dateTime === 'object' && 'seconds' in dateTime) {
    return new Date(dateTime.seconds * 1000)
  }
  return new Date(dateTime)
}

const netPrice = (sale) => {
  const p = Number(sale.price) || 0
  const d = Number(sale.discount) || 0
  return p - d
}

const filteredSales = computed(() => {
  let filtered = sales.value

  if (startDate.value) {
    filtered = filtered.filter((sale) => {
      const saleDate = toDate(sale.dateTime)
      return saleDate && saleDate >= new Date(startDate.value)
    })
  }

  if (endDate.value) {
    const end = new Date(endDate.value)
    end.setHours(23, 59, 59, 999)
    filtered = filtered.filter((sale) => {
      const saleDate = toDate(sale.dateTime)
      return saleDate && saleDate <= end
    })
  }

  if (selectedMenu.value) {
    filtered = filtered.filter((sale) => sale.menu === selectedMenu.value)
  }

  return filtered.sort((a, b) => {
    const da = toDate(a.dateTime)
    const db = toDate(b.dateTime)
    return (db?.getTime() || 0) - (da?.getTime() || 0)
  })
})

const displayedSales = computed(() => {
  if (showAllSales.value) return filteredSales.value
  return filteredSales.value.slice(0, 3)
})

const toggleShowAllSales = () => {
  showAllSales.value = !showAllSales.value
}

const totalSalesFiltered = computed(() =>
  filteredSales.value.reduce((sum, sale) => sum + netPrice(sale), 0),
)

const cashTotalFiltered = computed(() =>
  filteredSales.value.reduce((sum, sale) => {
    if (sale.paymentMethod === '現金') return sum + netPrice(sale)
    return sum
  }, 0),
)

const creditCardTotalFiltered = computed(() =>
  filteredSales.value.reduce((sum, sale) => {
    if (sale.paymentMethod === 'クレジットカード') return sum + netPrice(sale)
    return sum
  }, 0),
)

const goodnotesUrl = (dateTime) => getGoodnotesUrlForDateTime(dateTime)

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''

  let date
  try {
    date = toDate(dateTime)
    if (!date || Number.isNaN(date.getTime())) return ''
  } catch (e) {
    console.error('Error formatting date:', e)
    return ''
  }

  return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
    .getDate()
    .toString()
    .padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`
}

const recalcHeaderAfterFetch = () => {
  let maxMs = 0
  let hasAny = false

  const consider = (dt) => {
    const d = toDate(dt)
    if (!d || Number.isNaN(d.getTime())) return
    hasAny = true
    const ms = d.getTime()
    if (ms > maxMs) maxMs = ms
  }

  sales.value.forEach((s) => consider(s.dateTime))

  if (!hasAny) {
    lastVisitDate.value = 'なし'
  } else {
    lastVisitDate.value = formatDateTime(Timestamp.fromDate(new Date(maxMs)))
  }

  totalVisits.value = sales.value.length
  totalAmount.value = sales.value.reduce((sum, s) => sum + netPrice(s), 0)
}

const syncCustomerLastVisit = async () => {
  const tsList = []
  for (const s of sales.value) {
    if (s.dateTime) {
      const t = s.dateTime instanceof Timestamp ? s.dateTime : Timestamp.fromDate(toDate(s.dateTime))
      tsList.push(t)
    }
  }

  const customerRef = doc(db, 'customers', customerId)
  if (tsList.length === 0) {
    await updateDoc(customerRef, { lastVisit: null })
    lastVisitDate.value = 'なし'
    return
  }

  const maxTs = tsList.reduce((best, cur) => (cur.toMillis() > best.toMillis() ? cur : best))
  await updateDoc(customerRef, { lastVisit: maxTs })
  lastVisitDate.value = formatDateTime(maxTs)
}

const addSale = () => {
  const weekStart = route.query.weekStart
  router.push({
    path: '/saleform',
    query: {
      customerId,
      ...(weekStart ? { weekStart } : {}),
    },
  })
}

const editSale = (id) => {
  router.push(`/editsale/${id}`)
}

const deleteSale = async (id) => {
  if (!confirm('この売上を削除してもよろしいですか？')) return
  try {
    await deleteDoc(doc(db, 'sales', id))
    sales.value = sales.value.filter((s) => s.id !== id)
    recalcHeaderAfterFetch()
    await syncCustomerLastVisit()
  } catch (e) {
    console.error('Error deleting sale: ', e)
    alert('売上の削除に失敗しました。')
  }
}

const goToSalesList = () => {
  router.push({
    path: '/sales',
    query: {
      customerId: customerId,
      customerName: customerName.value,
      startDate: startDate.value,
      endDate: endDate.value,
      selectedMenu: selectedMenu.value,
    },
  })
}

const fetchCustomerInfo = async () => {
  try {
    const customerRef = doc(db, 'customers', customerId)
    const customerSnap = await getDoc(customerRef)
    if (customerSnap.exists()) {
      const customerData = customerSnap.data()
      customerName.value = `${customerData.lastName || ''} ${customerData.firstName || ''}`.trim()
      customerKana.value =
        `${customerData.lastNameKana || ''} ${customerData.firstNameKana || ''}`.trim()
      customerPhone.value = customerData.phone
    }
  } catch (e) {
    console.error('Error getting customer info: ', e)
  }
}

onMounted(async () => {
  try {
    await fetchCustomerInfo()

    const menuSnapshot = await getDocs(collection(db, 'menus'))
    menus.value = menuSnapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => a.kana.localeCompare(b.kana, 'ja'))

    const salesQuery = query(
      collection(db, 'sales'),
      where('customerId', '==', customerId),
    )
    const salesSnapshot = await getDocs(salesQuery)
    sales.value = salesSnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))

    recalcHeaderAfterFetch()
  } catch (e) {
    console.error('Error getting documents: ', e)
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
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

.min-w-\[1000px\] {
  min-width: 1000px;
}
</style>
