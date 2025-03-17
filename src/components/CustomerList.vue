<template>
  <div class="container mx-auto p-4 sm:p-8 bg-gray-50 min-h-screen">
    <!-- ヘッダーセクション -->
    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800">顧客一覧</h2>
        <button
          @click="addCustomer"
          class="w-full sm:w-auto bg-color3 hover:bg-opacity-90 text-white px-4 sm:px-6 py-2 rounded-full shadow-sm transition duration-200 ease-in-out flex items-center justify-center space-x-2"
        >
          <span class="material-icons text-xl">add</span>
          <span>新規登録</span>
        </button>
      </div>

      <!-- 検索フィルター -->
      <div class="mt-4 sm:mt-6">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center">
            <span class="material-icons text-gray-400">search</span>
          </span>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="名前、カナ、電話番号で検索..."
            class="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-color3 focus:border-transparent transition duration-200"
          />
        </div>
      </div>
    </div>

    <!-- 顧客グループセクション -->
    <div v-if="groupedCustomers.length > 0" class="space-y-4 sm:space-y-6">
      <div
        v-for="group in groupedCustomers"
        :key="group.kana"
        class="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <div
          class="bg-gradient-to-r from-color1 to-color2 px-4 sm:px-6 py-3 flex justify-between items-center"
        >
          <h3 class="text-base sm:text-lg font-bold text-white">{{ group.kana }}行</h3>
          <span
            class="text-white text-xs sm:text-sm bg-white bg-opacity-20 px-2 sm:px-3 py-1 rounded-full"
          >
            {{ group.customers.length }}名
          </span>
        </div>

        <!-- モバイル表示 -->
        <div class="block sm:hidden">
          <div
            v-for="customer in group.customers"
            :key="customer.id"
            class="p-4 border-b last:border-b-0 hover:bg-gray-50"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <div class="font-medium">{{ customer.name }}</div>
                <div class="text-sm text-gray-600">{{ customer.kana }}</div>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="viewHistory(customer.id)"
                  class="text-color3 p-2 rounded-full hover:bg-color3 hover:bg-opacity-10"
                >
                  <span class="material-icons text-xl">history</span>
                </button>
                <button
                  @click="editCustomer(customer.id)"
                  class="text-color3 p-2 rounded-full hover:bg-color3 hover:bg-opacity-10"
                >
                  <span class="material-icons text-xl">edit</span>
                </button>
                <button
                  @click="deleteCustomer(customer.id)"
                  class="text-red-500 p-2 rounded-full hover:bg-red-50"
                >
                  <span class="material-icons text-xl">delete</span>
                </button>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-1 text-sm">
              <div class="flex items-center space-x-2">
                <span class="material-icons text-gray-400 text-base">phone</span>
                <span>{{ customer.phone }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="material-icons text-gray-400 text-base">email</span>
                <span>{{ customer.email || '未登録' }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="material-icons text-gray-400 text-base">event</span>
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs',
                    customer.lastVisit
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600',
                  ]"
                >
                  {{ formatDate(customer.lastVisit) || '未来店' }}
                </span>
              </div>
              <div v-if="customer.notes" class="flex items-center space-x-2">
                <span class="material-icons text-gray-400 text-base">notes</span>
                <span>{{ customer.notes }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- デスクトップ表示 -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full border-collapse table-auto min-w-[800px]">
            <thead>
              <tr class="bg-gray-50">
                <th
                  v-for="column in columns"
                  :key="column.key"
                  @click="sortBy(column.key)"
                  class="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 transition duration-150"
                >
                  <div class="flex items-center space-x-1">
                    <span>{{ column.label }}</span>
                    <span v-if="sortKey === column.key" class="material-icons text-sm">
                      {{ sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                    </span>
                  </div>
                </th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="customer in group.customers"
                :key="customer.id"
                class="hover:bg-gray-50 transition duration-150"
              >
                <td class="px-4 py-3">{{ customer.name }}</td>
                <td class="px-4 py-3 text-gray-600">{{ customer.kana }}</td>
                <td class="px-4 py-3">{{ customer.phone }}</td>
                <td class="px-4 py-3 text-gray-600">{{ customer.email || '未登録' }}</td>
                <td class="px-4 py-3">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      customer.lastVisit
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600',
                    ]"
                  >
                    {{ formatDate(customer.lastVisit) || '未来店' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600">{{ customer.notes || '' }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="viewHistory(customer.id)"
                      class="text-color3 hover:bg-color3 hover:bg-opacity-10 p-2 rounded-full transition duration-200"
                      title="履歴を表示"
                    >
                      <span class="material-icons">history</span>
                    </button>
                    <button
                      @click="editCustomer(customer.id)"
                      class="text-color3 hover:bg-color3 hover:bg-opacity-10 p-2 rounded-full transition duration-200"
                      title="編集"
                    >
                      <span class="material-icons">edit</span>
                    </button>
                    <button
                      @click="deleteCustomer(customer.id)"
                      class="text-red-500 hover:bg-red-50 p-2 rounded-full transition duration-200"
                      title="削除"
                    >
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 空の状態 -->
    <div v-else class="bg-white rounded-lg shadow-sm p-6 sm:p-12 text-center">
      <span class="material-icons text-gray-400 text-4xl sm:text-6xl mb-4">people_outline</span>
      <p class="text-gray-500 text-base sm:text-lg">登録されている顧客はいません</p>
      <button
        @click="addCustomer"
        class="mt-4 sm:mt-6 bg-color3 hover:bg-opacity-90 text-white px-4 sm:px-6 py-2 rounded-full shadow-sm transition duration-200 inline-flex items-center space-x-2"
      >
        <span class="material-icons">add</span>
        <span>顧客を登録する</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../firebase'
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { auth } from '../firebase'

const router = useRouter()

const customers = ref([])
const searchQuery = ref('')
const sortKey = ref('kana')
const sortOrder = ref('asc')

const columns = [
  { key: 'name', label: '名前' },
  { key: 'kana', label: 'カナ' },
  { key: 'phone', label: '電話番号' },
  { key: 'email', label: 'メール' },
  { key: 'lastVisit', label: '最終来店日' },
  { key: 'notes', label: '備考' },
]

const formatDate = (dateTime) => {
  if (!dateTime) return ''

  let date
  if (typeof dateTime === 'string') {
    date = new Date(dateTime)
  } else if (typeof dateTime.toDate === 'function') {
    date = dateTime.toDate()
  } else {
    date = new Date(dateTime)
  }

  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customers.value

  const query = searchQuery.value.toLowerCase()
  return customers.value.filter(
    (customer) =>
      customer.name.toLowerCase().includes(query) ||
      customer.kana.toLowerCase().includes(query) ||
      customer.phone.includes(query),
  )
})

const sortedCustomers = computed(() => {
  const sorted = [...filteredCustomers.value]

  sorted.sort((a, b) => {
    let aValue = a[sortKey.value]
    let bValue = b[sortKey.value]

    // 最終来店日の特別処理
    if (sortKey.value === 'lastVisit') {
      aValue = aValue ? new Date(aValue.toDate()) : new Date(0)
      bValue = bValue ? new Date(bValue.toDate()) : new Date(0)
    }

    // null値の処理
    if (aValue === null || aValue === undefined) aValue = ''
    if (bValue === null || bValue === undefined) bValue = ''

    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  return sorted
})

const groupedCustomers = computed(() => {
  const groups = {}
  const kanaGroups = 'アカサタナハマヤラワ'.split('')

  kanaGroups.forEach((kana) => {
    groups[kana] = []
  })

  sortedCustomers.value.forEach((customer) => {
    const firstKana = customer.kana.charAt(0)
    let group = 'ワ'

    for (let i = 0; i < kanaGroups.length - 1; i++) {
      const currentKana = kanaGroups[i]
      const nextKana = kanaGroups[i + 1]
      if (firstKana >= currentKana && firstKana < nextKana) {
        group = currentKana
        break
      }
    }

    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(customer)
  })

  return Object.entries(groups)
    .filter(([, customers]) => customers.length > 0)
    .map(([kana, customers]) => ({
      kana,
      customers,
    }))
})

const addCustomer = () => {
  router.push('/addcustomer')
}

const editCustomer = (id) => {
  router.push(`/edit/${id}`)
}

const viewHistory = (id) => {
  router.push(`/history/${id}`)
}

const deleteCustomer = async (id) => {
  if (confirm('本当に削除しますか？')) {
    try {
      await deleteDoc(doc(db, 'customers', id))
      customers.value = customers.value.filter((customer) => customer.id !== id)
    } catch (e) {
      console.error('Error deleting document: ', e)
    }
  }
}

onMounted(async () => {
  if (!auth.currentUser) {
    router.push('/login')
    return
  }

  try {
    const q = query(collection(db, 'customers'), orderBy('kana'))
    const querySnapshot = await getDocs(q)
    customers.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (e) {
    console.error('Error getting documents: ', e)
  }
})
</script>

<style scoped>
/* Material Iconsの読み込み - スタイルの先頭に移動 */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.hover-bg-opacity:hover {
  @apply bg-gray-50;
  transition: background-color 0.2s ease;
}

/* アニメーション */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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

/* モバイル最適化 */
@media (max-width: 640px) {
  .material-icons {
    font-size: 20px;
  }
}

/* タッチデバイスの最適化 */
@media (hover: none) {
  .hover\:bg-gray-50:active {
    background-color: rgba(249, 250, 251, 1);
  }

  .hover\:bg-opacity-10:active {
    opacity: 0.1;
  }
}

/* アニメーションの最適化 */
.transition {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>
