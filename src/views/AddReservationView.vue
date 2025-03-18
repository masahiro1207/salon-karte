<template>
  <div class="container mx-auto p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">新規予約</h1>
      <button
        @click="router.push('/reservations')"
        class="bg-smoke-gray hover:bg-light-gray text-charcoal-black px-4 py-2 rounded-md"
      >
        戻る
      </button>
    </div>
    <AddReservation />
  </div>
</template>

<script setup>
import AddReservation from '../components/AddReservation.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
