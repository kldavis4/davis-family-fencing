import 'dotenv/config'
import fetch from 'isomorphic-fetch';
import fs from 'fs'
import yaml from 'js-yaml'
import {parseMarkdown, stringify} from './yaml_test.js'

const {
  CLIENT_ID,
  CLIENT_SECRET,
  PORT,
  REFRESH_TOKEN,
  SCOPE
} = process.env

const fetchAccessToken = async () => {
  const payload = JSON.stringify({
    refresh_token: REFRESH_TOKEN,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'refresh_token'
  })

  return fetch(`https://www.googleapis.com/oauth2/v3/token`, {
    body: payload,
    headers: {
      // Check what headers the API needs. A couple of usuals right below
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST'
  })
    .then(async function (response: any) {
      if (response.status >= 400) {
        console.log(await response.json())
        throw new Error("Bad response from server");
      }

      return response.json();
    })
    .then(function (stories: any) {
      return stories.access_token
    });
}


const fetchPlaylists = async (accessToken: string, nextPageToken?: string) => {
  const nextPageParam = nextPageToken ? `&pageToken=${nextPageToken}` : ''
  const response = await fetch(`https://youtube.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&maxResults=25&mine=true${nextPageParam}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  })
    .then(function (response: any) {
      // console.log(response)
      // console.log(response.status)
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      }

      return response.json();
    })
    .then(function (stories: any) {
      return JSON.stringify(stories);
    });
  return JSON.parse(response)
}

const fetchPlaylistItems = async (playlistId: string, accessToken: string, nextPageToken?: string) => {
  const nextPageParam = nextPageToken ? `&pageToken=${nextPageToken}` : ''
  const response = await fetch(`https://youtube.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&part=snippet,contentDetails&maxResults=25&mine=true${nextPageParam}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  })
    .then(async function (response: any) {
      if (response.status >= 400) {
        throw new Error("Bad response from server");
      }

      return response.json();
    })
    .then(function (stories: any) {
      return JSON.stringify(stories)
    });
  return JSON.parse(response)
}

const delay = (ms: number) => {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

(async function () {
  const token = await fetchAccessToken()

  let nextPageToken: string | undefined = undefined
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const {
      nextPageToken: cursor,
      items
    } = await fetchPlaylists(token, nextPageToken)

    for (const item of items) {
      const {
        id: playlistId,
        snippet
      } = item

      if (snippet.description.indexOf('FENCING') === -1) {
        continue
      }

      console.log('playlist',snippet.title, playlistId)
      let nextPlaylistItemsPageToken: string | undefined = undefined

      const videos = []
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const {
          nextPageToken: playlistItemsCursor,
          items: playlistItems
        } = await fetchPlaylistItems(playlistId, token, nextPlaylistItemsPageToken)

        for (const playlistItem of playlistItems) {
          // console.log('video', playlistItem.snippet.title)
          const {
            contentDetails,
            snippet
          } = playlistItem
          // console.log(snippet.title, snippet.thumbnails.standard)
          const video = {
            title: snippet.title,
            description: snippet.description,
            position: snippet.position,
            videoId: contentDetails.videoId,
            publishedAt: snippet.publishedAt,
            thumbnail_default: {
              url: snippet.thumbnails.default.url,
              width: snippet.thumbnails.default.width,
              height: snippet.thumbnails.default.height,
            },
            _template: 'video'
          }
          if (snippet.thumbnails.medium?.url) {
            video['thumbnail_medium'] = {
              url: snippet.thumbnails.medium.url,
              width: snippet.thumbnails.medium.width,
              height: snippet.thumbnails.medium.height,
            }
          }
          if (snippet.thumbnails.high?.url) {
            video['thumbnail_high'] = {
              url: snippet.thumbnails.high.url,
              width: snippet.thumbnails.high.width,
              height: snippet.thumbnails.high.height,
            }
          }
          if (snippet.thumbnails.standard?.url) {
            video['thumbnail_standard'] = {
              url: snippet.thumbnails.standard?.url,
              width: snippet.thumbnails.standard?.width,
              height: snippet.thumbnails.standard?.height,
            }
          }
          if (snippet.thumbnails.maxres?.url) {
            video['thumbnail_maxres'] = {
              url: snippet.thumbnails.maxres?.url,
              width: snippet.thumbnails.maxres?.width,
              height: snippet.thumbnails.maxres?.height,
            }
          }
          videos.push(video)
        }

        if (playlistItemsCursor) {
          nextPlaylistItemsPageToken = playlistItemsCursor
        } else {
          break
        }
      }

      const frontmatter = {
        title: snippet.title,
        description: snippet.description,
        publishedAt: snippet.publishedAt,
        thumbnail_default: {
          url: snippet.thumbnails.default.url,
          width: snippet.thumbnails.default.width,
          height: snippet.thumbnails.default.height,
        }
      }

      if (snippet.thumbnails.medium?.url) {
        frontmatter['thumbnail_medium'] = {
          url: snippet.thumbnails.medium.url,
          width: snippet.thumbnails.medium.width,
          height: snippet.thumbnails.medium.height,
        }
      }
      if (snippet.thumbnails.high?.url) {
        frontmatter['thumbnail_high'] = {
          url: snippet.thumbnails.high.url,
          width: snippet.thumbnails.high.width,
          height: snippet.thumbnails.high.height,
        }
      }
      if (snippet.thumbnails.standard?.url) {
        frontmatter['thumbnail_standard'] = {
          url: snippet.thumbnails.standard?.url,
          width: snippet.thumbnails.standard?.width,
          height: snippet.thumbnails.standard?.height,
        }
      }
      if (snippet.thumbnails.maxres?.url) {
        frontmatter['thumbnail_maxres'] = {
          url: snippet.thumbnails.maxres?.url,
          width: snippet.thumbnails.maxres?.width,
          height: snippet.thumbnails.maxres?.height,
        }
      }
      frontmatter['videos'] = videos.sort((a, b) => (a.position - b.position))

      const filename = `../content/playlists/${playlistId}.md`

      if (!fs.existsSync(filename)) {
        fs.writeFileSync(filename, stringify({ frontmatter: yaml.dump(frontmatter), markdown: ''}))
      } else {
        const content = fs.readFileSync(filename, 'utf-8')
        const { frontmatter: existingFrontmatter, markdown } = parseMarkdown(content)
        const existingParsedFrontmatter = yaml.load(existingFrontmatter) as any
        const existingVideoMap = {}
        for (const video of existingParsedFrontmatter.videos) {
          existingVideoMap[video.videoId] = video
        }
        const updatedVideos = frontmatter['videos'].map(video => {
          const existingVideo = existingVideoMap[video.videoId]
          if (existingVideo) {
            return {
              ...existingVideo,
              ...video
            }
          }
          return video
        })
        frontmatter['videos'] = updatedVideos
        fs.writeFileSync(filename, stringify({
          frontmatter: yaml.dump({
            ...existingParsedFrontmatter,
            ...frontmatter
          }),
          markdown
        }))
      }
    }

    if (cursor) {
      nextPageToken = cursor
    } else {
      break
    }
    await delay(1000)
  }
  //
  // const response = await fetch(`https://youtube.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&maxResults=25&mine=true`, {
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //     Accept: 'application/json'
  //   }
  // })
  //   .then(function(response: any) {
  //     console.log(response)
  //     console.log(response.status)
  //     if (response.status >= 400) {
  //       throw new Error("Bad response from server");
  //     }
  //
  //     return response.json();
  //   })
  //   .then(function(stories: any) {
  //     return JSON.stringify(stories);
  //   });
  //
  // const result = JSON.parse(response)
  // const playlistId = 'PLoyJoSqpw-bwHDzodd3BHGf-8GoeecqdQ'
  // await fetch(`https://youtube.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&part=snippet,contentDetails&maxResults=25&mine=true`, {
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //     Accept: 'application/json'
  //   }
  // })
  //   .then(function(response: any) {
  //     console.log(response)
  //     console.log(response.status)
  //     if (response.status >= 400) {
  //       throw new Error("Bad response from server");
  //     }
  //
  //     return response.json();
  //   })
  //   .then(function(stories: any) {
  //     console.log(JSON.stringify(stories));
  //   });
}());

export {}