const host = (() => {
  if (process.env.STORMMAP_GITHUB_TOKEN && process.env.STORMMAP_GITHUB_USERNAME) {
    return `${process.env.STORMMAP_GITHUB_USERNAME}:${process.env.STORMMAP_GITHUB_TOKEN}@api.github.com`
  } else {
    return "api.github.com"
  }
})()

module.exports = host