<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTodoStore } from './stores/todoStore'
import DayList from './components/DayList.vue'

const store = useTodoStore()
const editingTodoId = ref<string | null>(null)

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

const today = computed(() => formatDate(new Date()))

const getDateOffset = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

const yesterday = computed(() => getDateOffset(-1))
const tomorrow = computed(() => getDateOffset(1))

const createTodayList = () => {
  store.getDayList(today.value)
}

const copyFromYesterday = () => {
  store.copyOpenTodosFrom(yesterday.value, today.value)
}

const createTomorrowList = () => {
  store.getDayList(tomorrow.value)
}

const hasTodayList = computed(() => {
  return store.dayLists.some(dl => dl.date === today.value)
})

const hasYesterdayOpenTodos = computed(() => {
  const yesterdayList = store.dayLists.find(dl => dl.date === yesterday.value)
  return yesterdayList?.todos.some(t => !t.completed) ?? false
})

const handleMoveToDay = (fromDate: string, todoId: string, direction: 'up' | 'down') => {
  const sortedLists = store.sortedDayLists
  const currentIndex = sortedLists.findIndex(dl => dl.date === fromDate)

  // Keep the editing state during move
  const wasEditing = editingTodoId.value === todoId

  if (direction === 'up' && currentIndex > 0) {
    // Move to previous day (end of list)
    const prevDate = sortedLists[currentIndex - 1].date
    const prevList = store.getDayList(prevDate)
    store.moveTodoToDay(fromDate, prevDate, todoId, prevList.todos.length)
  } else if (direction === 'down' && currentIndex < sortedLists.length - 1) {
    // Move to next day (beginning of list)
    const nextDate = sortedLists[currentIndex + 1].date
    store.moveTodoToDay(fromDate, nextDate, todoId, 0)
  }

  // Restore editing state if it was editing
  if (wasEditing) {
    editingTodoId.value = todoId
  }
}
</script>

<template>
    <header class="app-header">
      <h1>Shortlist</h1>
      <div class="header-actions">
        <button
          v-if="!hasTodayList"
          @click="createTodayList"
          class="primary-btn"
        >
          Create Today's List
        </button>
        <button
          v-if="!hasTodayList && hasYesterdayOpenTodos"
          @click="copyFromYesterday"
          class="secondary-btn"
        >
          Copy Open Todos from Yesterday
        </button>
        <button
          @click="createTomorrowList"
          class="secondary-btn"
        >
          Create Tomorrow's List
        </button>
      </div>
    </header>

    <main class="app-main">
      <DayList
        v-for="dayList in store.sortedDayLists"
        :key="dayList.date"
        :date="dayList.date"
        :editing-todo-id="editingTodoId"
        @set-editing-todo="editingTodoId = $event"
        @request-move-to-day="(todoId, direction) => handleMoveToDay(dayList.date, todoId, direction)"
      />

      <div v-if="store.dayLists.length === 0" class="welcome">
        <h2>Welcome to Shortlist!</h2>
        <p>Click "Create Today's List" to get started.</p>
      </div>
    </main>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
  color: #333;
}

#app {
  min-height: 100vh;
}
</style>

<style scoped>

.app-header {
  margin-bottom: 16px;
}

.app-header h1 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.primary-btn,
.secondary-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn {
  background: #4CAF50;
  color: white;
}

.primary-btn:hover {
  background: #45a049;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);
}

.secondary-btn {
  background: #f0f0f0;
  color: #333;
}

.secondary-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.app-main {
  min-height: 100px;
}

.welcome {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.welcome h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #2c3e50;
}

.welcome p {
  margin: 0;
  font-size: 14px;
  color: #666;
}
</style>
