import { createRouter, createWebHashHistory } from 'vue-router'
import HistoryList from '../components/HistoryList.vue'
import HistoryForm from '../components/HistoryForm.vue'
import CustomerEditForm from '../components/CustomerEditForm.vue'
import ReservationList from '../components/ReservationList.vue'
import ReservationEditForm from '../components/ReservationEditForm.vue'
import AddMenu from '../components/AddMenu.vue'
import SalesList from '../components/SalesList.vue'
import SaleForm from '../components/SaleForm.vue'
import SaleEditForm from '../components/SaleEditForm.vue'
import CustomerList from '../components/CustomerList.vue'
import AddReservation from '../components/AddReservation.vue'
import CustomerHistory from '../components/CustomerHistory.vue'
import Login from '../components/Login.vue'
import AboutView from '../views/AboutView.vue'
import AddCustomerView from '../views/AddCustomerView.vue'
import HistoryEditForm from '../components/HistoryEditForm.vue'
import AddHistory from '../components/AddHistory.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/reservations'
    },
    {
      path: '/reservations',
      name: 'reservations',
      component: ReservationList,
      meta: { requiresAuth: true }
    },
    {
      path: '/addreservation',
      name: 'addreservation',
      component: AddReservation,
      meta: { requiresAuth: true }
    },
    {
      path: '/customer',
      name: 'customer',
      component: CustomerList,
      meta: { requiresAuth: true }
    },
    {
      path: '/addcustomer',
      name: 'addcustomer',
      component: AddCustomerView,
      meta: { requiresAuth: true }
    },
    {
      path: '/editcustomer/:id',
      name: 'editcustomer',
      component: CustomerEditForm,
      meta: { requiresAuth: true }
    },
    {
      path: '/customerhistory/:id',
      name: 'customerhistory',
      component: CustomerHistory,
      meta: { requiresAuth: true }
    },
    {
      path: '/edithistory/:id',
      name: 'edithistory',
      component: HistoryEditForm,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryList,
      meta: { requiresAuth: true }
    },
    {
      path: '/addhistory/:id',
      name: 'addhistory',
      component: AddHistory,
      meta: { requiresAuth: true }
    },
    {
      path: '/edit',
      name: 'edit',
      component: CustomerEditForm,
      meta: { requiresAuth: true }
    },
    {
      path: '/editreservation/:id',
      name: 'editreservation',
      component: ReservationEditForm,
      meta: { requiresAuth: true }
    },
    {
      path: '/addmenu',
      name: 'addmenu',
      component: AddMenu,
      meta: { requiresAuth: true }
    },
    {
      path: '/sales',
      name: 'sales',
      component: SalesList,
      meta: { requiresAuth: true }
    },
    {
      path: '/saleform',
      name: 'saleform',
      component: SaleForm,
      meta: { requiresAuth: true }
    },
    {
      path: '/editsale/:id',
      name: 'editsale',
      component: SaleEditForm,
      meta: { requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: { requiresAuth: true }
    },
    {
      path: '/history/:id',
      name: 'CustomerHistory',
      component: CustomerHistory,
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/reservations'
    }
  ],
})

// ナビゲーションガード
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = localStorage.getItem('user')

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
