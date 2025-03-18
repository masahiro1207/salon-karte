<template>
  <div class="bg-off-white p-8 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-charcoal-black">顧客履歴</h2>
      <button
        @click="router.push('/customer')"
        class="bg-smoke-gray hover:bg-light-gray text-charcoal-black px-4 py-2 rounded-md"
      >
        戻る
      </button>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-color3 mx-auto"></div>
    </div>

    <div v-else-if="error" class="text-red-500 text-center py-4">
      {{ error }}
    </div>

    <div v-else-if="histories.length === 0" class="text-center py-4 text-gray-500">
      履歴がありません
    </div>

    <div v-else class="space-y-4">
      <div v-for="history in histories" :key="history.id" class="bg-white p-4 rounded-lg shadow">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-semibold text-charcoal-black">{{ history.service }}</h3>
            <p class="text-sm text-gray-600">{{ formatDate(history.date) }} {{ history.time }}</p>
          </div>
          <div class="flex space-x-2">
            <button @click="editHistory(history)" class="text-color3 hover:text-opacity-80">
              編集
            </button>
            <button @click="deleteHistory(history.id)" class="text-red-500 hover:text-opacity-80">
              削除
            </button>
          </div>
        </div>
        <p v-if="history.notes" class="mt-2 text-gray-700">{{ history.notes }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../firebase'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'

const props = defineProps({
  customerId: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const histories = ref([])
const loading = ref(true)
const error = ref(null)

// 履歴データを取得
const fetchHistories = async () => {
  try {
    loading.value = true
    error.value = null
    const q = query(collection(db, 'histories'), where('customerId', '==', props.customerId))
    const querySnapshot = await getDocs(q)
    histories.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (e) {
    console.error('Error fetching histories: ', e)
    error.value = '履歴の取得に失敗しました'
  } finally {
    loading.value = false
  }
}

// 履歴を編集
const editHistory = (history) => {
  router.push(`/edithistory/${history.id}`)
}

// 履歴を削除
const deleteHistory = async (historyId) => {
  if (!confirm('この履歴を削除してもよろしいですか？')) return

  try {
    await deleteDoc(doc(db, 'histories', historyId))
    await fetchHistories()
  } catch (e) {
    console.error('Error deleting history: ', e)
    alert('履歴の削除に失敗しました')
  }
}

// 日付のフォーマット
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  fetchHistories()
})
</script>
