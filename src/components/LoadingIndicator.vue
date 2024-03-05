<template>
  <div class="laoding" v-if="loading">
    <div class="indicator"></div>
  </div>
</template>

<script>
export default {
  props: {
    loading: Boolean
  }
}
</script>

<style scoped>
.laoding {
  display: flex;
  align-items: center;
  justify-content: center;
}

.indicator {
  border: 0.5rem solid var(--spotify-white);
  border-top: 0.5rem solid var(--spotify-green);
  border-radius: 50%;
  width: 5rem;
  height: 5rem;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>