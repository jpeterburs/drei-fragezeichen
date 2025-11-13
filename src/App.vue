<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <button id="logout" @click="logout()">Abmelden</button>

  <RouterView />
</template>

<script>
export default {
  mounted() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/drei-fragezeichen/sw.js').then(registration => {
          console.info('Service Worker registered with scope:', registration.scope)
        }).catch(error => {
          console.error('Service Worker registration failed:', error)
        })
      })
    }
  },
  methods: {
    logout() {
      window.localStorage.clear()

      window.location.reload()
    }
  }
}
</script>

<style scoped>
#logout {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #A3A3A3;
  font-size: 1.25rem;
  padding-left: 1rem;
  padding-right: 2rem;
  border: solid #A3A3A3 0.1rem;
  border-radius: 5rem;
  padding: 0.2rem 0.75rem;

  position: absolute;
  right: 1rem;
  top: 1rem;
}

@media (max-width: 600px) {
  #logout {
    font-size: 1rem;
  }
}
</style>