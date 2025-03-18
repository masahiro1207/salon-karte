<template>
  <div class="container mx-auto p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">予約一覧</h1>
      <button
        @click="router.push('/addreservation')"
        class="bg-color3 text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition duration-200"
      >
        新規予約
      </button>
    </div>
    <ReservationList />
  </div>
</template>

<script setup>
import ReservationList from '../components/ReservationList.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
