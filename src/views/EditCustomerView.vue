<template>
  <div class="container mx-auto p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">顧客情報編集</h1>
      <button
        @click="router.push('/customer')"
        class="bg-smoke-gray hover:bg-light-gray text-charcoal-black px-4 py-2 rounded-md"
      >
        戻る
      </button>
    </div>
    <CustomerEditForm :customerId="customerId" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CustomerEditForm from '../components/CustomerEditForm.vue'

const route = useRoute()
const router = useRouter()
const customerId = ref(route.params.id)
</script>
