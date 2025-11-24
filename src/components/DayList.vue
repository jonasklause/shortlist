<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTodoStore } from '../stores/todoStore'
import TodoItem from './TodoItem.vue'

const props = defineProps<{
  date: string
  editingTodoId: string | null
  showDone: boolean
}>()

const emit = defineEmits<{
  setEditingTodo: [todoId: string | null]
  requestMoveToDay: [todoId: string, direction: 'up' | 'down']
}>()

const store = useTodoStore()
const newTodoText = ref('')

const dayList = computed(() => store.getDayList(props.date))

const filteredTodos = computed(() => {
  if (props.showDone) {
    return dayList.value.todos
  }
  // Hide completed todos
  return dayList.value.todos.filter(todo => !todo.completed)
})

const formattedDate = computed(() => {
  const date = new Date(props.date + 'T00:00:00')
  const weekday = date.toLocaleDateString('de-DE', { weekday: 'long' })
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  return `${weekday}, ${day}.${month}.${year}`
})

const isPastDay = computed(() => {
  const today = new Date().toISOString().split('T')[0]!
  return props.date < today
})

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (newTodoText.value.trim()) {
      store.createTodo(props.date, newTodoText.value.trim())
      newTodoText.value = ''
    }
  }
}

const handleMoveUp = (todoId: string) => {
  const index = dayList.value.todos.findIndex(t => t.id === todoId)
  if (index > 0) {
    store.moveTodoInDay(props.date, todoId, 'up')
  } else {
    // At top of list, try to move to previous day
    emit('requestMoveToDay', todoId, 'up')
  }
}

const handleMoveDown = (todoId: string) => {
  const index = dayList.value.todos.findIndex(t => t.id === todoId)
  if (index < dayList.value.todos.length - 1) {
    store.moveTodoInDay(props.date, todoId, 'down')
  } else {
    // At bottom of list, try to move to next day
    emit('requestMoveToDay', todoId, 'down')
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'move'
}

const handleDrop = (e: DragEvent, dropIndex: number) => {
  e.preventDefault()
  const todoId = e.dataTransfer!.getData('todoId')
  const fromDate = e.dataTransfer!.getData('fromDate')

  if (fromDate === props.date) {
    // Moving within same day - handled by todo item
    return
  }

  store.moveTodoToDay(fromDate, props.date, todoId, dropIndex)
}

const handleDropAtEnd = (e: DragEvent) => {
  e.preventDefault()
  const todoId = e.dataTransfer!.getData('todoId')
  const fromDate = e.dataTransfer!.getData('fromDate')

  store.moveTodoToDay(fromDate, props.date, todoId, dayList.value.todos.length)
}
</script>

<template>
  <div class="day-list">
    <h2 class="day-header">{{ formattedDate }}</h2>

    <div
      class="todos-container"
      @dragover="handleDragOver"
      @drop="handleDropAtEnd"
    >
      <div
        v-for="(todo, index) in filteredTodos"
        :key="todo.id"
        @dragover.stop="handleDragOver"
        @drop.stop="(e) => handleDrop(e, index)"
      >
        <TodoItem
          :todo="todo"
          :date="date"
          :is-editing="editingTodoId === todo.id"
          @update="(updates) => store.updateTodo(date, todo.id, updates)"
          @delete="store.deleteTodo(date, todo.id)"
          @start-edit="emit('setEditingTodo', todo.id)"
          @end-edit="emit('setEditingTodo', null)"
          @move-up="handleMoveUp(todo.id)"
          @move-down="handleMoveDown(todo.id)"
        />
      </div>
    <div v-if="!isPastDay" class="add-todo">
      <input
        v-model="newTodoText"
        type="text"
        placeholder="Type to add a new todo..."
        class="add-todo-input"
        @keydown="handleKeydown"
      />
    </div>
    </div>
  </div>
</template>

<style scoped>
.day-list {
  margin-bottom: 16px;
}

.day-header {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.add-todo {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.add-todo-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.add-todo-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.add-todo-btn {
  width: 30px;
  height: 30px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.add-todo-btn:hover {
  background: #45a049;
}

.todos-container {
  min-height: 40px;
}
</style>
