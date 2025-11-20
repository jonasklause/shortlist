import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Todo {
  id: string
  text: string
  url: string
  completed: boolean
  order: number
}

export interface DayList {
  date: string // ISO date string
  todos: Todo[]
}

export const useTodoStore = defineStore('todos', () => {
  const dayLists = ref<DayList[]>([])

  // Load from localStorage on init
  const loadFromStorage = () => {
    const stored = localStorage.getItem('shortlist-data')
    if (stored) {
      try {
        dayLists.value = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to load from localStorage', e)
      }
    }
  }

  // Save to localStorage
  const saveToStorage = () => {
    localStorage.setItem('shortlist-data', JSON.stringify(dayLists.value))
  }

  // Get or create day list
  const getDayList = (date: string): DayList => {
    let dayList = dayLists.value.find(dl => dl.date === date)
    if (!dayList) {
      dayList = { date, todos: [] }
      dayLists.value.push(dayList)
      // Sort by date
      dayLists.value.sort((a, b) => a.date.localeCompare(b.date))
      saveToStorage()
    }
    return dayList
  }

  // Create todo
  const createTodo = (date: string, text: string) => {
    const dayList = getDayList(date)
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      url: '',
      completed: false,
      order: dayList.todos.length
    }
    dayList.todos.push(newTodo)
    saveToStorage()
    return newTodo
  }

  // Update todo
  const updateTodo = (date: string, todoId: string, updates: Partial<Todo>) => {
    const dayList = dayLists.value.find(dl => dl.date === date)
    if (!dayList) return

    const todo = dayList.todos.find(t => t.id === todoId)
    if (todo) {
      Object.assign(todo, updates)
      saveToStorage()
    }
  }

  // Delete todo
  const deleteTodo = (date: string, todoId: string) => {
    const dayList = dayLists.value.find(dl => dl.date === date)
    if (!dayList) return

    const index = dayList.todos.findIndex(t => t.id === todoId)
    if (index !== -1) {
      dayList.todos.splice(index, 1)
      // Reorder
      dayList.todos.forEach((todo, idx) => {
        todo.order = idx
      })
      saveToStorage()
    }
  }

  // Move todo within same day
  const moveTodoInDay = (date: string, todoId: string, direction: 'up' | 'down') => {
    const dayList = dayLists.value.find(dl => dl.date === date)
    if (!dayList) return

    const index = dayList.todos.findIndex(t => t.id === todoId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= dayList.todos.length) return

    // Swap
    const temp = dayList.todos[index]
    dayList.todos[index] = dayList.todos[newIndex]
    dayList.todos[newIndex] = temp

    // Update order
    dayList.todos.forEach((todo, idx) => {
      todo.order = idx
    })
    saveToStorage()
  }

  // Move todo to different day
  const moveTodoToDay = (fromDate: string, toDate: string, todoId: string, toIndex: number) => {
    const fromDayList = dayLists.value.find(dl => dl.date === fromDate)
    if (!fromDayList) return

    const todoIndex = fromDayList.todos.findIndex(t => t.id === todoId)
    if (todoIndex === -1) return

    const todo = fromDayList.todos[todoIndex]
    fromDayList.todos.splice(todoIndex, 1)

    // Reorder source day
    fromDayList.todos.forEach((t, idx) => {
      t.order = idx
    })

    // Add to target day
    const toDayList = getDayList(toDate)
    toDayList.todos.splice(toIndex, 0, todo)

    // Reorder target day
    toDayList.todos.forEach((t, idx) => {
      t.order = idx
    })

    saveToStorage()
  }

  // Copy open todos from previous day
  const copyOpenTodosFrom = (fromDate: string, toDate: string) => {
    const fromDayList = dayLists.value.find(dl => dl.date === fromDate)
    if (!fromDayList) return

    const toDayList = getDayList(toDate)
    const openTodos = fromDayList.todos.filter(t => !t.completed)

    openTodos.forEach(todo => {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text: todo.text,
        url: todo.url,
        completed: false,
        order: toDayList.todos.length
      }
      toDayList.todos.push(newTodo)
    })

    saveToStorage()
  }

  // Get sorted day lists
  const sortedDayLists = computed(() => {
    return [...dayLists.value].sort((a, b) => a.date.localeCompare(b.date))
  })

  // Initialize
  loadFromStorage()

  return {
    dayLists,
    sortedDayLists,
    getDayList,
    createTodo,
    updateTodo,
    deleteTodo,
    moveTodoInDay,
    moveTodoToDay,
    copyOpenTodosFrom
  }
})
