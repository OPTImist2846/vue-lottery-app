<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'

const LAYOUTS = {
  default: defineAsyncComponent(() => import('@/layouts/DefaultLayout.vue')),
  auth: defineAsyncComponent(() => import('@/layouts/AuthLayout.vue')),
}

const route = useRoute()
const layout = computed(() => LAYOUTS[route.meta.layout ?? 'default'])
</script>

<template>
  <component :is="layout">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </component>
</template>
