<template>
  <div id="main">
    <LoadingIndicator :loading="loading" />

    <div v-if="!loading">
      <div v-if="selectedAlbum">
        <img :src="selectedAlbum.images[0].url" />

        <p id="album-name" class="truncate"><a :href="selectedAlbum.external_urls.spotify" target="spotify">{{ selectedAlbum.name }}</a></p>
        <p id="album-metadata">{{ selectedAlbum.total_tracks }} Kapitel &bull; {{ formatReleaseDate() }}</p>

        <div class="actions">
          <button id="play-on-spotify" @click="playSelectedAlbum()">
            <img src="@/assets/Spotify_Icon_RGB_White.svg" />
            AUF SPOTIFY ABSPIELEN
          </button>

          <a id="choose-another" @click="getRandomEpisode()" href="javascript:void(0)">
            Eine andere Episode auswählen
          </a>
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
    this.checkTokenValidity()
    this.fetchAllAlbums()
  },
  methods: {
    async checkTokenValidity() {
      const expirationTime = window.localStorage.getItem('token_expiration')

      if (expirationTime && Date.now() + 5 * 60 * 1000 < expirationTime) {
        return
      }

      await this.conectWithSpotify()
    },
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
    formatReleaseDate() {
      const releaseDate = new Date(this.selectedAlbum.release_date)
      const releaseDatePrecision = this.selectedAlbum.release_date_precision

      let formatOptions = { year: 'numeric' };

      switch (releaseDatePrecision) {
        case 'month':
          formatOptions.month = '2-digit'
          break
        case 'day':
          formatOptions.month = '2-digit'
          formatOptions.day = '2-digit'
          break
        default:
          break
      }

      return releaseDate.toLocaleDateString('de-DE', formatOptions)
    },
    async playSelectedAlbum() {
      try {
        window.location.href = this.selectedAlbum.uri
      }
      catch {
        window.location.href = this.selectedAlbum.external_urls.spotify
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
#main {
  display: flex;
  align-items: center;
  justify-content: center;

  margin-top: 5vh;
}

p {
  text-align: center;
}

#album-name {
  font-size: 2.2rem;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
}

#album-name a {
  text-decoration: none;
  color: var(--spotify-green);
}

#album-metadata {
  font-size: 1.2rem;
  color: var(--spotify-white);
  margin-top: 0;
  margin-bottom: 2.5rem;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

#play-on-spotify {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--spotify-green);
  color: var(--spotify-white);
  font-size: 1.5rem;
  padding-left: 1rem;
  padding-right: 2rem;
  border-radius: 5rem;
}

#play-on-spotify img {
  min-height: 21px;
  height: 2rem;
  margin: 1rem;
}

#choose-another {
  margin-top: 1rem;
  color: #A3A3A3
}
</style>