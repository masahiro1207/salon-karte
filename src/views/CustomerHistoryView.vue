<template>
  <div class="container mx-auto p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">顧客履歴</h1>
      <button
        @click="router.push('/customer')"
        class="bg-smoke-gray hover:bg-light-gray text-charcoal-black px-4 py-2 rounded-md"
      >
        戻る
      </button>
    </div>
    <CustomerHistory :customerId="customerId" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CustomerHistory from '../components/CustomerHistory.vue'

const route = useRoute()
const router = useRouter()
const customerId = ref(route.params.id)
</script>
