<template>
  <div id="main">
    <LoadingIndicator :loading="loading" />

    <div v-if="!loading">
      <div v-if="selectedAlbum">
        <img :src="selectedAlbum.images[0].url" />

        <h1 class="truncate">{{ selectedAlbum.name }}</h1>
        <h2>{{ selectedAlbum.total_tracks }} Kaptiel - {{ new Date(selectedAlbum.release_date).toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' }) }}</h2>

        <div class="button-container">
          <button id="play" @click="playSelectedAlbum()">
            <svg width="100px" height="100px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.6582 9.28638C18.098 10.1862 18.8178 10.6361 19.0647 11.2122C19.2803 11.7152 19.2803 12.2847 19.0647 12.7878C18.8178 13.3638 18.098 13.8137 16.6582 14.7136L9.896 18.94C8.29805 19.9387 7.49907 20.4381 6.83973 20.385C6.26501 20.3388 5.73818 20.0469 5.3944 19.584C5 19.053 5 18.1108 5 16.2264V7.77357C5 5.88919 5 4.94701 5.3944 4.41598C5.73818 3.9531 6.26501 3.66111 6.83973 3.6149C7.49907 3.5619 8.29805 4.06126 9.896 5.05998L16.6582 9.28638Z" stroke-width="2" stroke-linejoin="round"/>
            </svg>
          </button>

          <div class="spacer"></div>

          <button id="skip" @click="getRandomEpisode()">
            <svg width="100px" height="100px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.61061 20 7.46589 18.9525 6 17.2916M9 17H6V17.2916M18.2002 4V6.94416M18.2002 6.94416V6.99993L15.2002 7M6 20V17.2916" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="button-container">
          <button id="feeling-lucky" class="btn" @click="feelingLucky()">Auf gut Glück!</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import { generateCodeVerifierAndChallenge } from '@/utils'

export default {
  components: {
    LoadingIndicator
  },
  data() {
    return {
      allAlbums: [],
      selectedAlbum: null,
      loading: false,
      connectedWithSpotify: !!window.localStorage.getItem('access_token')
    }
  },
  mounted() {
    if (!this.connectedWithSpotify) this.conectWithSpotify()
    this.fetchAllAlbums()
  },
  methods: {
    async conectWithSpotify() {
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

        if (!this.connectedWithSpotify) return

        const spotify_api_endpoint = 'https://api.spotify.com/v1/artists/3meJIgRw7YleJrmbpbJK6S/albums?include_groups=album&limit=50'
        const initialResponse = await fetch(
          spotify_api_endpoint,
          {
            headers: {
              Authorization: `Bearer ${window.localStorage.getItem('access_token')}`
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
                  Authorization: `Bearer ${window.localStorage.getItem('access_token')}`
                }
              }
            ).then(response => response.json())
          })

          const responses = await Promise.all(promises)

          this.allAlbums = [
            ...initialData.items,
            ...responses.reduce((albums, response) => [...albums, ...response.items], [])
          ]

          this.getRandomEpisode()
        }
      }
      catch (error) {
        console.error(error)
      }
      finally {
        this.loading = false
      }
    },
    async playSelectedAlbum() {
      window.location.href = this.selectedAlbum.uri
    },
    async getRandomEpisode() {
      this.loading = true

      this.selectedAlbum = this.allAlbums[Math.floor(Math.random() * this.allAlbums.length)]

      this.loading = false
    },
    async feelingLucky() {
      this.loading = true

      this.getRandomEpisode()
      this.playSelectedAlbum()

      this.loading = false
    }
  }
}
</script>

<style scoped>
#main {
  display: flex;
  align-items: center;
  justify-content: center;

  margin-top: 5vh;
}

h1, h2 {
  text-align: center;
}

.button-container {
  display: flex;
  align-items: center;
  justify-content: center;

  margin-top: 1vh;
  margin-bottom: 1vh;
}

.button-container .spacer {
  margin-right: 5rem;
}

#play {
  stroke: var(--primary);
}

#skip {
  stroke: var(--secondary)
}

#play:hover, #skip:hover {
  filter: opacity(75%);
}
</style>