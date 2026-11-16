import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { MAX_WINNERS } from '@/constants'
import type { User } from '@/types/user'
import { pickRandom } from '@/utils/random'

export const useLotteryStore = defineStore('lottery', () => {
  const winners = ref<User[]>([])

  const isFull = computed(() => winners.value.length >= MAX_WINNERS)

  function isWinner(id: number): boolean {
    return winners.value.some((winner) => winner.id === id)
  }

  function candidatesFrom(users: readonly User[]): User[] {
    return users.filter((user) => !isWinner(user.id))
  }

  function canDrawFrom(users: readonly User[]): boolean {
    return !isFull.value && candidatesFrom(users).length > 0
  }

  function draw(users: readonly User[], random: () => number = Math.random): User | null {
    if (!canDrawFrom(users)) return null
    const winner = pickRandom(candidatesFrom(users), random)
    if (winner) winners.value.push(winner)
    return winner
  }

  function removeWinner(id: number): void {
    winners.value = winners.value.filter((winner) => winner.id !== id)
  }

  function syncWinner(user: User): void {
    const index = winners.value.findIndex((winner) => winner.id === user.id)
    if (index !== -1) winners.value.splice(index, 1, user)
  }

  return { winners, isFull, isWinner, canDrawFrom, draw, removeWinner, syncWinner }
})
