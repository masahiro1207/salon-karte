import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import Login from '../components/Login.vue'
import ReservationList from '../components/ReservationList.vue'
import CustomerList from '../components/CustomerList.vue'
import SalesList from '../components/SalesList.vue'
import AddReservation from '../components/AddReservation.vue'
import EditReservation from '../components/EditReservation.vue'
import CustomerDetail from '../components/CustomerDetail.vue'
import AddCustomer from '../components/AddCustomer.vue'
import EditCustomer from '../components/EditCustomer.vue'
import TreatmentHistory from '../components/TreatmentHistory.vue'
import SaleForm from '../components/SaleForm.vue'

const router = createRouter({
  history: createWebHistory('/salon-karte/'),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/reservations',
      name: 'reservations',
      component: ReservationList,
      meta: { requiresAuth: true }
    },
    {
      path: '/customer',
      name: 'customer',
      component: CustomerList,
      meta: { requiresAuth: true }
    },
    {
      path: '/sales',
      name: 'sales',
      component: SalesList,
      meta: { requiresAuth: true }
    },
    {
      path: '/addreservation',
      name: 'addreservation',
      component: AddReservation,
      meta: { requiresAuth: true }
    },
    {
      path: '/editreservation/:id',
      name: 'editreservation',
      component: EditReservation,
      meta: { requiresAuth: true }
    },
    {
      path: '/customerdetail/:id',
      name: 'customerdetail',
      component: CustomerDetail,
      meta: { requiresAuth: true }
    },
    {
      path: '/addcustomer',
      name: 'addcustomer',
      component: AddCustomer,
      meta: { requiresAuth: true }
    },
    {
      path: '/editcustomer/:id',
      name: 'editcustomer',
      component: EditCustomer,
      meta: { requiresAuth: true }
    },
    {
      path: '/history/:id',
      name: 'history',
      component: TreatmentHistory,
      meta: { requiresAuth: true }
    },
    {
      path: '/saleform',
      name: 'saleform',
      component: SaleForm,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !userStore.user) {
    next('/')
  } else if (to.path === '/' && userStore.user) {
    next('/reservations')
  } else {
    next()
  }
})

export default router
