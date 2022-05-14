import Markdown from "react-markdown";
import {useState} from 'react'
import Link from 'next/link'

const reUrl = /(\b(https?|ftp|file):\/\/([-A-Z0-9+&@#%?=~_|!:,.;]*)([-A-Z0-9+&@#%?\/=~_|!:,.;]*)[-A-Z0-9+&@#\/%=~_|])/ig
const formatLinks = source => source.replace(reUrl, '*Link to [$3]($1)*')

const Video = (props) => {
  const [embedShowing, setEmbedShowing] = useState(false)
  const { description, thumbnail_default: thumbnail, title, videoId } = props
  return <div className="flex">
    <div className="py-1 px-4 flex-none">
    {!embedShowing && <img src={thumbnail.url} height={thumbnail.height} width={thumbnail.width} onClick={() => { setEmbedShowing(true) }}/>}
    {embedShowing && <iframe width="560" height="315" src={`https://www.youtube.com/embed/${videoId}`} title="YouTube video player"
                             frameBorder="0"
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                             allowFullScreen></iframe>}
    </div>
    <div className="flex-grow">
      <span className="font-bold">{title}</span> <div className="text-xs px-4 py-4"><Link href={`https://www.youtube.com/watch?v=${videoId}`}><a className="hover:underline">Video</a></Link><Markdown>{formatLinks(description)}</Markdown></div>
    </div>
  </div>
}

export default Video