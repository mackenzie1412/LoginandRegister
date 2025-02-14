import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Admin from '../views/Admin.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { 
    path: '/admin',
    component: Admin,
    meta: { 
      requiresAuth: true,
      requiredRoles: ['admin'] 
    }
  },
  {
    path: '/user-home',
    name: 'UserHome',
    component: () => import('../views/UserHome.vue'),
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('token')
      if (!token) {
        next('/login')
      } else {
        next()
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthRequired = to.meta.requiresAuth
  const requiredRoles = to.meta.requiredRoles
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role') 

  if (requiredRoles && !requiredRoles.includes(role)) {
    next('/login')
    return
  }
  
  if (isAuthRequired && !token) {
    next('/login')
    return
  }
  
  if ((to.path === '/login' || to.path === '/register') && token) {
    next(role === 'admin' ? '/admin' : '/user-home')
    return
  }
  
  next()
})

export default router