import Head from 'next/head'
import Image from 'next/image'
import {ExperimentalGetTinaClient, PlaylistConnection} from "../.tina/__generated__/types";
import {staticRequest} from "tinacms";
import {Playlists} from "../components/playlists";
import Link from "next/link";

const styles = {}

export default function Home(props) {
  const data = props.playlistConnection.edges;

  return (
    <div className={styles.container}>
      <Head>
        <title>Davis Family Fencing Videos</title>
      </Head>

      <main>
        <h1 className="text-center text-2xl">
          Davis Family Fencing Videos
        </h1>

        <div className="text-center max-h-screen">
          <Image src="/fencers.jpg" alt="Jonah & Elisabeth" width={800} height={533} />
          <div className="container">
            <Playlists data={data} />
            <Link href='/playlists/pages/1'><a className="text-2xl hover:underline">More</a></Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export const getStaticProps = async ({ params }) => {
  const variables = { last: 5, sort: 'publishedAt' }

  const tinaProps = (await staticRequest({
    query: `#graphql
      query getPlaylists($sort: String, $last: Float, $before: String) {
        playlistConnection(sort: $sort, last: $last, before: $before) {
          edges {
            node {
              title
              publishedAt
              description
              thumbnail_default {
                url
                height
                width
              }
              _sys {
                filename
              }
            }
          }
        }
      }
    `,
    variables,
  }))

  return {
    props: {
      ...tinaProps
    },
  };
};