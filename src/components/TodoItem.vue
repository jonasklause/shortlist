<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { Todo } from '../stores/todoStore'

const props = defineProps<{
  todo: Todo
  date: string
  isEditing: boolean
}>()

const emit = defineEmits<{
  update: [updates: Partial<Todo>]
  delete: []
  moveUp: []
  moveDown: []
  startEdit: []
  endEdit: []
}>()

const editText = ref(props.todo.text)
const editUrl = ref(props.todo.url)
const inputRef = ref<HTMLInputElement | null>(null)

watch(() => props.todo, (newTodo) => {
  editText.value = newTodo.text
  editUrl.value = newTodo.url
}, { deep: true })

watch(() => props.isEditing, (editing) => {
  if (editing) {
    editText.value = props.todo.text
    editUrl.value = props.todo.url
  }
})

// Auto-save on input
watch([editText, editUrl], () => {
  if (props.isEditing && editText.value.trim()) {
    emit('update', {
      text: editText.value.trim(),
      url: editUrl.value.trim()
    })
  }
})

const startEdit = () => {
  emit('startEdit')
}

const endEdit = () => {
  emit('endEdit')
}

const handleKeydown = async (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    endEdit()
  } else if (e.key === 'Escape') {
    editText.value = props.todo.text
    editUrl.value = props.todo.url
    endEdit()
  }
}

const handleGlobalKeydown = async (e: KeyboardEvent) => {
  if (props.isEditing && e.altKey && e.key === 'ArrowUp') {
    e.preventDefault()
    emit('moveUp')
    // Keep focus after move
    await nextTick()
    inputRef.value?.focus()
  } else if (props.isEditing && e.altKey && e.key === 'ArrowDown') {
    e.preventDefault()
    emit('moveDown')
    // Keep focus after move
    await nextTick()
    inputRef.value?.focus()
  }
}

const toggleComplete = () => {
  emit('update', { completed: !props.todo.completed })
}

const handleDragStart = (e: DragEvent) => {
  e.dataTransfer!.effectAllowed = 'move'
  e.dataTransfer!.setData('todoId', props.todo.id)
  e.dataTransfer!.setData('fromDate', props.date)
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <div
    class="todo-item"
    :class="{ completed: todo.completed, editing: isEditing }"
    draggable="true"
    @dragstart="handleDragStart"
  >
    <div v-if="!isEditing" class="todo-view">
      <input
        type="checkbox"
        :checked="todo.completed"
        @change="toggleComplete"
        class="todo-checkbox"
      />
      <div class="todo-content" @click="startEdit">
        <span class="todo-text">{{ todo.text }}</span>
        <a
          v-if="todo.url"
          :href="todo.url"
          target="activecollab"
          class="todo-link"
          @click.stop
        >
          🔗
        </a>
      </div>
      <button @click="$emit('delete')" class="delete-btn">×</button>
    </div>

    <div v-else class="todo-edit" @keydown="handleKeydown">
      <input
        ref="inputRef"
        v-model="editText"
        type="text"
        class="edit-input"
        placeholder="Todo text"
        autofocus
      />
      <input
        v-model="editUrl"
        type="text"
        class="edit-url"
        placeholder="URL (optional)"
      />
    </div>
  </div>
</template>

<style scoped>
.todo-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 6px 8px;
  margin-bottom: 4px;
  cursor: move;
  transition: all 0.2s;
}

.todo-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.todo-item.editing {
  cursor: default;
}

.todo-view {
  display: flex;
  align-items: center;
  gap: 8px;
}

.todo-checkbox {
  cursor: pointer;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.todo-content {
  flex: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 20px;
  font-size: 14px;
}

.todo-text {
  flex: 1;
  word-break: break-word;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  opacity: 0.6;
}

.todo-link {
  font-size: 0.75em;
  text-decoration: none;
  opacity: 0.6;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.todo-link:hover {
  opacity: 1;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 18px;
  height: 18px;
  line-height: 1;
  transition: color 0.2s;
  flex-shrink: 0;
}

.delete-btn:hover {
  color: #ff4444;
}

.todo-edit {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.edit-input,
.edit-url {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 13px;
  font-family: inherit;
}

.edit-input:focus,
.edit-url:focus {
  outline: none;
  border-color: #4CAF50;
}
</style>
