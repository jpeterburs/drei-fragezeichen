<script>
export default {
  mounted() {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')

    const codeVerifier = window.localStorage.getItem('code_verifier')

    this.exchangeCodeForToken(code, codeVerifier)
  },
  methods: {
    async exchangeCodeForToken(code, codeVerifier) {
      const response = await fetch(
        'https://accounts.spotify.com/api/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
            grant_type: 'authorization_code',
            code,
            redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
            code_verifier: codeVerifier
          })
        }
      ).then(res => res.json())

      const expirationTime = Date.now() + response.expires_in * 1000

      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('token_expiration', expirationTime)

      this.$router.push('/')
    }
  }
}
</script>