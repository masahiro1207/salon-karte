import { createRouter, createWebHistory } from 'vue-router'
import CustomerList from '../components/CustomerList.vue'
import HistoryList from '../components/HistoryList.vue'
import HistoryForm from '../components/HistoryForm.vue'
import CustomerForm from '../components/CustomerForm.vue'
import CustomerEditForm from '../components/CustomerEditForm.vue'
import ReservationList from '../components/ReservationList.vue'
import ReservationEditForm from '../components/ReservationEditForm.vue'
import AddMenu from '../components/AddMenu.vue'
import SalesList from '../components/SalesList.vue'
import SaleForm from '../components/SaleForm.vue'
import SaleEditForm from '../components/SaleEditForm.vue'
import AddReservation from '../views/AddReservation.vue'
//追加

const router = createRouter({
  history: createWebHistory('/salon-karte/'),
  routes: [
    {
      path: '/',
      name: 'reservation',
      //変更
      component: ReservationList,
    },
    {
      path: '/addcustomer',
      name: 'AddCustomer',
      component: CustomerForm,
  },
    {
      path: '/customer',
      name: 'home',
      component: CustomerList,
    },
    {
      path: '/history/:id',
      name: 'history',
      component: HistoryList,
    },
    {
      path: '/addhistory/:id',
      name: 'addhistory',
      component: HistoryForm,
    },
    {
      path: '/add',
      name: 'add',
      component: CustomerForm,
    },
    {
      path: '/edit/:id',
      name: 'edit',
      component: CustomerEditForm,
    },
    {
      path: '/edithistory/:id',
      name: 'edithistory',
      component: () => import('../components/HistoryEditForm.vue'),
    },
    {
      path: '/addreservation',
      name: 'AddReservation',
      component: AddReservation
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
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
