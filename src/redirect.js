addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const headers = { 'Access-Control-Allow-Origin': '*' }
  if (request.method === "OPTIONS") return new Response(null, { status: 200, headers });
  const urls = [];
  const followLink = async (url) => {
    const response = await fetch(url, { redirect: "manual", method: "HEAD" })
    let newURL = response.headers.get("Location")
    if (newURL) {
      if (!newURL.includes("://")) newURL = new URL(newURL, url).href
      urls.push(newURL)
      await followLink(newURL)
    }
  }
  const { searchParams } = new URL(request.url)
  let url = searchParams.get("url")
  if (!url) return new Response("No URL provided, use query parameter \"url\"", { status: 400, headers })
  if (!url.includes("://")) url = "https://" + url
  try {
    await followLink(url)
    if (urls.length === 0) return new Response(null, { status: 204, headers })
    return new Response(urls.join("\n"), { headers })
  } catch (err) {
    return new Response(err.message, { status: 500, headers })
  }
}