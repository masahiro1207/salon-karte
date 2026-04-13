<template>
  <div class="min-h-screen bg-off-white p-2 sm:p-8">
    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800">予約一覧（週表示）</h2>
        <button
          @click="addReservation()"
          class="w-full sm:w-auto bg-color3 hover:bg-opacity-90 text-white px-4 sm:px-6 py-2 rounded-full shadow-sm transition duration-200 ease-in-out flex items-center justify-center space-x-2"
        >
          <span class="material-icons text-xl">add</span>
          <span>新規予約</span>
        </button>
      </div>

      <div class="mt-4 sm:mt-6 flex items-center justify-center sm:justify-start space-x-4">
        <button @click="previousWeek" class="p-2 hover:bg-gray-100 rounded-full transition duration-200">
          <span class="material-icons">chevron_left</span>
        </button>
        <div class="text-base sm:text-lg font-medium text-gray-800">
          {{ formatDateRange(currentWeekStart, currentWeekEnd) }}
        </div>
        <button @click="nextWeek" class="p-2 hover:bg-gray-100 rounded-full transition duration-200">
          <span class="material-icons">chevron_right</span>
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <div class="flex items-center justify-center space-x-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-color3"></div>
        <span class="text-gray-600">予約データを読み込み中...</span>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-7 gap-3">
      <div
        v-for="date in weekDates"
        :key="format(date, 'yyyy-MM-dd')"
        class="rounded-lg shadow-sm border"
        :class="isMonday(date) ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'"
      >
        <div class="p-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div class="text-sm font-semibold text-gray-800">{{ format(date, 'M/d(E)', { locale: ja }) }}</div>
            <div v-if="isMonday(date)" class="text-xs text-gray-500">定休日</div>
          </div>
          <button
            @click="addReservation(date)"
            class="text-xs px-2 py-1 rounded bg-color3 text-white hover:bg-opacity-90"
            title="この日で予約登録"
          >
            予約追加
          </button>
        </div>

        <div class="p-2 space-y-2 min-h-[260px]">
          <template v-if="dayReservationsMap.get(format(date, 'yyyy-MM-dd'))?.length">
            <button
              v-for="reservation in dayReservationsMap.get(format(date, 'yyyy-MM-dd'))"
              :key="reservation.id"
              type="button"
              class="w-full text-left rounded-md p-2 transition border"
              :class="reservation.hasTreatmentHistory
                ? 'bg-green-50 border-green-200 hover:bg-green-100'
                : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'"
              @click="openReservationModal(reservation)"
            >
              <div class="flex items-center justify-between">
                <p class="font-medium text-sm text-gray-800 truncate">{{ reservation.customerName }}</p>
                <span
                  class="text-[10px] px-2 py-0.5 rounded-full"
                  :class="reservation.hasTreatmentHistory ? 'bg-green-200 text-green-900' : 'bg-gray-200 text-gray-700'"
                >
                  {{ reservation.hasTreatmentHistory ? '会計済み' : '未会計' }}
                </span>
              </div>
              <p class="text-xs text-gray-600 mt-1">
                {{ format(reservation.dateTime.toDate(), 'HH:mm') }} / {{ reservation.menu }}
              </p>
            </button>
          </template>
          <p v-else class="text-xs text-gray-400 p-2">予約なし</p>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="selectedReservation"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="selectedReservation = null"
      >
        <div class="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-lg mx-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg sm:text-xl font-bold text-gray-800">{{ selectedReservation.customerName }}様</h3>
            <button @click="selectedReservation = null" class="text-gray-500 hover:text-gray-700">
              <span class="material-icons">close</span>
            </button>
          </div>

          <div class="text-sm text-gray-600 mb-4">
            {{ format(selectedReservation.dateTime.toDate(), 'yyyy年M月d日(E) HH:mm', { locale: ja }) }}
            <br />
            {{ selectedReservation.menu }}
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button
              @click="editReservation(selectedReservation.id)"
              class="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm"
            >
              予約編集
            </button>
            <button
              @click="openQuickSaleModal(selectedReservation)"
              class="p-3 rounded-lg bg-green-50 hover:bg-green-100 text-sm"
            >
              ワンクリック会計
            </button>
            <button
              @click="goCustomerAccounting(selectedReservation)"
              class="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm"
            >
              顧客会計へ
            </button>
            <button
              @click="confirmDeleteReservation(selectedReservation)"
              class="p-3 rounded-lg bg-red-50 hover:bg-red-100 text-sm"
            >
              予約削除
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="quickSaleModalOpen && quickSaleReservation"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closeQuickSaleModal"
      >
        <div class="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md mx-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-800">ワンクリック会計</h3>
            <button @click="closeQuickSaleModal" class="text-gray-500 hover:text-gray-700">
              <span class="material-icons">close</span>
            </button>
          </div>

          <div class="space-y-3 text-sm">
            <p class="text-gray-700">
              {{ quickSaleReservation.customerName }} / {{ quickSaleReservation.menu }}
            </p>
            <p class="text-gray-500">
              {{ format(quickSaleReservation.dateTime.toDate(), 'yyyy/MM/dd HH:mm') }}
            </p>

            <div>
              <label class="block text-xs text-gray-600 mb-1">金額</label>
              <input v-model.number="quickSaleForm.price" type="number" class="w-full border rounded-md px-3 py-2" />
            </div>

            <div>
              <label class="block text-xs text-gray-600 mb-1">割引</label>
              <input v-model.number="quickSaleForm.discount" type="number" class="w-full border rounded-md px-3 py-2" />
            </div>

            <div>
              <label class="block text-xs text-gray-600 mb-1">支払い方法</label>
              <select v-model="quickSaleForm.paymentMethod" class="w-full border rounded-md px-3 py-2">
                <option value="現金">現金</option>
                <option value="クレジットカード">クレジットカード</option>
              </select>
            </div>

            <div>
              <label class="block text-xs text-gray-600 mb-1">備考</label>
              <textarea v-model="quickSaleForm.notes" class="w-full border rounded-md px-3 py-2" rows="3" />
            </div>
          </div>

          <div class="mt-4 flex justify-end gap-2">
            <button @click="closeQuickSaleModal" class="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm">
              キャンセル
            </button>
            <button @click="submitQuickSale" class="px-3 py-2 rounded-md bg-color3 text-white hover:bg-opacity-90 text-sm">
              会計登録
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../firebase'
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore'
import { useRouter, useRoute } from 'vue-router'
import { format, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns'
import { ja } from 'date-fns/locale'
import customerService from '../services/customerService'

const router = useRouter()
const route = useRoute()

const reservations = ref([])
const selectedReservation = ref(null)
const currentWeekStart = ref(new Date())
const isLoading = ref(false)

const quickSaleModalOpen = ref(false)
const quickSaleReservation = ref(null)
const quickSaleForm = ref({
  price: 0,
  discount: 0,
  paymentMethod: '現金',
  notes: '',
})

const weekDates = computed(() => {
  const start = currentWeekStart.value
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return eachDayOfInterval({ start, end })
})

const currentWeekEnd = computed(() => {
  const end = new Date(currentWeekStart.value)
  end.setDate(end.getDate() + 6)
  return end
})

const isMonday = (date) => date.getDay() === 1

const formatDateRange = (start, end) => {
  return `${format(start, 'yyyy年M月d日', { locale: ja })} - ${format(end, 'M月d日', { locale: ja })}`
}

const dayReservationsMap = computed(() => {
  const map = new Map()
  weekDates.value.forEach((date) => {
    map.set(format(date, 'yyyy-MM-dd'), [])
  })

  reservations.value.forEach((reservation) => {
    if (!reservation.dateTime?.toDate) return
    const key = format(reservation.dateTime.toDate(), 'yyyy-MM-dd')
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(reservation)
  })

  map.forEach((list) => {
    list.sort((a, b) => a.dateTime.toDate() - b.dateTime.toDate())
  })

  return map
})

const fetchReservations = async () => {
  isLoading.value = true
  try {
    const startDate = new Date(currentWeekStart.value)
    startDate.setHours(0, 0, 0, 0)
    const start = Timestamp.fromDate(startDate)

    const endDate = new Date(currentWeekEnd.value)
    endDate.setHours(23, 59, 59, 999)
    const end = Timestamp.fromDate(endDate)

    const reservationQuery = query(
      collection(db, 'reservations'),
      where('dateTime', '>=', start),
      where('dateTime', '<=', end),
    )
    const reservationSnapshot = await getDocs(reservationQuery)
    const reservationDocs = reservationSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))

    const customerIds = [...new Set(reservationDocs.map((r) => r.customerId).filter(Boolean))]
    const menuNames = [...new Set(reservationDocs.map((r) => r.menu).filter(Boolean))]

    const customerMap = new Map()
    for (const customerId of customerIds) {
      const snap = await getDoc(doc(db, 'customers', customerId))
      if (snap.exists()) {
        const data = snap.data()
        customerMap.set(customerId, `${data.lastName || ''} ${data.firstName || ''}`.trim())
      }
    }

    const menuMap = new Map()
    if (menuNames.length > 0) {
      for (let i = 0; i < menuNames.length; i += 30) {
        const chunk = menuNames.slice(i, i + 30)
        const ms = await getDocs(query(collection(db, 'menus'), where('name', 'in', chunk)))
        ms.forEach((d) => {
          const data = d.data()
          menuMap.set(data.name, data)
        })
      }
    }

    const salesByReservationId = new Set()
    const salesByCustomerDate = new Set()
    // 週内の売上のみ取得（customerId + 日付の複合インデックス不要）。件数は週単位で限定的。
    const salesQuery = query(
      collection(db, 'sales'),
      where('dateTime', '>=', start),
      where('dateTime', '<=', end),
    )
    const salesSnap = await getDocs(salesQuery)
    salesSnap.forEach((d) => {
      const sale = d.data()
      if (sale.reservationId) salesByReservationId.add(sale.reservationId)
      if (sale.customerId && sale.dateTime?.toDate) {
        salesByCustomerDate.add(`${sale.customerId}_${format(sale.dateTime.toDate(), 'yyyy-MM-dd')}`)
      }
    })

    reservations.value = reservationDocs.map((reservation) => {
      const reservationDateKey = reservation.dateTime?.toDate
        ? `${reservation.customerId}_${format(reservation.dateTime.toDate(), 'yyyy-MM-dd')}`
        : ''
      const hasSale = salesByReservationId.has(reservation.id) || salesByCustomerDate.has(reservationDateKey)

      return {
        ...reservation,
        customerName: customerMap.get(reservation.customerId) || reservation.customerName || '不明',
        menuPrice: menuMap.get(reservation.menu)?.price || 0,
        duration: menuMap.get(reservation.menu)?.duration || 30,
        hasTreatmentHistory: !!(reservation.hasTreatmentHistory || hasSale),
      }
    })
  } catch (e) {
    console.error('Error fetching reservations:', e)
  } finally {
    isLoading.value = false
  }
}

const previousWeek = async () => {
  currentWeekStart.value = subWeeks(currentWeekStart.value, 1)
  await fetchReservations()
}

const nextWeek = async () => {
  currentWeekStart.value = addWeeks(currentWeekStart.value, 1)
  await fetchReservations()
}

const addReservation = (date = null) => {
  const base = date ? new Date(date) : new Date(currentWeekStart.value)
  base.setHours(9, 0, 0, 0)
  router.push({
    path: '/addreservation',
    query: { dateTime: encodeURIComponent(base.toISOString()) },
  })
}

const openReservationModal = (reservation) => {
  selectedReservation.value = reservation
}

const editReservation = (id) => {
  router.push(`/editreservation/${id}`)
  selectedReservation.value = null
}

const goCustomerAccounting = (reservation) => {
  const weekStartISO = format(currentWeekStart.value, 'yyyy-MM-dd')
  router.push({ path: `/history/${reservation.customerId}`, query: { weekStart: weekStartISO } })
  selectedReservation.value = null
}

const confirmDeleteReservation = async (reservation) => {
  if (!confirm('この予約を削除してもよろしいですか？')) return
  try {
    await deleteDoc(doc(db, 'reservations', reservation.id))
    selectedReservation.value = null
    await fetchReservations()
  } catch (error) {
    console.error('予約削除エラー:', error)
    alert('予約の削除中にエラーが発生しました。')
  }
}

const openQuickSaleModal = (reservation) => {
  quickSaleReservation.value = reservation
  quickSaleForm.value = {
    price: Number(reservation.menuPrice) || 0,
    discount: 0,
    paymentMethod: '現金',
    notes: '',
  }
  quickSaleModalOpen.value = true
  selectedReservation.value = null
}

const closeQuickSaleModal = () => {
  quickSaleModalOpen.value = false
  quickSaleReservation.value = null
}

const submitQuickSale = async () => {
  if (!quickSaleReservation.value) return

  try {
    const reservation = quickSaleReservation.value
    const existingSaleQuery = query(collection(db, 'sales'), where('reservationId', '==', reservation.id))
    const existingSaleSnapshot = await getDocs(existingSaleQuery)
    if (!existingSaleSnapshot.empty) {
      alert('この予約はすでに会計済みです。')
      closeQuickSaleModal()
      await fetchReservations()
      return
    }

    const salePayload = {
      customerId: reservation.customerId,
      customerName: reservation.customerName,
      reservationId: reservation.id,
      dateTime: reservation.dateTime,
      menu: reservation.menu || '',
      staff: reservation.staff || '',
      price: Number(quickSaleForm.value.price) || 0,
      discount: Number(quickSaleForm.value.discount) || 0,
      paymentMethod: quickSaleForm.value.paymentMethod,
      products: [],
      notes: quickSaleForm.value.notes || '',
    }

    await customerService.createSale(salePayload)
    await updateDoc(doc(db, 'reservations', reservation.id), { hasTreatmentHistory: true })

    closeQuickSaleModal()
    await fetchReservations()
  } catch (e) {
    console.error('ワンクリック会計エラー:', e)
    alert('会計登録に失敗しました。')
  }
}

onMounted(async () => {
  const weekStartParam = route.query.weekStart
  if (weekStartParam) {
    currentWeekStart.value = new Date(decodeURIComponent(weekStartParam))
  } else {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    currentWeekStart.value = today
  }

  await fetchReservations()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style>
