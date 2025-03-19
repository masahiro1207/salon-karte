<template>
  <div class="min-h-screen bg-off-white p-2 sm:p-8">
    <!-- ヘッダーセクション -->
    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800">予約一覧</h2>
        <button
          @click="addReservation"
          class="w-full sm:w-auto bg-color3 hover:bg-opacity-90 text-white px-4 sm:px-6 py-2 rounded-full shadow-sm transition duration-200 ease-in-out flex items-center justify-center space-x-2"
        >
          <span class="material-icons text-xl">add</span>
          <span>新規予約</span>
        </button>
      </div>

      <!-- 日付選択 -->
      <div class="mt-4 sm:mt-6 flex items-center justify-center sm:justify-start space-x-4">
        <button
          @click="previousWeek"
          class="p-2 hover:bg-gray-100 rounded-full transition duration-200"
        >
          <span class="material-icons">chevron_left</span>
        </button>
        <div class="text-base sm:text-lg font-medium text-gray-800">
          {{ formatDateRange(currentWeekStart, currentWeekEnd) }}
        </div>
        <button
          @click="nextWeek"
          class="p-2 hover:bg-gray-100 rounded-full transition duration-200"
        >
          <span class="material-icons">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- タイムテーブル（モバイル表示） -->
    <div class="block sm:hidden bg-white rounded-lg shadow-sm">
      <div v-for="date in weekDates" :key="date" class="border-b last:border-b-0">
        <div class="p-4 bg-gray-50">
          <div class="font-medium text-gray-800">{{ formatDate(date) }}</div>
          <div class="text-sm text-gray-500">{{ formatDayOfWeek(date) }}</div>
        </div>
        <div class="p-4 space-y-2">
          <template v-for="time in timeSlots" :key="time">
            <template v-if="getReservation(date, time)">
              <div
                v-for="reservation in getReservation(date, time)"
                :key="reservation.id"
                class="p-3 rounded-lg mb-2"
                :class="[
                  reservation.hasTreatmentHistory ? 'bg-green-100' : 'bg-color3 bg-opacity-10',
                ]"
                @click="openReservationModal(reservation)"
              >
                <div class="flex items-center gap-2">
                  <span
                    v-if="reservation.hasTreatmentHistory"
                    class="material-icons text-green-600"
                    style="font-size: 16px"
                  >
                    check_circle
                  </span>
                  <div>
                    <div class="font-medium text-color3">
                      {{ formatTime(time) }} {{ reservation.customerName }}
                    </div>
                    <div class="text-sm text-gray-600">
                      {{ reservation.menu }}
                      ({{ reservation.duration }}分)
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>

    <!-- タイムテーブル（デスクトップ表示） -->
    <div class="hidden sm:block bg-white rounded-lg shadow-sm overflow-x-auto">
      <table class="w-full border-collapse min-w-[200px]">
        <!-- 時間ヘッダー -->
        <thead>
          <tr class="bg-gray-50">
            <th class="border-b border-gray-200 p-4 text-left w-32">日付</th>
            <th
              v-for="time in timeSlots"
              :key="time"
              class="border-b border-gray-200 p-2 min-w-[30px] text-center"
            >
              <div class="text-xs font-medium text-gray-600">
                {{ formatTime(time) }}
              </div>
            </th>
          </tr>
        </thead>
        <!-- 予約スロット -->
        <tbody>
          <tr v-for="date in weekDates" :key="date">
            <td class="border-b border-gray-200 p-4">
              <div class="text-sm font-medium text-gray-600">
                {{ formatDate(date) }}
              </div>
              <div class="text-xs text-gray-500">
                {{ formatDayOfWeek(date) }}
              </div>
            </td>
            <td
              v-for="time in timeSlots"
              :key="time"
              class="border-b border-gray-200 p-2 relative group"
              @click="handleTimeSlotClick(date, time)"
              :style="{
                minWidth: '30px',
                height: calculateCellHeight(date),
                minHeight: calculateCellHeight(date),
                padding: '0.15rem !important',
              }"
            >
              <template v-if="getReservation(date, time)">
                <div
                  v-for="reservation in getReservation(date, time)"
                  :key="reservation.id"
                  class="absolute rounded-sm p-2 transition duration-200 cursor-pointer"
                  :class="[
                    reservation.hasTreatmentHistory
                      ? 'bg-green-100 hover:bg-green-200'
                      : 'bg-color3 bg-opacity-20 hover:bg-opacity-30',
                  ]"
                  :style="{
                    position: 'absolute',
                    left: '0',
                    width: `${calculateReservationSpan(reservation) * 100}%`,
                    ...calculateReservationPosition(reservation),
                    height: '3.5rem',
                    borderLeft: `3px solid ${reservation.hasTreatmentHistory ? '#10B981' : '#6366F1'}`,
                    zIndex: 1,
                  }"
                  @click="openReservationModal(reservation)"
                >
                  <div class="flex items-center space-x-1 h-full">
                    <span
                      v-if="reservation.hasTreatmentHistory"
                      class="material-icons text-green-600 flex-shrink-0"
                      style="font-size: 16px"
                    >
                      check_circle
                    </span>
                    <div class="flex-1 min-w-0">
                      <div class="font-medium text-color3 truncate text-lg">
                        {{ reservation.customerName }}
                      </div>
                      <div class="text-md text-gray-600 truncate">
                        {{ reservation.menu }}
                        <span class="text-gray-500"> ({{ reservation.duration }}分) </span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 予約詳細モーダル -->
    <Teleport to="body">
      <div
        v-if="selectedReservation"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="selectedReservation = null"
      >
        <div class="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-lg mx-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg sm:text-xl font-bold text-gray-800">
              {{ selectedReservation.customerName }}様の予約
            </h3>
            <button @click="selectedReservation = null" class="text-gray-500 hover:text-gray-700">
              <span class="material-icons">close</span>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <button
              @click="editReservation(selectedReservation.id)"
              class="flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
            >
              <span class="material-icons text-2xl sm:text-3xl text-color3 mb-2"
                >edit_calendar</span
              >
              <span class="text-sm sm:text-base text-gray-700">予約編集</span>
            </button>

            <button
              @click="addTreatmentHistory(selectedReservation)"
              class="flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
            >
              <span class="material-icons text-2xl sm:text-3xl text-color3 mb-2"
                >content_paste</span
              >
              <span class="text-sm sm:text-base text-gray-700">施術履歴</span>
            </button>

            <button
              @click="addSales(selectedReservation)"
              class="flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
            >
              <span class="material-icons text-2xl sm:text-3xl text-color3 mb-2"
                >point_of_sale</span
              >
              <span class="text-sm sm:text-base text-gray-700">売上登録</span>
            </button>

            <button
              @click="confirmDeleteReservation(selectedReservation)"
              class="flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
            >
              <span class="material-icons text-2xl sm:text-3xl text-red-500 mb-2">delete</span>
              <span class="text-sm sm:text-base text-gray-700">予約削除</span>
            </button>
          </div>

          <div class="mt-4 sm:mt-6 text-center text-sm text-gray-500">
            {{
              format(selectedReservation.dateTime.toDate(), 'yyyy年M月d日(E) HH:mm', { locale: ja })
            }}
            - {{ formatEndTime(selectedReservation) }}
            <br />
            {{ selectedReservation.menu }} (担当: {{ selectedReservation.staff }})
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
} from 'firebase/firestore'
import { useRouter, useRoute } from 'vue-router'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns'
import { ja } from 'date-fns/locale'

const router = useRouter()
const route = useRoute()
const reservations = ref([])
const selectedReservation = ref(null)
const currentWeekStart = ref(startOfWeek(new Date(), { weekStartsOn: 1 }))

const selectedDateTime = ref(new Date())

// 時間スロットの生成（9:00 から 20:00 まで30分間隔）
const timeSlots = computed(() => {
  const slots = []
  for (let hour = 9; hour <= 20; hour++) {
    slots.push(`${hour}:00`)
    if (hour < 20) {
      slots.push(`${hour}:30`)
    }
  }
  return slots
})

// 現在の週の日付を生成
const weekDates = computed(() => {
  return eachDayOfInterval({
    start: currentWeekStart.value,
    end: endOfWeek(currentWeekStart.value, { weekStartsOn: 1 }),
  })
})

const currentWeekEnd = computed(() => {
  return endOfWeek(currentWeekStart.value, { weekStartsOn: 1 })
})

// 日付のフォーマット
const formatDate = (date) => {
  return format(date, 'M/d', { locale: ja })
}

// 曜日のフォーマット
const formatDayOfWeek = (date) => {
  return format(date, 'EEEE', { locale: ja })
}

// 日付範囲のフォーマット
const formatDateRange = (start, end) => {
  return `${format(start, 'yyyy年M月d日', { locale: ja })} - ${format(end, 'M月d日', { locale: ja })}`
}

// 時間のフォーマット
const formatTime = (time) => {
  return time
}

// 週の移動
const previousWeek = () => {
  currentWeekStart.value = subWeeks(currentWeekStart.value, 1)
  fetchReservations()
}

const nextWeek = () => {
  currentWeekStart.value = addWeeks(currentWeekStart.value, 1)
  fetchReservations()
}

// 予約データの取得
const fetchReservations = async () => {
  try {
    const startDate = new Date(currentWeekStart.value)
    startDate.setHours(0, 0, 0, 0)
    const start = Timestamp.fromDate(startDate)

    const endDate = new Date(currentWeekEnd.value)
    endDate.setHours(23, 59, 59, 999)
    const end = Timestamp.fromDate(endDate)

    console.log('Fetching reservations between:', startDate, 'and', endDate)

    // 予約データの取得
    const q = query(
      collection(db, 'reservations'),
      where('dateTime', '>=', start),
      where('dateTime', '<=', end),
    )
    const querySnapshot = await getDocs(q)
    console.log('Found reservations:', querySnapshot.size)

    // 必要なcustomerIdとmenuを収集
    const customerIds = new Set()
    const menuNames = new Set()
    const reservationDocs = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      console.log('Reservation data:', data) // 予約データの詳細をログ出力
      if (data.customerId) customerIds.add(data.customerId)
      if (data.menu) menuNames.add(data.menu)
      reservationDocs.push({ id: doc.id, ...data })
    })

    // 顧客データを一括取得
    const customerData = new Map()
    if (customerIds.size > 0) {
      const customerPromises = Array.from(customerIds).map(async (customerId) => {
        const customerDoc = await getDoc(doc(db, 'customers', customerId))
        if (customerDoc.exists()) {
          return [customerId, customerDoc.data()]
        }
        return [customerId, { name: '不明' }]
      })
      const customers = await Promise.all(customerPromises)
      customers.forEach(([id, data]) => customerData.set(id, data))
    }

    // メニューデータを一括取得
    const menuData = new Map()
    if (menuNames.size > 0) {
      const menusRef = collection(db, 'menus')
      const menuQuery = query(menusRef, where('name', 'in', Array.from(menuNames)))
      const menuSnapshot = await getDocs(menuQuery)
      menuSnapshot.forEach((doc) => {
        const data = doc.data()
        menuData.set(data.name, data)
      })
    }

    // 予約データを取得した後、各予約の施術履歴を確認
    const reservationData = await Promise.all(
      reservationDocs.map(async (data) => {
        const customerName = data.customerId
          ? customerData.get(data.customerId)?.name || '不明'
          : '不明'

        const menuDuration = data.menu ? menuData.get(data.menu)?.duration || 30 : 30

        // その予約の日付の施術履歴を確認
        const startOfDay = new Date(data.dateTime.toDate())
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(data.dateTime.toDate())
        endOfDay.setHours(23, 59, 59, 999)

        const historyQuery = query(
          collection(db, 'histories'),
          where('customerId', '==', data.customerId),
          where('dateTime', '>=', Timestamp.fromDate(startOfDay)),
          where('dateTime', '<=', Timestamp.fromDate(endOfDay)),
        )

        const historySnapshot = await getDocs(historyQuery)
        const hasTreatmentHistory = !historySnapshot.empty

        return {
          id: data.id,
          ...data,
          customerName,
          duration: menuDuration,
          hasTreatmentHistory,
        }
      }),
    )

    console.log('Processed reservations:', reservationData)
    reservations.value = reservationData
  } catch (e) {
    console.error('Error fetching reservations:', e)
  }
}

// 日時ごとの予約をメモ化
const reservationMap = computed(() => {
  const map = new Map()

  reservations.value.forEach((reservation) => {
    if (!reservation.dateTime) return

    const startTime = reservation.dateTime.toDate()
    // 日付をローカルタイムゾーンで取得
    const dateKey = format(startTime, 'yyyy-MM-dd')
    const timeKey = format(startTime, 'HH:mm')

    console.log('Mapping reservation:', {
      dateKey,
      timeKey,
      customerName: reservation.customerName,
      menu: reservation.menu,
    })

    if (!map.has(dateKey)) {
      map.set(dateKey, new Map())
    }
    if (!map.get(dateKey).has(timeKey)) {
      map.get(dateKey).set(timeKey, [])
    }
    map.get(dateKey).get(timeKey).push(reservation)
  })

  return map
})

// 指定の日時の予約を取得（キャッシュを利用）
const getReservation = (date, time) => {
  const dateKey = format(date, 'yyyy-MM-dd')
  const timeKey = time
  const [hours, minutes] = timeKey.split(':').map(Number)
  const targetTime = new Date(date)
  targetTime.setHours(hours, minutes, 0, 0)

  // その時間枠に開始する予約のみを返す
  const reservations = reservationMap.value.get(dateKey)?.get(timeKey) || []
  return reservations.filter((reservation) => {
    const startTime = reservation.dateTime.toDate()
    return format(startTime, 'HH:mm') === timeKey
  })
}

// 予約の重なりを検出してレーン数を計算
const calculateLanes = computed(() => {
  const lanesByDate = new Map()

  // 日付ごとの予約をグループ化
  const reservationsByDate = new Map()
  reservations.value.forEach((reservation) => {
    if (!reservation.dateTime) return
    const dateKey = format(reservation.dateTime.toDate(), 'yyyy-MM-dd')
    if (!reservationsByDate.has(dateKey)) {
      reservationsByDate.set(dateKey, [])
    }
    reservationsByDate.get(dateKey).push(reservation)
  })

  // 日付ごとに予約の重なりを計算
  reservationsByDate.forEach((dateReservations, dateKey) => {
    // 予約を開始時間でソート
    dateReservations.sort((a, b) => {
      return a.dateTime.toDate() - b.dateTime.toDate()
    })

    // 各予約にレーン番号を割り当て
    const laneEndTimes = [] // 各レーンの終了時間を保持

    dateReservations.forEach((reservation) => {
      const startTime = reservation.dateTime.toDate()
      const duration = reservation.duration || 30
      const endTime = new Date(startTime.getTime() + duration * 60000)

      // 利用可能なレーンを探す（最も早く終了するレーンを優先）
      let laneIndex = -1
      let earliestEndTime = Infinity

      for (let i = 0; i < laneEndTimes.length; i++) {
        if (startTime >= laneEndTimes[i] && laneEndTimes[i] < earliestEndTime) {
          laneIndex = i
          earliestEndTime = laneEndTimes[i]
        }
      }

      // 利用可能なレーンが見つからない場合は新しいレーンを作成
      if (laneIndex === -1) {
        laneIndex = laneEndTimes.length
        laneEndTimes.push(endTime)
      } else {
        laneEndTimes[laneIndex] = endTime
      }

      // 予約にレーン番号を保存
      reservation.laneIndex = laneIndex
    })

    lanesByDate.set(dateKey, laneEndTimes.length || 1)
  })

  return lanesByDate
})

// 予約の時間枠を計算
const calculateReservationSpan = (reservation) => {
  if (!reservation || !reservation.dateTime) return 1
  const duration = reservation.duration || 30
  return Math.ceil(duration / 30)
}

// 予約の位置を計算
const calculateReservationPosition = (reservation) => {
  if (!reservation || !reservation.dateTime) return { top: 0 }
  const laneIndex = reservation.laneIndex || 0
  return {
    top: `${laneIndex * 4}rem`,
  }
}

// セルの高さを計算
const calculateCellHeight = (date) => {
  const dateKey = format(date, 'yyyy-MM-dd')
  const lanes = calculateLanes.value.get(dateKey) || 1
  return `${Math.max(lanes * 4, 4)}rem`
}

// 予約の終了時間をフォーマット
const formatEndTime = (reservation) => {
  if (!reservation || !reservation.dateTime) return ''

  const startTime = reservation.dateTime.toDate()
  const duration = reservation.duration || 30
  const endTime = new Date(startTime.getTime() + duration * 60000)

  return `${endTime.getHours()}:${endTime.getMinutes().toString().padStart(2, '0')}`
}

// 新規予約（時間未指定）
const addReservation = () => {
  // 選択中の週の月曜日の9:00を初期値として設定
  const defaultDateTime = new Date(currentWeekStart.value)
  defaultDateTime.setHours(9, 0, 0, 0)
  const encodedDateTime = encodeURIComponent(defaultDateTime.toISOString())
  router.push({
    path: '/addreservation',
    query: {
      dateTime: encodedDateTime,
    },
  })
}

// 時間枠クリック時の処理
const handleTimeSlotClick = (date, time) => {
  // 予約がない場合のみ新規予約を追加
  if (!getReservation(date, time)?.length) {
    const [hours, minutes] = time.split(':').map(Number)
    const datetime = new Date(date)
    datetime.setHours(hours, minutes, 0, 0)

    console.log('クリックされた日時:', datetime)

    // ローカルタイムゾーンを考慮した日時を設定
    const localDateTime = new Date(datetime.getTime() + datetime.getTimezoneOffset() * 60000)
    console.log('送信する日時:', localDateTime.toISOString())

    router.push({
      path: '/addreservation',
      query: {
        dateTime: encodeURIComponent(localDateTime.toISOString()),
      },
    })
  }
}

// 予約編集
const editReservation = (id) => {
  router.push(`/editreservation/${id}`)
}

// 予約モーダルを開く
const openReservationModal = (reservation) => {
  if (!reservation) {
    console.error('No reservation provided to openReservationModal')
    return
  }
  console.log('Opening modal for reservation:', {
    id: reservation.id,
    customerName: reservation.customerName,
    dateTime: reservation.dateTime,
    menu: reservation.menu,
  })
  selectedReservation.value = reservation
}

// 施術履歴追加
const addTreatmentHistory = (reservation) => {
  const treatmentDate = reservation.dateTime.toDate()
  const encodedDateTime = encodeURIComponent(treatmentDate.toISOString())

  router.push({
    path: `/addhistory/${reservation.customerId}`,
    query: {
      datetime: encodedDateTime,
      menu: encodeURIComponent(reservation.menu),
    },
  })
  selectedReservation.value = null
}

// 売上登録
const addSales = (reservation) => {
  router.push({
    path: '/saleform',
    query: {
      customerId: reservation.customerId,
      eventId: reservation.id,
      menu: encodeURIComponent(reservation.menu),
      dateTime: encodeURIComponent(reservation.dateTime.toDate().toISOString()),
      staff: encodeURIComponent(reservation.staff || ''),
    },
  })
  selectedReservation.value = null
}

// 予約削除の確認
const confirmDeleteReservation = async (reservation) => {
  if (confirm('この予約を削除してもよろしいですか？')) {
    try {
      console.log('予約削除開始:', reservation.id)
      await deleteDoc(doc(db, 'reservations', reservation.id))
      console.log('予約削除完了')
      selectedReservation.value = null
      // 予約一覧を更新
      await fetchReservations()
    } catch (error) {
      console.error('予約削除エラー:', error)
      alert('予約の削除中にエラーが発生しました。')
    }
  }
}

onMounted(() => {
  fetchReservations()
  // URLクエリパラメータから日時を取得
  const dateTimeParam = route.query.datetime
  if (dateTimeParam) {
    const decodedDateTime = decodeURIComponent(dateTimeParam)
    selectedDateTime.value = new Date(decodedDateTime)
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* スクロールバーのカスタマイズ */
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

/* 予約スロットのスタイル */
td {
  position: relative;
  overflow: visible;
  min-width: 35px;
  padding: 0.25rem !important;
  height: 4rem;
}

/* 予約バーのスタイル */
.absolute {
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 0.25rem;
  margin: 0;
  backdrop-filter: blur(4px);
  border-radius: 2px;
  font-size: 0.75rem;
  transform-origin: left;
  position: absolute;
  left: 0;
  width: 100%;
  height: 3.5rem;
  z-index: 1;
}

.absolute:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

/* 予約情報の表示改善 */
.font-medium {
  font-weight: 500;
}

.text-sm {
  font-size: 0.75rem;
}

.text-xs {
  font-size: 0.65rem;
}

/* テーブルヘッダーのスタイル */
th {
  padding: 0.25rem !important;
  border-right: 1px solid #e5e7eb;
}

/* テーブルセルのスタイル */
td {
  padding: 0.25rem !important;
  border-right: 1px solid #e5e7eb;
}

/* 最後の列の縦線を削除 */
th:last-child,
td:last-child {
  border-right: none;
}

/* 予約スロットのスタイル */
td {
  position: relative;
  overflow: visible;
  min-width: 35px;
  padding: 0.25rem !important;
  background-color: #f9fafb;
}

/* 予約があるセルの背景色を白に */
td[class*='group']:has(.absolute) {
  background-color: white;
}
</style>
