import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
  const loginUser = ref(null);

  const setUser = (user) => {
    loginUser.value = user;
  };

const user = computed(() => loginUser.value);

  return { user, setUser };
});
