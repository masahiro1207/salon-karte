<template>
  <div class="bg-off-white p-8 rounded-lg shadow-md text-charcoal-black mx-auto max-w-4xl">
    <h2 class="text-2xl font-bold mb-4">メニューを追加</h2>
    <form @submit.prevent="addMenu" class="space-y-4">
      <div class="flex flex-col">
        <label for="name">メニュー名</label>
        <input
          type="text"
          id="name"
          v-model="menu.name"
          required
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        />
      </div>
      <div class="flex flex-col">
        <label for="kana">ふりがな</label>
        <input
          type="text"
          id="kana"
          v-model="menu.kana"
          required
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        />
      </div>
      <div class="flex flex-col">
        <label for="duration">所要時間（分）</label>
        <input
          type="number"
          id="duration"
          v-model="menu.duration"
          required
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-charcoal-black"
        />
      </div>
      <div class="flex justify-end mt-4 space-x-2">
        <button type="submit" class="bg-black hover:bg-dark-gray text-white px-4 py-2 rounded-md">
          追加
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
import { reactive } from 'vue'
import { db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'

const router = useRouter()
const menu = reactive({
  name: '',
  kana: '',
  duration: null,
})
const goBack = () => {
  router.push('/')
}
const addMenu = async () => {
  try {
    await addDoc(collection(db, 'menus'), {
      name: menu.name,
      kana: menu.kana,
      duration: parseInt(menu.duration), // 数値に変換
    })
    menu.name = '' // 入力欄をクリア
    menu.duration = null // 入力欄をクリア
    menu.kana = '' // 入力欄をクリア
    router.push('/') // 予約一覧に戻る
    console.log('メニューを追加しました')
  } catch (error) {
    console.error('メニュー追加中にエラーが発生しました:', error)
  }
}
</script>
