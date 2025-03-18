<template>
  <div class="container mx-auto p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">顧客一覧</h1>
      <button
        @click="router.push('/addcustomer')"
        class="bg-color3 text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition duration-200"
      >
        新規顧客登録
      </button>
    </div>
    <CustomerList />
  </div>
</template>

<script setup>
import CustomerList from '../components/CustomerList.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
