import { createRouter, createWebHistory } from 'vue-router'
import Callback from '../views/Callback.vue'
import Main from '../views/Main.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'main',
      component: Main
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback
    }
  ]
})

export default router