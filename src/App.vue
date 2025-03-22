<template>
  <div class="bg-color2 min-h-screen text-charcoal-black">
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen bg-smoke-gray p-4">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
        <p class="mt-4">読み込み中...</p>
      </div>
    </div>
    <div v-else>
      <div v-if="userStore.user" class="p-4 sm:p-10">
        <!-- モバイルメニュー -->
        <div class="sm:hidden">
          <button
            @click="isMenuOpen = !isMenuOpen"
            class="w-full bg-color4 px-4 py-2 rounded-md text-black mb-4 flex items-center justify-between"
          >
            <span>メニュー</span>
            <span class="material-icons">{{ isMenuOpen ? 'expand_less' : 'expand_more' }}</span>
          </button>

          <div v-if="isMenuOpen" class="flex flex-col space-y-2 mb-4">
            <RouterLink
              to="/reservations"
              class="bg-color1 hover:bg-light-gray px-4 py-2 rounded-md text-black text-center"
              @click="isMenuOpen = false"
            >
              予約一覧
            </RouterLink>
            <RouterLink
              to="/customer"
              class="bg-color1 hover:bg-light-gray px-4 py-2 rounded-md text-black text-center"
              @click="isMenuOpen = false"
            >
              顧客一覧
            </RouterLink>
            <RouterLink
              to="/sales"
              class="bg-color1 hover:bg-light-gray px-4 py-2 rounded-md text-black text-center"
              @click="isMenuOpen = false"
            >
              売上一覧
            </RouterLink>
            <button
              @click="logout"
              class="bg-color1 hover:bg-light-gray px-4 py-2 rounded-md text-black w-full"
            >
              ログアウト
            </button>
          </div>
        </div>

        <!-- デスクトップメニュー -->
        <div class="hidden sm:flex justify-between items-center mb-6">
          <div class="flex space-x-4">
            <RouterLink
              to="/reservations"
              class="bg-color1 hover:bg-light-gray px-4 py-2 rounded-md text-black"
            >
              予約一覧
            </RouterLink>
            <RouterLink
              to="/customer"
              class="bg-color1 hover:bg-light-gray px-4 py-2 rounded-md text-black"
            >
              顧客一覧
            </RouterLink>
            <RouterLink
              to="/sales"
              class="bg-color1 hover:bg-light-gray px-4 py-2 rounded-md text-black"
            >
              売上一覧
            </RouterLink>
          </div>
          <button
            @click="logout"
            class="bg-color1 hover:bg-light-gray px-4 py-2 rounded-md text-black"
          >
            ログアウト
          </button>
        </div>

        <RouterView />
      </div>
      <div v-else>
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from './stores/user'
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { RouterLink } from 'vue-router'

const userStore = useUserStore()
const isMenuOpen = ref(false)
const isLoading = ref(true)

const logout = async () => {
  try {
    await signOut(auth)
    userStore.setUser(null)
    isMenuOpen.value = false
    console.log('ログアウトしました')
  } catch (err) {
    console.error('ログアウトエラー:', err)
  }
}

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
