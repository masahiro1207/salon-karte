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
import CustomerView from '../views/CustomerView.vue'
import AddCustomerView from '../views/AddCustomerView.vue'
import HistoryEditForm from '../components/HistoryEditForm.vue'
import ReservationListView from '../views/ReservationListView.vue'
import AddReservationView from '../views/AddReservationView.vue'
import EditCustomerView from '../views/EditCustomerView.vue'
import CustomerHistoryView from '../views/CustomerHistoryView.vue'
import LoginView from '../views/LoginView.vue'

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
      component: ReservationListView
    },
    {
      path: '/addreservation',
      name: 'addreservation',
      component: AddReservationView
    },
    {
      path: '/customer',
      name: 'customer',
      component: CustomerView
    },
    {
      path: '/addcustomer',
      name: 'addcustomer',
      component: AddCustomerView
    },
    {
      path: '/editcustomer/:id',
      name: 'editcustomer',
      component: EditCustomerView
    },
    {
      path: '/customerhistory/:id',
      name: 'customerhistory',
      component: CustomerHistoryView
    },
    {
      path: '/edithistory/:id',
      name: 'edithistory',
      component: HistoryEditForm
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryList,
    },
    {
      path: '/addhistory/:id',
      name: 'addhistory',
      component: HistoryForm,
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
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
