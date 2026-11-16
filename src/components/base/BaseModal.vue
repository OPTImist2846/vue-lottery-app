<script setup lang="ts">
import { nextTick, onBeforeUnmount, useId, useTemplateRef, watch } from 'vue'

const { title = undefined } = defineProps<{
  title?: string
}>()

const open = defineModel<boolean>('open', { required: true })

defineSlots<{
  header?: () => unknown
  default?: () => unknown
  footer?: (props: { close: () => void }) => unknown
}>()

const titleId = useId()
const dialog = useTemplateRef<HTMLDivElement>('dialog')
let previouslyFocused: HTMLElement | null = null

function close(): void {
  open.value = false
}

watch(
  open,
  async (isOpen) => {
    document.body.classList.toggle('modal-open', isOpen)
    if (isOpen) {
      previouslyFocused =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      await nextTick()
      dialog.value?.focus()
    } else {
      previouslyFocused?.focus()
      previouslyFocused = null
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => document.body.classList.remove('modal-open'))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div v-if="open" class="modal-backdrop show"></div>
    </Transition>
    <Transition name="modal">
      <div
        v-if="open"
        ref="dialog"
        class="modal d-block"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @keydown.esc="close"
        @click.self="close"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <slot name="header">
                <h2 :id="titleId" class="modal-title fs-6 fw-bold">{{ title }}</h2>
              </slot>
              <button type="button" class="btn-close" aria-label="Close" @click="close"></button>
            </div>
            <div class="modal-body">
              <slot />
            </div>
            <div v-if="$slots.footer" class="modal-footer">
              <slot name="footer" :close="close" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;

  .modal-dialog {
    transition: transform 0.2s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal-dialog {
    transform: translateY(-1.5rem) scale(0.98);
  }
}
</style>
