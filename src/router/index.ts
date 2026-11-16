import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type RouteLocationRaw,
  type RouteRecordRaw,
  type Router,
  type RouterHistory,
} from 'vue-router'
import { APP_NAME } from '@/constants'
import { useAuthStore } from '@/stores/auth'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'Home' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: 'About author' },
  },
  {
    path: '/users',
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'users',
        component: () => import('@/views/UsersView.vue'),
        meta: { title: 'Users' },
      },
      {
        path: ':id(\\d+)',
        name: 'user-details',
        component: () => import('@/views/UserDetailsView.vue'),
        props: true,
        meta: { title: 'User details' },
        children: [
          {
            path: 'edit',
            name: 'user-edit',
            component: () => import('@/views/UserEditView.vue'),
            props: true,
            meta: { title: 'Edit user' },
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Login', layout: 'auth', guestOnly: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Page not found' },
  },
]

export function resolveAccess(
  to: RouteLocationNormalized,
  isAuthenticated: boolean,
): RouteLocationRaw | true {
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && isAuthenticated) return { name: 'users' }
  return true
}

export function pageTitle(to: RouteLocationNormalized): string {
  return to.meta.title ? `${to.meta.title} · ${APP_NAME}` : APP_NAME
}

export function createAppRouter(
  history: RouterHistory = createWebHistory(import.meta.env.BASE_URL),
): Router {
  const router = createRouter({
    history,
    routes,
    scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
  })

  router.beforeEach((to) => resolveAccess(to, useAuthStore().isAuthenticated))

  router.afterEach((to) => {
    document.title = pageTitle(to)
  })

  return router
}
