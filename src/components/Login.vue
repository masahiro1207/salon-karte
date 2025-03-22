<template>
  <div class="bg-white p-8 rounded-lg shadow-md text-center mx-auto">
    <h1 class="text-2xl font-bold mb-4 text-charcoal-black">ログイン</h1>
    <button
      @click="signInWithGoogle"
      class="bg-black hover:bg-dark-gray text-white px-4 py-2 rounded-md"
    >
      Googleでログイン
    </button>
    <p v-if="error" class="mt-4 text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { auth, googleAuthProvider } from '../firebase'
import { signInWithPopup } from 'firebase/auth'

// コンポーネント名を定義
defineOptions({
  name: 'LoginForm',
})

const error = ref(null)

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider)
    // ログイン成功時の処理
    console.log('ログイン:', result.user)
  } catch (err) {
    // ログイン失敗時の処理
    error.value = err.message
    console.error('ログインエラー:', err)
  }
}
</script>
