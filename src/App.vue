<template>
  <div class="bg-color2 min-h-screen text-charcoal-black">
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen bg-smoke-gray p-4">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
        <p class="mt-4">読み込み中...</p>
      </div>
    </div>
    <div v-else>
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from './stores/user'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

const userStore = useUserStore()
const isLoading = ref(true)

onMounted(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    userStore.setUser(currentUser)
    isLoading.value = false
  })

  // コンポーネントのアンマウント時にリスナーを解除
  onUnmounted(() => {
    unsubscribe()
  })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.material-icons {
  vertical-align: middle;
  font-size: 1.1em;
}

/* アクティブなリンクのスタイル */
.router-link-active {
  background-color: var(--light-gray);
}

/* トランジションアニメーション */
.router-link-active,
button {
  transition: all 0.2s ease-in-out;
}

/* タッチデバイスの最適化 */
@media (hover: none) {
  .hover\:bg-light-gray:active {
    background-color: var(--light-gray);
  }
}
</style>
