<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white p-8 rounded-lg shadow-md">
      <h3 class="text-xl font-bold mb-4">選択してください</h3>
      <div class="space-y-2">
        <button
          @click="editReservation"
          class="w-full bg-color1 hover:bg-light-gray px-4 py-2 rounded-md text-color3"
        >
          予約編集
        </button>
        <button
          @click="goToHistory"
          class="w-full bg-color1 hover:bg-light-gray px-4 py-2 rounded-md text-color3"
        >
          施術履歴
        </button>
        <button
          @click="goToSaleForm"
          class="w-full bg-color1 hover:bg-light-gray px-4 py-2 rounded-md text-color3"
        >
          売上登録
        </button>
        <button
          @click="deleteReservation"
          class="w-full bg-color1 hover:bg-light-gray px-4 py-2 rounded-md text-color3"
          @click.prevent="deleteReservation()"
        >
          予約削除
        </button>
      </div>
      <button
        @click="closeModal"
        class="mt-4 bg-color4 hover:bg-light-gray px-4 py-2 rounded-md text-charcoal-black"
      >
        閉じる
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: { type: Boolean, default: false },
  eventId: String,
  customerId: String,
})

const emit = defineEmits(['close', 'edit', 'goToHistory', 'delete', 'goToSaleForm'])

const closeModal = () => {
  emit('close')
}

const editReservation = () => {
  emit('edit', props.eventId)
}

const goToHistory = () => {
  emit('goToHistory', props.customerId)
}
//修正
const goToSaleForm = () => {
  emit('goToSaleForm', { eventId: props.eventId, customerId: props.customerId, id: props.eventId })
}
const deleteReservation = () => {
  try {
    console.log('削除ボタンがクリックされました - Step 1')
    console.log('eventId:', props.eventId)
    emit('delete', props.eventId)
    console.log('deleteイベントが発火されました - Step 2')
  } catch (error) {
    console.error('削除処理でエラーが発生:', error)
  }
}
</script>
