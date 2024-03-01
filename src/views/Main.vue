<template>
  <div>
    <button @click="authorizeWithSpotify">Connect with Spotify</button>

    <div v-if="allAlbums.length > 0 && !loading">
      <button @click="getRandomEpisode">Random Episode!</button>
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
import { generateCodeVerifierAndChallenge } from '@/utils'

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
    async authorizeWithSpotify() {
      const { codeVerifier, codeChallenge } = await generateCodeVerifierAndChallenge()

      window.localStorage.setItem('code_verifier', codeVerifier)

      const authUrl = new URL('https://accounts.spotify.com/authorize')
      const params = {
        response_type: 'code',
        client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
      }

      authUrl.search = new URLSearchParams(params).toString()
      window.location.href = authUrl.toString()
    },
    async fetchAllAlbums() {
      try {
        this.loading = true

        if (!window.localStorage.getItem('acces_token')) return

        const spotify_api_endpoint = 'https://api.spotify.com/v1/artists/3meJIgRw7YleJrmbpbJK6S/albums?include_groups=album&limit=50'
        const initialResponse = await fetch(
          spotify_api_endpoint,
          {
            headers: {
              Authorization: `Bearer ${window.localStorage.getItem('acces_token')}`
            }
          }
        )
        const initialData = await initialResponse.json()
        const totalAlbums = initialData.total

        if (totalAlbums <= 50) {
          this.allAlbums = initialData.items
        }
        else {
          const numberOfRequests = Math.ceil(totalAlbums / 50)

          const promises = Array.from({ length: numberOfRequests - 1 }, (_, index) => {
            const offset = index + 1

            return fetch(
              `${spotify_api_endpoint}&offset=${offset * 50}`,
              {
                headers: {
                  Authorization: `Bearer ${window.localStorage.getItem('acces_token')}`
                }
              }
            ).then(response => response.json())
          })

          const responses = await Promise.all(promises)

          this.allAlbums = [
            ...initialData.items,
            ...responses.reduce((albums, response) => [...albums, ...response.items], [])
          ]
        }
      }
      catch (error) {
        console.error(error)
      }
      finally {
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