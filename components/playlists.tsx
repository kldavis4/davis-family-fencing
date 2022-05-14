import Link from "next/link";

export const Playlists = ({ data, nextPage, prevPage }: { data: any[], nextPage?: string, prevPage?: string}) => {
  return (
    <div className="grid">
      <h1 className="font-sans text-3xl justify-center font-bold">Playlists</h1>
      {data.map((playlistData) => {
        const { node: props } = playlistData
        const id = props._sys.filename
        const thumbnail = props.thumbnail_default
        return <div className="flex py-2">
          <img src={thumbnail.url} height={thumbnail.height} width={thumbnail.width} />
          <div className="px-6 font-sans text-2xl grid">
            <Link href={`/playlists/${id}`}><a className="hover:underline">{props.title}</a></Link>
            <span className="text-xs text-gray-700 text-left">{props.publishedAt}</span>
          </div>
        </div>
      })}
      <div className="flex items-stretch text-3xl font-bold justify-center">
        {prevPage && <Link href={`/playlists/pages/${prevPage}`}><a className="hover:underline">Previous Page</a></Link>} {nextPage && prevPage && <div className="px-6"> / </div>} {nextPage && <Link href={`/playlists/pages/${nextPage}`}><a className="hover:underline">Next Page</a></Link>}
      </div>
    </div>
  )
}