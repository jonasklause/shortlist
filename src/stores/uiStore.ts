import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // Filter state
  const showDone = ref(true)
  const showPast = ref(true)

  // Load from localStorage on init
  const loadFromStorage = () => {
    const stored = localStorage.getItem('shortlist-ui-prefs')
    if (stored) {
      try {
        const prefs = JSON.parse(stored)
        showDone.value = prefs.showDone ?? true
        showPast.value = prefs.showPast ?? true
      } catch (e) {
        console.error('Failed to load UI preferences from localStorage', e)
      }
    }
  }

  // Save to localStorage
  const saveToStorage = () => {
    localStorage.setItem('shortlist-ui-prefs', JSON.stringify({
      showDone: showDone.value,
      showPast: showPast.value
    }))
  }

  // Toggle functions
  const toggleShowDone = () => {
    showDone.value = !showDone.value
    saveToStorage()
  }

  const toggleShowPast = () => {
    showPast.value = !showPast.value
    saveToStorage()
  }

  // Initialize
  loadFromStorage()

  return {
    showDone,
    showPast,
    toggleShowDone,
    toggleShowPast
  }
})
