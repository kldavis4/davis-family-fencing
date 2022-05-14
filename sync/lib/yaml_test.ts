import fs from 'fs'
import yaml from 'js-yaml'
import {Specific, unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import remarkStringify from 'remark-stringify'
// import {toMarkdown} from 'mdast-util-to-markdown'
import {Parent} from 'unist'

// const content = fs.readFileSync('../content/playlists/hello-world.md', 'utf8')
// // console.log(content)
//
// const parser = unified()
//   .use(remarkParse)
//   .use(remarkStringify)
//   .use(remarkFrontmatter, ['yaml'])
//
// const myResult = parser.parse(content);
//
// // console.log(JSON.stringify(myResult, null, 2))
//
// // console.log(Object.keys(myResult.children[0]))
// const frontmatter = myResult.children[0]['value']
//
// const parsedFrontmatter = yaml.load(frontmatter)
// // console.log(parsedFrontmatter)
//
// const updatedYaml: string = yaml.dump(parsedFrontmatter)
// // console.log(updatedYaml)
//
// const newTree = {
//   type: 'root',
//   children: myResult.children.filter(node => node.type !== 'yaml')
// }
//
// const result = parser.stringify(newTree)
// console.log({ result })


// TODO strip out the yaml node and write that to a string to get the content

export const parseMarkdown = (content: string): { frontmatter: string, markdown: string } => {
  const parser = unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remarkFrontmatter, ['yaml'])

  const tree: Parent = parser.parse(content)
  const filteredTree: any = {
    ...tree,
    children: tree.children.filter((node: any) => (node.type !== 'yaml'))
  }
  // console.log(filteredTree.children.filter(item => item.type !== 'yaml'))
  const frontmatter: string = tree.children.find(node => node.type === 'yaml')['value']
  const markdown = parser.stringify(filteredTree)
  return {
    frontmatter, markdown: markdown as any
  }
}

export const stringify = (content:{ frontmatter: string, markdown: string }) => {
  return `---\n${content.frontmatter}\n---\n${content.markdown}`
}

// console.log(stringify(parseMarkdown(content)))

// fs.writeFileSync('content/playlists/hello-world-2.md', stringify(parseMarkdown(content)), 'utf-8')

const playlists = JSON.parse(fs.readFileSync('../playlist.json', 'utf-8'))
const videos = JSON.parse(fs.readFileSync('../playlist_items.json', 'utf-8'))

// const { frontmatter, markdown } = parseMarkdown(content)

// console.log(yaml.load(frontmatter))

const playlist = playlists.items[0]
const filename = `../content/playlists/${playlist.id}.md`

const { snippet: {
  title,
  description
}} = playlist
const frontmatter = {
  title,
  description,
  videos: videos.items.map((item) => ({
    title: item.snippet.title,
    description: item.snippet.description,
    position: item.snippet.position,
    videoId: item.contentDetails.videoId,
    thumbnail: {
      url: item.snippet.thumbnails.default.url,
      width: item.snippet.thumbnails.default.width,
      height: item.snippet.thumbnails.default.height,
    },
    _template: 'video'
  })).sort((a, b) => (a.position - b.position))
}

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
  const updatedVideos = frontmatter.videos.map(video => {
    const existingVideo = existingVideoMap[video.videoId]
    if (existingVideo) {
      return {
        ...existingVideo,
        ...video
      }
    }
    return video
  })
  frontmatter.videos = updatedVideos
  fs.writeFileSync(filename, stringify({
    frontmatter: yaml.dump({
      ...existingParsedFrontmatter,
      ...frontmatter
    }),
    markdown
  }))
}