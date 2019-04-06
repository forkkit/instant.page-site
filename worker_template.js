addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
  const path = new URL(event.request.url).pathname.substr(1)

  let status = 200
  const headers = {
    'Content-Type': 'text/html; charset=utf-8',
  }
  let content = ''

  if (path in versions.content) {
    headers['Content-Type'] = 'text/javascript'
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Cache-Control'] = 'max-age=' + (60 * 60 * 24 * 30)
    content = versions.content[path]
  }
  else if (path in scripts) {
    headers['Content-Type'] = 'text/javascript'
    headers['Cache-Control'] = 'max-age=60'
    content = scripts[path]
  }
  else if (`page__${pagePath(path)}__content` in pages) {
    headers['Cache-Control'] = 'max-age=5'
    content = generatePage(path)
  }
  else if (path == 'favicon.ico') {
    headers['Content-Type'] = 'image/png'
    content = (await fetch('https://image.noelshack.com/fichiers/2019/04/2/1548173989-favicon.png')).body
  }
  else if (path == 'twitter_summary_image_v2.png') {
    headers['Content-Type'] = 'image/png'
    content = (await fetch('https://image.noelshack.com/fichiers/2019/06/3/1549480323-twitter-summary-image.png')).body
  }
  else {
    status = 404
    content = `404 page not found<br><a href="/">home page</a>`
  }

  event.waitUntil(getGithubStars())

  return new Response(content, {
    status,
    headers,
  })
}

const versions = {}

versions.latest = __VERSIONS_LATEST__

versions.hashes = {}

__VERSIONS_HASHES__

versions.content = {}

__VERSIONS_CONTENT__

const scripts = {}

__SCRIPTS__

const stylesheet = __STYLESHEET__

const pages = {}

__PAGES__

__GENERATE_PAGE__

const config = __CONFIG__

let githubStars
let githubStarsLastFetch = 0

async function getGithubStars() {
  if (+new Date - githubStarsLastFetch < 60 * 60 * 1000) {
    return
  }
  githubStarsLastFetch = +new Date
  const response = await fetch(`https://api.github.com/repos/instantpage/instant.page?${config.githubAuthParam}`, {headers: {'User-Agent': 'instantpage'}})
  const json = await response.json()
  githubStars = json.stargazers_count
}
