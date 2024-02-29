<template>
  <div>
    <h1>Button</h1>
    <div v-if="allAlbums.length > 0 && !loading">
      <button @click="getRandomEpisode">Click me!</button>
    </div>

    <div v-if="selectedAlbum">
      <h2>Selected Album</h2>
      <p>Name: {{ selectedAlbum.name }}</p>
      <p>Release Date: {{ selectedAlbum.release_date }}</p>
      <p>Total Tracks: {{ selectedAlbum.total_tracks }}</p>

      <div v-if="selectedAlbum.images && selectedAlbum.images.length > 0">
        <h3>Album Artwork</h3>
        <img v-for="(image, index) in selectedAlbum.images" :key="index" :src="image.url" :alt="`Album Image ${index + 1}`" />
      </div>
    </div>

    <div v-if="loading">Loading...</div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      allAlbums: [],
      selectedAlbum: null,
      loading: false
    }
  },
  mounted() {
    this.fetchAllAlbums()
  },
  methods: {
    async fetchAllAlbums() {
      try {
        this.loading = true

        const initialResponse = await axios.get(
          'https://api.spotify.com/v1/artists/3meJIgRw7YleJrmbpbJK6S/albums?include_groups=album&limit=1',
          {
            headers: {
              Authorization: `Bearer ${process.env.SPOTIFY_API_KEY}`
            }
          }
        )
        const totalAlbums = initialResponse.data.total

        const numberOfRequests = Math.ceil(totalAlbums / 50)
        for (let offset = 0; offset < numberOfRequests; offset++) {
          const response = await axios.get(
            `https://api.spotify.com/v1/artists/3meJIgRw7YleJrmbpbJK6S/albums?include_groups=album&limit=50&offset=${offset * 50}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.SPOTIFY_API_KEY}`
              }
            }
          )

          this.allAlbums = [...this.allAlbums, ...response.data.items]
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async getRandomEpisode() {
      this.loading = true

      this.selectedAlbum = this.allAlbums[Math.floor(Math.random() * this.allAlbums.length)]

      this.loading = false
    }
  }
}
</script>

<style scoped>
</style>