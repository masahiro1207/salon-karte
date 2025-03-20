import { createRouter, createWebHistory } from 'vue-router'
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
  history: createWebHistory('/salon-karte/'),
  routes: [
    {
      path: '/',
      redirect: '/reservations'
    },
    {
      path: '/reservations',
      name: 'reservations',
      component: ReservationList
    },
    {
      path: '/addreservation',
      name: 'addreservation',
      component: AddReservation
    },
    {
      path: '/customer',
      name: 'customer',
      component: CustomerList
    },
    {
      path: '/addcustomer',
      name: 'addcustomer',
      component: AddCustomerView
    },
    {
      path: '/editcustomer/:id',
      name: 'editcustomer',
      component: CustomerEditForm
    },
    {
      path: '/customerhistory/:id',
      name: 'customerhistory',
      component: CustomerHistory
    },
    {
      path: '/edithistory/:id',
      name: 'edithistory',
      component: HistoryEditForm
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
    },
    {
      path: '/editreservation/:id',
      name: 'editreservation',
      component: ReservationEditForm,
    },
    {
      path: '/addmenu',
      name: 'addmenu',
      component: AddMenu,
    },
    {
      path: '/sales',
      name: 'sales',
      component: SalesList,
    },
    {
      path: '/saleform',
      name: 'saleform',
      component: SaleForm,
    },
    {
      path: '/editsale/:id',
      name: 'editsale',
      component: SaleEditForm,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/history/:id',
      name: 'CustomerHistory',
      component: CustomerHistory,
      meta: { requiresAuth: true }
    }
  ],
})

export default router
