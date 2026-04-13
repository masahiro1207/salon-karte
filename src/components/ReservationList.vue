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
        <button
          @click="forceRefresh"
          class="p-2 hover:bg-green-100 rounded-full transition duration-200 text-green-600"
          title="最新データを取得"
        >
          <span class="material-icons">refresh</span>
        </button>
      </div>
    </div>

    <!-- タイムテーブル（モバイル表示） -->
    <div v-if="!isLoading" class="block sm:hidden bg-white rounded-lg shadow-sm">
      <div v-for="date in weekDates" :key="date" class="border-b last:border-b-0">
        <div
          class="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition duration-200"
          @click="handleDateClick(date)"
        >
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
                @click="handleReservationClick(reservation)"
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

    <!-- ローディング表示 -->
    <div v-if="isLoading" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <div class="flex items-center justify-center space-x-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-color3"></div>
        <span class="text-gray-600">予約データを読み込み中...</span>
      </div>
    </div>

    <!-- タイムテーブル（デスクトップ表示） -->
    <div v-else class="hidden sm:block bg-white rounded-lg shadow-sm overflow-x-auto table-container reservation-container">
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
            <td
              class="border-b border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition duration-200"
              @click="handleDateClick(date)"
            >
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
              :data-date="date"
              :data-time="time"
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
                  class="absolute rounded-sm transition duration-200 reservation-item relative"
                  :class="[
                    reservation.hasTreatmentHistory
                      ? 'bg-green-100 hover:bg-green-200'
                      : 'bg-color3 bg-opacity-20 hover:bg-opacity-30',
                    isDragging && draggedReservation?.id === reservation.id ? 'dragging' : '',
                  ]"
                  :style="{
                    position: 'absolute',
                    left: '0',
                    width: `${calculateReservationSpan(reservation) * 100}%`,
                    ...calculateReservationPosition(reservation),
                    height: '3.2rem',
                    marginBottom: '0.4rem',
                    borderLeft: `3px solid ${reservation.hasTreatmentHistory ? '#10B981' : '#6366F1'}`,
                    zIndex: isDragging && draggedReservation?.id === reservation.id ? 10 : 1,
                  }"
                  draggable="false"
                  @dragstart.prevent
                >
                  <!-- シンプルな予約バー -->
                  <div
                    class="flex items-center space-x-1 h-full px-2 cursor-pointer w-full"
                    @mousedown="handleMouseDown($event, reservation)"
                  >
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
              @click="goCustomerAccounting(selectedReservation)"
              class="flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
            >
              <span class="material-icons text-2xl sm:text-3xl text-color3 mb-2"
                >person</span
              >
              <span class="text-sm sm:text-base text-gray-700">会計・顧客</span>
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
            {{ selectedReservation.menu }}
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 日別予約客一覧モーダル -->
    <Teleport to="body">
      <div
        v-if="selectedDate"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="selectedDate = null"
      >
        <div class="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg sm:text-xl font-bold text-gray-800">
              {{ format(selectedDate, 'yyyy年M月d日(E)', { locale: ja }) }}の予約客一覧
            </h3>
            <button @click="selectedDate = null" class="text-gray-500 hover:text-gray-700">
              <span class="material-icons">close</span>
            </button>
          </div>

          <div class="space-y-4">
            <div v-for="reservation in getDayReservations(selectedDate)" :key="reservation.id" class="border border-gray-200 rounded-lg p-4">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h4 class="text-lg font-semibold text-color3">{{ reservation.customerName }}様</h4>
                  <p class="text-sm text-gray-600">
                    {{ format(reservation.dateTime.toDate(), 'HH:mm', { locale: ja }) }} -
                    {{ formatEndTime(reservation) }} ({{ reservation.duration }}分)
                  </p>
                  <p class="text-sm text-gray-600">{{ reservation.menu }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <span
                    v-if="reservation.hasTreatmentHistory"
                    class="material-icons text-green-600"
                    title="会計またはアーカイブ履歴あり"
                  >
                    check_circle
                  </span>
                  <button
                    @click="viewCustomerHistory(reservation.customerId)"
                    class="text-color3 hover:text-opacity-80 text-sm"
                  >
                    履歴詳細
                  </button>
                </div>
              </div>

              <!-- 最新の会計／参考記録（売上とアーカイブ履歴のいずれか新しい方） -->
              <div v-if="reservation.latestHistory" class="bg-gray-50 rounded-lg p-3">
                <h5 class="text-sm font-medium text-gray-700 mb-2">最新の会計／参考記録</h5>
                <div class="text-sm text-gray-600 space-y-1">
                  <p><strong>日時:</strong> {{ formatHistoryDateTime(reservation.latestHistory.dateTime) }}</p>
                  <p><strong>メニュー:</strong> {{ reservation.latestHistory.menu }}</p>

                  <p><strong>料金:</strong> ¥{{ reservation.latestHistory.price?.toLocaleString() }}</p>
                  <p v-if="reservation.latestHistory.notes"><strong>備考:</strong> {{ reservation.latestHistory.notes }}</p>
                </div>
              </div>
              <div v-else class="bg-gray-50 rounded-lg p-3">
                <p class="text-sm text-gray-500">会計・参考記録がありません</p>
              </div>
            </div>
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

const router = useRouter()
const route = useRoute()
const reservations = ref([])
const selectedReservation = ref(null)
const selectedDate = ref(null)
const currentWeekStart = ref(new Date())
const isLoading = ref(false)

// キャッシュ用変数
const customerCache = ref(new Map())
const menuCache = ref(new Map())
const cacheTimestamp = ref(null)
const CACHE_DURATION = 2 * 60 * 1000 // 2分間のキャッシュ（新しいデータ反映のため短縮）

// 週データのプリロードキャッシュ
const weeklyCache = ref(new Map())
const isPreloading = ref(false)

// ローカルストレージキャッシュ（永続化）
const STORAGE_KEY = 'salon-reservation-cache'

// 新しいシンプルな状態管理
const draggedReservation = ref(null)
const isDragging = ref(false)
// eslint-disable-next-line no-unused-vars
const loadCacheFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // 1時間以内のキャッシュのみ有効（新しいデータ反映のため短縮）
      const hourAgo = Date.now() - 60 * 60 * 1000
      Object.entries(parsed).forEach(([key, value]) => {
        if (value.timestamp > hourAgo) {
          // Timestampオブジェクトを正しく復元
          if (value.reservations) {
            value.reservations = value.reservations.map(reservation => {
              if (reservation.dateTime && typeof reservation.dateTime === 'object') {
                // Firestore Timestampオブジェクトを復元
                if (reservation.dateTime.seconds !== undefined) {
                  reservation.dateTime = new Timestamp(
                    reservation.dateTime.seconds,
                    reservation.dateTime.nanoseconds || 0
                  )
                }
              }
              return reservation
            })
          }
          weeklyCache.value.set(key, value)
        }
      })
    }
  } catch (e) {
    console.warn('Failed to load cache from storage:', e)
  }
}

const saveCacheToStorage = () => {
  try {
    const cacheObj = {}
    weeklyCache.value.forEach((value, key) => {
      // Timestampオブジェクトをシリアライズ可能な形式に変換
      const serializedValue = {
        ...value,
        reservations: value.reservations ? value.reservations.map(reservation => ({
          ...reservation,
          dateTime: reservation.dateTime ? {
            seconds: reservation.dateTime.seconds,
            nanoseconds: reservation.dateTime.nanoseconds
          } : reservation.dateTime
        })) : []
      }
      cacheObj[key] = serializedValue
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheObj))
  } catch (e) {
    console.warn('Failed to save cache to storage:', e)
  }
}

// キャッシュをクリア（新しいデータが追加された時用）
const clearCache = () => {
  weeklyCache.value.clear()
  customerCache.value.clear()
  menuCache.value.clear()
  cacheTimestamp.value = null
  localStorage.removeItem(STORAGE_KEY)
}

// 起動時に古いキャッシュを強制クリア（Timestampエラー回避）
const clearOldCache = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('Old cache cleared to prevent Timestamp errors')
  } catch (e) {
    console.warn('Failed to clear old cache:', e)
  }
}

// 強制リフレッシュ（キャッシュを無視して最新データを取得）
const forceRefresh = async () => {
  clearCache()
  await fetchReservationsOptimized()
}

// グローバルにキャッシュクリア機能を公開
window.clearSalonCache = clearCache
window.refreshReservations = forceRefresh

// デバッグ用関数を公開（開発環境のみ）
if (import.meta.env.DEV) {
  window.debugReservations = () => {
    console.log('=== 予約デバッグ情報 ===')
    console.log('時間スロット:', timeSlots.value)
    console.log('予約データ:', reservations.value)
    console.log('予約マップ:', reservationMap.value)
    console.log('現在の週:', weekDates.value)
  }
}

// 時間スロットの生成（9:00 から 20:00 まで30分間隔）
const timeSlots = computed(() => {
  const slots = []
  for (let hour = 9; hour <= 20; hour++) {
    // 時間フォーマットを統一（09:00形式）
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 20) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }
  // デバッグログ（本番環境では無効化）
  if (import.meta.env.DEV) {
    console.log('時間スロット:', slots)
  }
  return slots
})

// 現在の週の日付を生成
const weekDates = computed(() => {
  const start = currentWeekStart.value
  const end = new Date(start)
  end.setDate(end.getDate() + 6) // 本日から6日後（合計7日間）
  const dates = eachDayOfInterval({
    start,
    end,
  })
  return dates
})

const currentWeekEnd = computed(() => {
  const end = new Date(currentWeekStart.value)
  end.setDate(end.getDate() + 6) // 本日から6日後（合計7日間）
  return end
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

// 時間を30分刻みに丸める関数（15分や45分などを下に丸めて表示スロットに合わせる）
const roundToNearest30Minutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number)
  // 0-29分は00分、30-59分は30分に下に丸める
  const roundedMinutes = Math.floor(minutes / 30) * 30
  return `${hours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`
}

// 瞬時週移動（爆速システム）
const previousWeek = () => {
  const newWeekStart = subWeeks(currentWeekStart.value, 1)

  // 1. 即座に週を変更（ゼロ遅延）
  currentWeekStart.value = newWeekStart

  // 2. キャッシュから瞬時表示を試行
  const cached = loadFromCache(newWeekStart)
  if (cached && cached.length > 0) {
    // キャッシュヒット：0.05秒で完全表示
    displayInstantReservations(cached)
  } else {
    // キャッシュミス：骨格を即座に表示
    reservations.value = []
    fetchReservationsOptimized()
  }
}

const nextWeek = () => {
  const newWeekStart = addWeeks(currentWeekStart.value, 1)

  // 1. 即座に週を変更（ゼロ遅延）
  currentWeekStart.value = newWeekStart

  // 2. キャッシュから瞬時表示を試行
  const cached = loadFromCache(newWeekStart)
  if (cached && cached.length > 0) {
    // キャッシュヒット：0.05秒で完全表示
    displayInstantReservations(cached)
  } else {
    // キャッシュミス：骨格を即座に表示
    reservations.value = []
    fetchReservationsOptimized()
  }
}

// キャッシュの有効性をチェック
const isCacheValid = () => {
  return cacheTimestamp.value &&
         (Date.now() - cacheTimestamp.value) < CACHE_DURATION &&
         customerCache.value.size > 0 &&
         menuCache.value.size > 0
}

// 超高速予約データ取得（段階的読み込み）
const fetchReservationsOptimized = async () => {
  isLoading.value = true

  try {
    const startDate = new Date(currentWeekStart.value)
    startDate.setHours(0, 0, 0, 0)
    const start = Timestamp.fromDate(startDate)

    const endDate = new Date(currentWeekEnd.value)
    endDate.setHours(23, 59, 59, 999)
    const end = Timestamp.fromDate(endDate)

    // 1. キャッシュから超高速取得を試行
    const cachedReservations = loadFromCache(currentWeekStart.value)

    let reservationDocs = []

    if (cachedReservations) {
      // キャッシュヒット：瞬時に表示
      reservationDocs = cachedReservations
    } else {
      // キャッシュミス：通常の取得
      const q = query(
        collection(db, 'reservations'),
        where('dateTime', '>=', start),
        where('dateTime', '<=', end),
      )
      const querySnapshot = await getDocs(q)

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        reservationDocs.push({ id: doc.id, ...data })
      })
    }

    // 2. 即座に基本データを表示（顧客名は後で更新）
    const basicReservations = reservationDocs.map((data) => ({
      id: data.id,
      ...data,
      customerName: '読み込み中...',
      menu: data.menu || '不明',
      duration: 30, // デフォルト
      hasTreatmentHistory: false,
      latestHistory: null,
    }))

    reservations.value = basicReservations
    isLoading.value = false // ここで即座にローディング終了

    // 3. バックグラウンドで詳細データを取得
    await enhanceReservationsInBackground(reservationDocs)

  } catch (e) {
    console.error('Error fetching reservations:', e)
    isLoading.value = false
  }
}

// バックグラウンドで詳細データを取得・更新
const enhanceReservationsInBackground = async (reservationDocs) => {
  try {
    // 必要なIDを収集
    const customerIds = new Set()
    const menuNames = new Set()
    reservationDocs.forEach((data) => {
      if (data.customerId) customerIds.add(data.customerId)
      if (data.menu) menuNames.add(data.menu)
    })

    // 並列で取得開始
    const [customerData, menuData] = await Promise.all([
      getCustomerDataOptimized(customerIds),
      getMenuDataOptimized(menuNames)
    ])

    // 4. 顧客名とメニュー情報を即座に更新
    const updatedReservations = reservations.value.map((reservation) => ({
      ...reservation,
      customerName: reservation.customerId
        ? customerData.get(reservation.customerId)?.name || '不明'
        : '不明',
      duration: reservation.menu
        ? menuData.get(reservation.menu)?.duration || 30
        : 30,
    }))

    reservations.value = updatedReservations

    // 5. 最後に履歴データを非同期で取得（重い処理）
    setTimeout(async () => {
      const { allHistories, latestHistories } = await getHistoryDataOptimized(customerIds)

      // 6. 最終的な更新
      const finalReservations = reservations.value.map((reservation) => {
        const reservationDate = format(reservation.dateTime.toDate(), 'yyyy-MM-dd')
        const customerHistories = allHistories.get(reservation.customerId)
        const hasTreatmentHistory = customerHistories && customerHistories.has(reservationDate)
        const latestHistory = latestHistories.get(reservation.customerId) || null

        return {
          ...reservation,
          hasTreatmentHistory,
          latestHistory,
        }
      })

      reservations.value = finalReservations

      // 7. 積極的プリロード（完全非同期）
      setTimeout(() => {
        aggressivePreload()
      }, 200) // 200ms後に積極的プリロード開始
    }, 100) // 100ms後に履歴取得開始

  } catch (e) {
    console.error('Error enhancing reservations:', e)
  }
}

// 最適化された顧客データ取得
const getCustomerDataOptimized = async (customerIds) => {
  const customerData = new Map()
  if (customerIds.size === 0) return customerData

  const useCache = isCacheValid()

  if (useCache) {
    customerIds.forEach(customerId => {
      if (customerCache.value.has(customerId)) {
        customerData.set(customerId, customerCache.value.get(customerId))
      }
    })
  }

  const uncachedCustomerIds = useCache
    ? Array.from(customerIds).filter(id => !customerCache.value.has(id))
    : Array.from(customerIds)

  if (uncachedCustomerIds.length > 0) {
    for (let i = 0; i < uncachedCustomerIds.length; i += 30) {
      const chunk = uncachedCustomerIds.slice(i, i + 30)

      if (chunk.length === 1) {
        const customerDoc = await getDoc(doc(db, 'customers', chunk[0]))
        if (customerDoc.exists()) {
          const data = customerDoc.data()
          const customer = {
            id: chunk[0],
            name: `${data.lastName || ''} ${data.firstName || ''}`.trim(),
            ...data,
          }
          customerData.set(chunk[0], customer)
          customerCache.value.set(chunk[0], customer)
        }
      } else {
        const customersQuery = query(
          collection(db, 'customers'),
          where('__name__', 'in', chunk)
        )
        const customersSnapshot = await getDocs(customersQuery)

        customersSnapshot.forEach((doc) => {
          const data = doc.data()
          const customer = {
            id: doc.id,
            name: `${data.lastName || ''} ${data.firstName || ''}`.trim(),
            ...data,
          }
          customerData.set(doc.id, customer)
          customerCache.value.set(doc.id, customer)
        })
      }
    }
  }

  return customerData
}

// 最適化されたメニューデータ取得
const getMenuDataOptimized = async (menuNames) => {
  const menuData = new Map()
  if (menuNames.size === 0) return menuData

  const useCache = isCacheValid()

  if (useCache) {
    menuNames.forEach(menuName => {
      if (menuCache.value.has(menuName)) {
        menuData.set(menuName, menuCache.value.get(menuName))
      }
    })
  }

  const uncachedMenuNames = useCache
    ? Array.from(menuNames).filter(name => !menuCache.value.has(name))
    : Array.from(menuNames)

  if (uncachedMenuNames.length > 0) {
    const menusRef = collection(db, 'menus')
    const menuQuery = query(menusRef, where('name', 'in', uncachedMenuNames))
    const menuSnapshot = await getDocs(menuQuery)
    menuSnapshot.forEach((doc) => {
      const data = doc.data()
      menuData.set(data.name, data)
      menuCache.value.set(data.name, data)
    })
  }

  return menuData
}

// 日時が新しい方のレコードを返す（施術履歴・売上のどちらでも同じ形で比較）
const pickNewerHistoryOrSale = (a, b) => {
  if (!a) return b
  if (!b) return a
  const aTime =
    a.dateTime instanceof Timestamp
      ? a.dateTime.toDate().getTime()
      : new Date(a.dateTime).getTime()
  const bTime =
    b.dateTime instanceof Timestamp
      ? b.dateTime.toDate().getTime()
      : new Date(b.dateTime).getTime()
  return bTime >= aTime ? b : a
}

// 最適化された履歴データ取得（週内の「会計済み」判定に売上も含める）
const getHistoryDataOptimized = async (customerIds) => {
  const allHistories = new Map()
  const latestHistories = new Map()

  if (customerIds.size === 0) return { allHistories, latestHistories }

  const startDate = new Date(currentWeekStart.value)
  startDate.setHours(0, 0, 0, 0)
  const start = Timestamp.fromDate(startDate)

  const endDate = new Date(currentWeekEnd.value)
  endDate.setHours(23, 59, 59, 999)
  const end = Timestamp.fromDate(endDate)

  const customerIdArray = Array.from(customerIds)

  const historyPromises = []

  for (let i = 0; i < customerIdArray.length; i += 30) {
    const chunk = customerIdArray.slice(i, i + 30)

    const weekHistoryQuery = query(
      collection(db, 'histories'),
      where('customerId', 'in', chunk),
      where('dateTime', '>=', start),
      where('dateTime', '<=', end)
    )
    historyPromises.push(getDocs(weekHistoryQuery))

    const allHistoryQuery = query(
      collection(db, 'histories'),
      where('customerId', 'in', chunk)
    )
    historyPromises.push(getDocs(allHistoryQuery))

    const weekSaleQuery = query(
      collection(db, 'sales'),
      where('customerId', 'in', chunk),
      where('dateTime', '>=', start),
      where('dateTime', '<=', end)
    )
    historyPromises.push(getDocs(weekSaleQuery))

    const allSaleQuery = query(collection(db, 'sales'), where('customerId', 'in', chunk))
    historyPromises.push(getDocs(allSaleQuery))
  }

  const results = await Promise.all(historyPromises)

  for (let i = 0; i < results.length; i += 4) {
    const weekHistories = results[i]
    const allCustomerHistories = results[i + 1]
    const weekSales = results[i + 2]
    const allCustomerSales = results[i + 3]

    weekHistories.forEach((doc) => {
      const historyData = doc.data()
      const cid = historyData.customerId
      const historyDate = format(historyData.dateTime.toDate(), 'yyyy-MM-dd')

      if (!allHistories.has(cid)) {
        allHistories.set(cid, new Map())
      }
      if (!allHistories.get(cid).has(historyDate)) {
        allHistories.get(cid).set(historyDate, [])
      }
      allHistories.get(cid).get(historyDate).push({
        id: doc.id,
        ...historyData
      })
    })

    weekSales.forEach((doc) => {
      const saleData = doc.data()
      const cid = saleData.customerId
      if (!saleData.dateTime?.toDate) return
      const saleDate = format(saleData.dateTime.toDate(), 'yyyy-MM-dd')

      if (!allHistories.has(cid)) {
        allHistories.set(cid, new Map())
      }
      if (!allHistories.get(cid).has(saleDate)) {
        allHistories.get(cid).set(saleDate, [])
      }
      allHistories.get(cid).get(saleDate).push({
        id: doc.id,
        ...saleData
      })
    })

    const customerHistoryMap = new Map()
    allCustomerHistories.forEach((doc) => {
      const historyData = { id: doc.id, ...doc.data() }
      const cid = historyData.customerId

      if (!customerHistoryMap.has(cid)) {
        customerHistoryMap.set(cid, [])
      }
      customerHistoryMap.get(cid).push(historyData)
    })

    const customerSaleMap = new Map()
    allCustomerSales.forEach((doc) => {
      const saleData = { id: doc.id, ...doc.data() }
      const cid = saleData.customerId

      if (!customerSaleMap.has(cid)) {
        customerSaleMap.set(cid, [])
      }
      customerSaleMap.get(cid).push(saleData)
    })

    const mergeLatestForCustomer = (cid) => {
      const histories = customerHistoryMap.get(cid) || []
      const salesList = customerSaleMap.get(cid) || []

      let latestH = null
      if (histories.length > 0) {
        latestH = histories.sort((a, b) => {
          const aTime = a.dateTime instanceof Timestamp ? a.dateTime.toDate() : new Date(a.dateTime)
          const bTime = b.dateTime instanceof Timestamp ? b.dateTime.toDate() : new Date(b.dateTime)
          return bTime - aTime
        })[0]

        if (latestH.dateTime && !(latestH.dateTime instanceof Timestamp)) {
          if (typeof latestH.dateTime === 'object' && 'seconds' in latestH.dateTime) {
            latestH.dateTime = new Timestamp(latestH.dateTime.seconds, latestH.dateTime.nanoseconds)
          } else {
            latestH.dateTime = Timestamp.fromDate(new Date(latestH.dateTime))
          }
        }
      }

      let latestS = null
      if (salesList.length > 0) {
        latestS = salesList.sort((a, b) => {
          const aTime = a.dateTime instanceof Timestamp ? a.dateTime.toDate() : new Date(a.dateTime)
          const bTime = b.dateTime instanceof Timestamp ? b.dateTime.toDate() : new Date(b.dateTime)
          return bTime - aTime
        })[0]

        if (latestS.dateTime && !(latestS.dateTime instanceof Timestamp)) {
          if (typeof latestS.dateTime === 'object' && 'seconds' in latestS.dateTime) {
            latestS.dateTime = new Timestamp(latestS.dateTime.seconds, latestS.dateTime.nanoseconds)
          } else {
            latestS.dateTime = Timestamp.fromDate(new Date(latestS.dateTime))
          }
        }
      }

      const merged = pickNewerHistoryOrSale(latestH, latestS)
      if (merged) {
        latestHistories.set(cid, merged)
      }
    }

    const cidSet = new Set([
      ...customerHistoryMap.keys(),
      ...customerSaleMap.keys(),
    ])
    cidSet.forEach(mergeLatestForCustomer)
  }

  return { allHistories, latestHistories }
}

// 積極的プリロード（爆速システム）
const aggressivePreload = async () => {
  if (isPreloading.value) return

  isPreloading.value = true

  try {
    const currentStart = new Date(currentWeekStart.value)

    // 前後3週間をプリロード（超先読み）
    const weeksToPreload = []
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue // 現在の週はスキップ
      const weekStart = addWeeks(currentStart, i)
      weeksToPreload.push({
        weekStart,
        direction: i < 0 ? 'prev' : 'next',
        priority: Math.abs(i) // 近い週ほど高優先度
      })
    }

    // 優先度順でプリロード
    weeksToPreload.sort((a, b) => a.priority - b.priority)

    // 並列プリロード（最大3週同時）
    const chunks = []
    for (let i = 0; i < weeksToPreload.length; i += 3) {
      chunks.push(weeksToPreload.slice(i, i + 3))
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(({ weekStart, direction }) =>
          preloadWeekData(weekStart, direction)
        )
      )
      // 少し間隔を空けてサーバー負荷軽減
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  } catch (e) {
    console.error('Error in aggressive preload:', e)
  } finally {
    isPreloading.value = false
  }
}

// 隣の週をプリロード（従来版）
// eslint-disable-next-line no-unused-vars
const preloadAdjacentWeeks = async () => {
  if (isPreloading.value) return // 既にプリロード中

  isPreloading.value = true

  try {
    const currentStart = new Date(currentWeekStart.value)

    // 前週と次週の開始日を計算
    const prevWeekStart = subWeeks(currentStart, 1)
    const nextWeekStart = addWeeks(currentStart, 1)

    // 両方を並列でプリロード
    await Promise.all([
      preloadWeekData(prevWeekStart, 'prev'),
      preloadWeekData(nextWeekStart, 'next')
    ])
  } catch (e) {
    console.error('Error preloading adjacent weeks:', e)
  } finally {
    isPreloading.value = false
  }
}

// 特定の週のデータをプリロード
const preloadWeekData = async (weekStart, direction) => {
  const weekKey = format(weekStart, 'yyyy-MM-dd')

  // 既にキャッシュされている場合はスキップ
  if (weeklyCache.value.has(weekKey)) return

  try {
    const startDate = new Date(weekStart)
    startDate.setHours(0, 0, 0, 0)
    const start = Timestamp.fromDate(startDate)

    const endDate = new Date(weekStart)
    endDate.setDate(endDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)
    const end = Timestamp.fromDate(endDate)

    // 予約データのみを取得（軽量）
    const q = query(
      collection(db, 'reservations'),
      where('dateTime', '>=', start),
      where('dateTime', '<=', end),
    )
    const querySnapshot = await getDocs(q)

    const reservationDocs = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      reservationDocs.push({ id: doc.id, ...data })
    })

        // 週データをキャッシュに保存
    weeklyCache.value.set(weekKey, {
      reservations: reservationDocs,
      timestamp: Date.now(),
      direction
    })

    // ローカルストレージに永続化
    saveCacheToStorage()

  } catch (e) {
    console.error(`Error preloading ${direction} week:`, e)
  }
}

// キャッシュからの高速データ取得
const loadFromCache = (weekStart) => {
  const weekKey = format(weekStart, 'yyyy-MM-dd')
  const cached = weeklyCache.value.get(weekKey)

  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.reservations
  }

  return null
}

// 瞬時予約表示（爆速モード）
const displayInstantReservations = async (cachedReservations) => {
  // キャッシュされた顧客データがあれば即座に表示
  const customerIds = new Set()

  // Timestampオブジェクトの正常性をチェック
  const validReservations = cachedReservations.filter(data => {
    if (data.customerId) customerIds.add(data.customerId)

    // dateTimeがTimestampでない場合は修正
    if (data.dateTime && typeof data.dateTime === 'object' && !data.dateTime.toDate) {
      if (data.dateTime.seconds !== undefined) {
        data.dateTime = new Timestamp(data.dateTime.seconds, data.dateTime.nanoseconds || 0)
      }
    }

    return data.dateTime && typeof data.dateTime.toDate === 'function'
  })

  // 顧客データを高速取得
  const customerData = await getCustomerDataOptimized(customerIds)

  // Loading表示なしで即座に完全データを表示
  const instantReservations = validReservations.map((data) => ({
    id: data.id,
    ...data,
    customerName: data.customerId
      ? customerData.get(data.customerId)?.name || '不明'
      : '不明',
    menu: data.menu || '不明',
    duration: 30,
    hasTreatmentHistory: false,
    latestHistory: null,
  }))

    reservations.value = instantReservations

  // メニューデータと履歴データを非同期で更新
  setTimeout(async () => {
    const menuNames = new Set()
    cachedReservations.forEach((data) => {
      if (data.menu) menuNames.add(data.menu)
    })

    // メニューデータを取得
    const menuData = await getMenuDataOptimized(menuNames)

    // メニュー情報を更新
    const updatedReservations = reservations.value.map((reservation) => ({
      ...reservation,
      duration: reservation.menu
        ? menuData.get(reservation.menu)?.duration || 30
        : 30,
    }))

    reservations.value = updatedReservations

    // 履歴データは後回し（ユーザビリティ重視）
    setTimeout(async () => {
      const { allHistories, latestHistories } = await getHistoryDataOptimized(customerIds)

      const finalReservations = reservations.value.map((reservation) => {
        const reservationDate = format(reservation.dateTime.toDate(), 'yyyy-MM-dd')
        const customerHistories = allHistories.get(reservation.customerId)
        const hasTreatmentHistory = customerHistories && customerHistories.has(reservationDate)
        const latestHistory = latestHistories.get(reservation.customerId) || null

        return {
          ...reservation,
          hasTreatmentHistory,
          latestHistory,
        }
      })

      reservations.value = finalReservations
    }, 200) // 200ms後に履歴更新
  }, 5) // 5ms後に名前更新（ほぼ瞬時）
}

// 予約データの取得（旧関数）
const fetchReservations = async () => {
  isLoading.value = true
  try {
    const startDate = new Date(currentWeekStart.value)
    startDate.setHours(0, 0, 0, 0)
    const start = Timestamp.fromDate(startDate)

    const endDate = new Date(currentWeekEnd.value)
    endDate.setHours(23, 59, 59, 999)
    const end = Timestamp.fromDate(endDate)

    // 予約データの取得
    const q = query(
      collection(db, 'reservations'),
      where('dateTime', '>=', start),
      where('dateTime', '<=', end),
    )
    const querySnapshot = await getDocs(q)

    // 必要なcustomerIdとmenuを収集
    const customerIds = new Set()
    const menuNames = new Set()
    const reservationDocs = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.customerId) customerIds.add(data.customerId)
      if (data.menu) menuNames.add(data.menu)
      reservationDocs.push({ id: doc.id, ...data })
    })

    // 顧客データを一括取得（キャッシュ対応）
    const customerData = new Map()
    if (customerIds.size > 0) {
      const useCache = isCacheValid()

      if (useCache) {
        // キャッシュから顧客データを取得
        customerIds.forEach(customerId => {
          if (customerCache.value.has(customerId)) {
            customerData.set(customerId, customerCache.value.get(customerId))
          }
        })
      }

      // キャッシュにない顧客IDを特定
      const uncachedCustomerIds = useCache
        ? Array.from(customerIds).filter(id => !customerCache.value.has(id))
        : Array.from(customerIds)

      if (uncachedCustomerIds.length > 0) {
        // customerIdsを30件ずつのチャンクに分割（Firestoreの'in'クエリの制限）
        const customerIdChunks = []
        for (let i = 0; i < uncachedCustomerIds.length; i += 30) {
          customerIdChunks.push(uncachedCustomerIds.slice(i, i + 30))
        }

        // 各チャンクを並列で処理
        const customerPromises = customerIdChunks.map(async (chunk) => {
        if (chunk.length === 1) {
          // 単一の顧客の場合は直接取得
          const customerDoc = await getDoc(doc(db, 'customers', chunk[0]))
          if (customerDoc.exists()) {
            const data = customerDoc.data()
            return [{
              id: chunk[0],
              name: `${data.lastName || ''} ${data.firstName || ''}`.trim(),
              ...data,
            }]
          }
          return [{ id: chunk[0], name: '不明' }]
        } else {
          // 複数の顧客の場合はwhere inクエリを使用
          const customersQuery = query(
            collection(db, 'customers'),
            where('__name__', 'in', chunk)
          )
          const customersSnapshot = await getDocs(customersQuery)
          const results = []

          customersSnapshot.forEach((doc) => {
            const data = doc.data()
            results.push({
              id: doc.id,
              name: `${data.lastName || ''} ${data.firstName || ''}`.trim(),
              ...data,
            })
          })

          // 存在しない顧客IDのために不明データを追加
          chunk.forEach((customerId) => {
            if (!results.find(customer => customer.id === customerId)) {
              results.push({ id: customerId, name: '不明' })
            }
          })

          return results
        }
      })

        const customerChunkResults = await Promise.all(customerPromises)
        customerChunkResults.flat().forEach((customer) => {
          customerData.set(customer.id, customer)
          // キャッシュに保存
          customerCache.value.set(customer.id, customer)
        })
      }
    }

    // メニューデータを一括取得（キャッシュ対応）
    const menuData = new Map()
    if (menuNames.size > 0) {
      const useCache = isCacheValid()

      if (useCache) {
        // キャッシュからメニューデータを取得
        menuNames.forEach(menuName => {
          if (menuCache.value.has(menuName)) {
            menuData.set(menuName, menuCache.value.get(menuName))
          }
        })
      }

      // キャッシュにないメニューを特定
      const uncachedMenuNames = useCache
        ? Array.from(menuNames).filter(name => !menuCache.value.has(name))
        : Array.from(menuNames)

      if (uncachedMenuNames.length > 0) {
        const menusRef = collection(db, 'menus')
        const menuQuery = query(menusRef, where('name', 'in', uncachedMenuNames))
        const menuSnapshot = await getDocs(menuQuery)
        menuSnapshot.forEach((doc) => {
          const data = doc.data()
          menuData.set(data.name, data)
          // キャッシュに保存
          menuCache.value.set(data.name, data)
        })
      }
    }

        // 施術履歴データを一括取得
    const allHistories = new Map()
    const latestHistories = new Map()

    if (customerIds.size > 0) {
      // customerIdsを30件ずつのチャンクに分割（Firestoreの'in'クエリの制限）
      const customerIdArray = Array.from(customerIds)
      const historyPromises = []

      for (let i = 0; i < customerIdArray.length; i += 30) {
        const chunk = customerIdArray.slice(i, i + 30)
        const historiesQuery = query(
          collection(db, 'histories'),
          where('customerId', 'in', chunk),
          where('dateTime', '>=', start),
          where('dateTime', '<=', end)
        )
        historyPromises.push(getDocs(historiesQuery))
      }

      const historiesSnapshots = await Promise.all(historyPromises)

      // 全ての結果をマージ
      historiesSnapshots.forEach(historiesSnapshot => {

              historiesSnapshot.forEach((doc) => {
          const historyData = doc.data()
          const customerId = historyData.customerId
          const historyDate = format(historyData.dateTime.toDate(), 'yyyy-MM-dd')

          if (!allHistories.has(customerId)) {
            allHistories.set(customerId, new Map())
          }
          if (!allHistories.get(customerId).has(historyDate)) {
            allHistories.get(customerId).set(historyDate, [])
          }
          allHistories.get(customerId).get(historyDate).push({
            id: doc.id,
            ...historyData
          })
        })
      })

      const salePromises = []
      for (let i = 0; i < customerIdArray.length; i += 30) {
        const chunk = customerIdArray.slice(i, i + 30)
        const salesQuery = query(
          collection(db, 'sales'),
          where('customerId', 'in', chunk),
          where('dateTime', '>=', start),
          where('dateTime', '<=', end)
        )
        salePromises.push(getDocs(salesQuery))
      }
      const salesSnapshots = await Promise.all(salePromises)
      salesSnapshots.forEach((salesSnapshot) => {
        salesSnapshot.forEach((doc) => {
          const saleData = doc.data()
          const cid = saleData.customerId
          if (!saleData.dateTime?.toDate) return
          const saleDate = format(saleData.dateTime.toDate(), 'yyyy-MM-dd')

          if (!allHistories.has(cid)) {
            allHistories.set(cid, new Map())
          }
          if (!allHistories.get(cid).has(saleDate)) {
            allHistories.get(cid).set(saleDate, [])
          }
          allHistories.get(cid).get(saleDate).push({
            id: doc.id,
            ...saleData
          })
        })
      })

                  // 最新履歴を高速取得（単一クエリで全取得）
      if (customerIdArray.length > 0) {
        // 全顧客の履歴を一括取得し、後でソート
        const allHistoriesQuery = query(
          collection(db, 'histories'),
          where('customerId', 'in', customerIdArray.slice(0, 30)) // 30件制限
        )
        const allHistoriesSnapshot = await getDocs(allHistoriesQuery)

        // 顧客ごとに履歴をグループ化
        const customerHistoryMap = new Map()
        allHistoriesSnapshot.forEach((doc) => {
          const historyData = { id: doc.id, ...doc.data() }
          const customerId = historyData.customerId

          if (!customerHistoryMap.has(customerId)) {
            customerHistoryMap.set(customerId, [])
          }
          customerHistoryMap.get(customerId).push(historyData)
        })

        // 各顧客の最新履歴を特定
        customerHistoryMap.forEach((histories, customerId) => {
          if (histories.length > 0) {
            // 日時でソートして最新を取得
            const latestHistory = histories.sort((a, b) => {
              const aTime = a.dateTime instanceof Timestamp ? a.dateTime.toDate() : new Date(a.dateTime)
              const bTime = b.dateTime instanceof Timestamp ? b.dateTime.toDate() : new Date(b.dateTime)
              return bTime - aTime
            })[0]

            // latestHistoryのdateTimeを正しく処理
            if (latestHistory.dateTime) {
              if (latestHistory.dateTime instanceof Timestamp) {
                // 既にTimestampオブジェクトなので何もしない
              } else if (typeof latestHistory.dateTime === 'object' && 'seconds' in latestHistory.dateTime) {
                latestHistory.dateTime = new Timestamp(latestHistory.dateTime.seconds, latestHistory.dateTime.nanoseconds)
              } else {
                latestHistory.dateTime = Timestamp.fromDate(new Date(latestHistory.dateTime))
              }
            }

            latestHistories.set(customerId, latestHistory)
          }
        })

        // 30件を超える場合は残りも処理（必要に応じて）
        if (customerIdArray.length > 30) {
          for (let i = 30; i < customerIdArray.length; i += 30) {
            const chunk = customerIdArray.slice(i, i + 30)
            const remainingQuery = query(
              collection(db, 'histories'),
              where('customerId', 'in', chunk)
            )
            const remainingSnapshot = await getDocs(remainingQuery)

            const remainingMap = new Map()
            remainingSnapshot.forEach((doc) => {
              const historyData = { id: doc.id, ...doc.data() }
              const customerId = historyData.customerId

              if (!remainingMap.has(customerId)) {
                remainingMap.set(customerId, [])
              }
              remainingMap.get(customerId).push(historyData)
            })

            remainingMap.forEach((histories, customerId) => {
              if (histories.length > 0) {
                const latestHistory = histories.sort((a, b) => {
                  const aTime = a.dateTime instanceof Timestamp ? a.dateTime.toDate() : new Date(a.dateTime)
                  const bTime = b.dateTime instanceof Timestamp ? b.dateTime.toDate() : new Date(b.dateTime)
                  return bTime - aTime
                })[0]

                if (latestHistory.dateTime && !(latestHistory.dateTime instanceof Timestamp)) {
                  if (typeof latestHistory.dateTime === 'object' && 'seconds' in latestHistory.dateTime) {
                    latestHistory.dateTime = new Timestamp(latestHistory.dateTime.seconds, latestHistory.dateTime.nanoseconds)
                  } else {
                    latestHistory.dateTime = Timestamp.fromDate(new Date(latestHistory.dateTime))
                  }
                }

                latestHistories.set(customerId, latestHistory)
              }
            })
          }
        }
      }

      const saleAllPromises = []
      for (let i = 0; i < customerIdArray.length; i += 30) {
        const chunk = customerIdArray.slice(i, i + 30)
        saleAllPromises.push(
          getDocs(query(collection(db, 'sales'), where('customerId', 'in', chunk)))
        )
      }
      const saleAllSnapshots = await Promise.all(saleAllPromises)
      saleAllSnapshots.forEach((snap) => {
        const byCustomer = new Map()
        snap.forEach((doc) => {
          const row = { id: doc.id, ...doc.data() }
          const cid = row.customerId
          if (!byCustomer.has(cid)) byCustomer.set(cid, [])
          byCustomer.get(cid).push(row)
        })
        byCustomer.forEach((rows, cid) => {
          if (rows.length === 0) return
          const latestS = rows.sort((a, b) => {
            const aTime = a.dateTime instanceof Timestamp ? a.dateTime.toDate() : new Date(a.dateTime)
            const bTime = b.dateTime instanceof Timestamp ? b.dateTime.toDate() : new Date(b.dateTime)
            return bTime - aTime
          })[0]
          if (latestS.dateTime && !(latestS.dateTime instanceof Timestamp)) {
            if (typeof latestS.dateTime === 'object' && 'seconds' in latestS.dateTime) {
              latestS.dateTime = new Timestamp(latestS.dateTime.seconds, latestS.dateTime.nanoseconds)
            } else {
              latestS.dateTime = Timestamp.fromDate(new Date(latestS.dateTime))
            }
          }
          const cur = latestHistories.get(cid)
          latestHistories.set(cid, pickNewerHistoryOrSale(cur, latestS))
        })
      })
    }

    // 予約データを処理
    const reservationData = reservationDocs.map((data) => {
      // 顧客名の取得
      const customerName = data.customerId
        ? customerData.get(data.customerId)?.name || '不明'
        : '不明'

      // メニュー情報の取得
      const menu = data.menu || data.service || '不明'
      const menuDuration = data.menu ? menuData.get(data.menu)?.duration || 30 : 30

      // 施術履歴の確認
      const reservationDate = format(data.dateTime.toDate(), 'yyyy-MM-dd')
      const customerHistories = allHistories.get(data.customerId)
      const hasTreatmentHistory = customerHistories && customerHistories.has(reservationDate)
      const latestHistory = latestHistories.get(data.customerId) || null

      return {
        id: data.id,
        ...data,
        customerName,
        menu,
        duration: menuDuration,
        hasTreatmentHistory,
        latestHistory,
      }
    })

    reservations.value = reservationData

    // キャッシュタイムスタンプを更新
    if (!cacheTimestamp.value) {
      cacheTimestamp.value = Date.now()
    }
  } catch (e) {
    console.error('Error fetching reservations:', e)
  } finally {
    isLoading.value = false
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
    const originalTimeKey = format(startTime, 'HH:mm')
    // 時間を30分刻みに丸める（15分や45分などの予約も表示されるように）
    const timeKey = roundToNearest30Minutes(originalTimeKey)

    // デバッグログ（本番環境では無効化）
    if (import.meta.env.DEV) {
      console.log('予約マップ作成:', {
        customer: reservation.customerName,
        dateKey,
        originalTimeKey,
        timeKey,
        originalDateTime: startTime
      })
    }

    if (!map.has(dateKey)) {
      map.set(dateKey, new Map())
    }
    if (!map.get(dateKey).has(timeKey)) {
      map.get(dateKey).set(timeKey, [])
    }
    map.get(dateKey).get(timeKey).push(reservation)
  })

  // デバッグログ（本番環境では無効化）
  if (import.meta.env.DEV) {
    console.log('予約マップ全体:', map)
  }
  return map
})

// 指定の日時の予約を取得（キャッシュを利用）
const getReservation = (date, time) => {
  const dateKey = format(date, 'yyyy-MM-dd')
  const timeKey = time

  // デバッグログ（本番環境では無効化）
  if (import.meta.env.DEV) {
    console.log('getReservation:', { dateKey, timeKey })
  }

  // その時間枠に開始する予約のみを返す
  const reservations = reservationMap.value.get(dateKey)?.get(timeKey) || []

  // デバッグログ（本番環境では無効化）
  if (import.meta.env.DEV) {
    console.log('予約データ:', reservations.length, '件')
  }

  return reservations
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

// 予約の位置を計算（余白を考慮した改善版）
const calculateReservationPosition = (reservation) => {
  if (!reservation || !reservation.dateTime) return { top: 0 }
  const laneIndex = reservation.laneIndex || 0
  const topOffset = laneIndex * 4.2 + 0.1 // 上部に少し余白
  return {
    top: `${topOffset}rem`,
  }
}

// セルの高さを計算（余白を考慮した改善版）
const calculateCellHeight = (date) => {
  const dateKey = format(date, 'yyyy-MM-dd')
  const lanes = calculateLanes.value.get(dateKey) || 1
  // 基本高さ + 各レーンの高さ + 余白
  const baseHeight = 4
  const laneHeight = 4.2 // 予約要素 + マージン分
  const totalHeight = Math.max(lanes * laneHeight + 0.5, baseHeight)
  return `${totalHeight}rem`
}

// 予約の終了時間をフォーマット
const formatEndTime = (reservation) => {
  if (!reservation || !reservation.dateTime) return ''

  const startTime = reservation.dateTime.toDate()
  const duration = reservation.duration || 30
  const endTime = new Date(startTime.getTime() + duration * 60000)

  return `${endTime.getHours()}:${endTime.getMinutes().toString().padStart(2, '0')}`
}

// 指定日の予約一覧を取得
const getDayReservations = (date) => {
  if (!date) return []
  const dateKey = format(date, 'yyyy-MM-dd')
  const dayReservations = []

  reservations.value.forEach((reservation) => {
    if (!reservation.dateTime) return
    const reservationDate = format(reservation.dateTime.toDate(), 'yyyy-MM-dd')
    if (reservationDate === dateKey) {
      dayReservations.push(reservation)
    }
  })

  // 時間順にソート
  return dayReservations.sort((a, b) => {
    return a.dateTime.toDate() - b.dateTime.toDate()
  })
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

    // ローカル時間をそのまま送信
    router
      .push({
        path: '/addreservation',
        query: {
          dateTime: datetime.toISOString(),
        },
      })
      .catch((err) => {
        if (err.name !== 'NavigationDuplicated') {
          console.error('ルーティングエラー:', err)
        }
      })
  }
}

// 予約編集
const editReservation = (id) => {
  router.push(`/editreservation/${id}`)
}

// 会計・顧客画面へ（開いている週を渡して、戻る時に同じ週に戻れるようにする）
const goCustomerAccounting = (reservation) => {
  const weekStartISO = format(currentWeekStart.value, 'yyyy-MM-dd')
  router.push({
    path: `/history/${reservation.customerId}`,
    query: { weekStart: weekStartISO },
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
      await deleteDoc(doc(db, 'reservations', reservation.id))
      selectedReservation.value = null
      // 予約一覧を更新
      await fetchReservations()
    } catch (error) {
      console.error('予約削除エラー:', error)
      alert('予約の削除中にエラーが発生しました。')
    }
  }
}

const handleReservationClick = (reservation, event) => {
  console.log('予約クリック:', reservation.customerName, 'ドラッグ中:', isDragging.value)

  // ドラッグ中はクリックイベントを無視
  if (isDragging.value) {
    console.log('ドラッグ中のためクリックを無視')
    return
  }

  selectedReservation.value = reservation
  console.log('予約メニューを表示:', reservation.customerName)
}

// 日付クリック時の処理
const handleDateClick = (date) => {
  selectedDate.value = date
}

// 顧客履歴詳細を表示（開いている週を渡して、戻る時に同じ週に戻れるようにする）
const viewCustomerHistory = (customerId) => {
  const weekStartISO = format(currentWeekStart.value, 'yyyy-MM-dd')
  router.push({
    path: `/history/${customerId}`,
    query: { weekStart: weekStartISO },
  })
  selectedDate.value = null
}

// 新しいシンプルなドラッグ&ドロップ機能
const handleMouseDown = (event, reservation) => {
  console.log('マウスダウン:', reservation.customerName)

  const startX = event.clientX
  const startY = event.clientY

  const handleMouseMove = (moveEvent) => {
    const distance = Math.sqrt(
      Math.pow(moveEvent.clientX - startX, 2) +
      Math.pow(moveEvent.clientY - startY, 2)
    )

    if (distance > 10) { // 10ピクセル以上移動したらドラッグ開始
      console.log('ドラッグ開始:', reservation.customerName)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      startDragOperation(reservation, moveEvent)
    }
  }

  const handleMouseUp = (upEvent) => {
    console.log('クリック処理:', reservation.customerName)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    // クリックとして処理（即座に実行）
    handleReservationClick(reservation, upEvent)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const startDragOperation = (reservation, event) => {
  console.log('ドラッグ操作開始:', reservation.customerName)

  const handleDragMove = (moveEvent) => {
    // ドラッグ中の視覚的フィードバック
  }

  const handleDragEnd = async (endEvent) => {
    console.log('ドラッグ終了:', reservation.customerName)

    // ドロップ先を特定
    const elementUnderMouse = document.elementFromPoint(endEvent.clientX, endEvent.clientY)
    const targetCell = elementUnderMouse?.closest('td[data-date][data-time]')

    if (targetCell) {
      const dateAttr = targetCell.getAttribute('data-date')
      const timeAttr = targetCell.getAttribute('data-time')

      if (dateAttr && timeAttr) {
        console.log('ドロップ先:', dateAttr, timeAttr)
        await moveReservation(reservation, dateAttr, timeAttr)
      }
    }

    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
  }

  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
}

// 予約の移動
const moveReservation = async (reservation, newDate, newTime) => {
  try {
    console.log('予約移動開始:', {
      customer: reservation.customerName,
      oldDateTime: reservation.dateTime.toDate(),
      newDate,
      newTime
    })

    const [hours, minutes] = newTime.split(':').map(Number)
    const newDateTime = new Date(newDate)
    newDateTime.setHours(hours, minutes, 0, 0)

    const docRef = doc(db, 'reservations', reservation.id)
    await updateDoc(docRef, {
      dateTime: Timestamp.fromDate(newDateTime),
      updatedAt: new Date()
    })

    // 予約一覧を強制更新（直接データベースから再取得）
    await forceRefresh()

    // アニメーション効果を追加
    setTimeout(() => {
      const updatedReservation = reservations.value.find(r => r.id === reservation.id)
      if (updatedReservation) {
        updatedReservation._animationClass = 'reservation-moving'
        setTimeout(() => {
          if (updatedReservation) {
            updatedReservation._animationClass = ''
          }
        }, 500)
      }
    }, 100)

    console.log('予約を移動しました:', reservation.customerName, '→', newDate, newTime)
  } catch (error) {
    console.error('予約の移動エラー:', error)
    alert('予約の移動中にエラーが発生しました。')
  }
}

// リサイズ機能は削除済み

// 履歴日時のフォーマット
const formatHistoryDateTime = (dateTime) => {
  try {
    if (!dateTime) return ''

    let date
    if (dateTime instanceof Timestamp) {
      date = dateTime.toDate()
    } else if (dateTime instanceof Date) {
      date = dateTime
    } else if (typeof dateTime === 'object' && 'seconds' in dateTime) {
      // Firestoreのタイムスタンプ形式の場合
      date = new Date(dateTime.seconds * 1000)
    } else if (typeof dateTime === 'string') {
      date = new Date(dateTime)
    } else {
      console.warn('Unknown dateTime format:', dateTime)
      return ''
    }

    return format(date, 'yyyy年M月d日 HH:mm', { locale: ja })
  } catch (error) {
    console.error('Error formatting history dateTime:', error, dateTime)
    return ''
  }
}

onMounted(() => {
  // 古いキャッシュを強制クリア（Timestampエラー回避）
  clearOldCache()

  // URLクエリパラメータから週の開始日を取得
  const weekStartParam = route.query.weekStart
  if (weekStartParam) {
    const decodedWeekStart = decodeURIComponent(weekStartParam)
    currentWeekStart.value = new Date(decodedWeekStart)
  } else {
    // クエリパラメータがない場合は本日の日付を設定
    const today = new Date()
    today.setHours(0, 0, 0, 0) // 時間を00:00:00に設定
    currentWeekStart.value = today
  }

  // 初回は常にfetch（安全性重視）
  fetchReservationsOptimized()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* 爆速画面遷移のための最適化 */
.reservation-container {
  transform: translateZ(0); /* ハードウェアアクセラレーション */
  will-change: auto;
}

.reservation-item {
  transform: translateZ(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  transform-origin: center;
}

.reservation-item:hover {
  transform: translateZ(0) translateY(-2px) scale(1.02);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.reservation-item.dragging {
  opacity: 0.8;
  transform: translateZ(0) rotate(3deg) scale(1.05) translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  transition: none !important;
}

.reservation-item.resizing {
  transform: translateZ(0) scale(1.02);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
  z-index: 999;
}

/* リサイズハンドルのスタイル */
.reservation-item .cursor-ew-resize {
  transition: all 0.2s ease-in-out;
}

.reservation-item:hover .cursor-ew-resize {
  opacity: 0.8;
  transform: scaleY(1.1);
}

.reservation-item .cursor-ew-resize:hover {
  opacity: 1;
  background-color: #3B82F6 !important;
  transform: scaleY(1.2);
}

/* ドラッグ可能エリアのスタイル */
.cursor-move {
  cursor: move !important;
  transition: all 0.2s ease-in-out;
}

.cursor-move:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

/* 予約移動時のアニメーション */
.reservation-moving {
  animation: moveReservation 0.5s ease-in-out;
}

@keyframes moveReservation {
  0% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.week-transition {
  transition: opacity 0.1s ease-out;
}

.week-transition-enter-active {
  transition: opacity 0.1s ease-out;
}

.week-transition-enter-from {
  opacity: 0;
}

.week-transition-enter-to {
  opacity: 1;
}

/* スムーズスクロール */
.table-container {
  scroll-behavior: smooth;
  transform: translateZ(0);
}

/* レンダリングパフォーマンス向上 */
.table-row {
  contain: layout style;
}

.table-cell {
  contain: layout;
}

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
