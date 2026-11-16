<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import WinnerItem from '@/components/winners/WinnerItem.vue'
import type { User } from '@/types/user'
import { fullName } from '@/utils/user'

const { winners, canDraw } = defineProps<{
  winners: User[]
  canDraw: boolean
}>()

const emit = defineEmits<{
  draw: []
  remove: [id: number]
}>()
</script>

<template>
  <section class="card" aria-label="Winners">
    <div class="card-body d-flex gap-3 align-items-start">
      <div class="winners-field form-control" aria-live="polite">
        <TransitionGroup name="winner">
          <WinnerItem
            v-for="winner in winners"
            :key="winner.id"
            :name="fullName(winner)"
            @remove="emit('remove', winner.id)"
          />
        </TransitionGroup>
        <span class="winners-field__placeholder">Winners</span>
      </div>
      <BaseButton :disabled="!canDraw" @click="emit('draw')">New winner</BaseButton>
    </div>
  </section>
</template>

<style scoped lang="scss">
.winners-field {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  min-height: 2.25rem;
  padding-block: 0.25rem;
  background-color: #fff;

  &__placeholder {
    padding-inline: 0.25rem;
    color: #aaa;
  }
}

.winner-enter-active,
.winner-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.winner-enter-from,
.winner-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
