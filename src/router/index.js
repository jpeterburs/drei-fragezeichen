import { createRouter, createWebHistory } from 'vue-router'
import Callback from '../views/Callback.vue'
import Main from '../views/Main.vue'

const router = createRouter({
  history: createWebHistory('/drei-fragezeichen/'),
  routes: [
    {
      path: '/',
      component: Main
    },
    {
      path: '/callback',
      component: Callback
    }
  ]
})

export default router