import {staticRequest} from "tinacms";
import { Playlists } from '../../../components/playlists'
import type {PlaylistConnection} from "../../../.tina/__generated__/types";
import {Db, readDb, writeDb} from '../../../lib/utils'

export default function PlaylistListing (
  props: AsyncReturnType<typeof getStaticProps>["props"]
) {
  const data = props.playlistConnection.edges;

  return (
    <div className="container mx-auto">
        <Playlists
          data={data}
          nextPage={props.nextPage}
          prevPage={props.prevPage}
        />
    </div>
  );
}

export const getStaticProps = async ({ params }) => {
  const db = await readDb()

  const pageNum = Number(params.page)
  if (db.pages.length < pageNum) {
    throw new Error(`Unable to render page ${params.page} - not enough cached pages`)
  }

  const page = db.pages[pageNum - 1]

  const last = page.limit
  const variables = { last, sort: page.sort, before: page.cursor }

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
  })) as { playlistConnection: PlaylistConnection }

  return {
    props: {
      ...tinaProps,
      prevPage: pageNum > 1 ? String(pageNum - 1) : '',
      nextPage: pageNum < db.pages.length ? String(pageNum + 1) : ''
    },
  };
};

export const getStaticPaths = async () => {
  const db: Db = {
    pages: []
  }

  const paths = []
  const last = 10
  let cursor: string | undefined
  let page = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const variables = { last, sort: 'publishedAt' }
    if (cursor) {
      variables['before'] = cursor
    }
    const response = await staticRequest({
      query: `#graphql
      query getPlaylists($sort: String, $last: Float, $before: String) {
        playlistConnection(sort: $sort, last: $last, before: $before) {
          edges {
            node {
              title
              publishedAt
              description
              
            }
          }
          pageInfo {
            hasPreviousPage
            startCursor
          }
        }
      }
      `,
      variables,
    }) as { playlistConnection: PlaylistConnection }

    const { pageInfo } = response.playlistConnection

    paths.push({
      params: {
        page: `${page}`
      }
    })

    db.pages.push({
      cursor,
      limit: variables.last,
      sort: variables.sort
    })

    page += 1

    if (!pageInfo.hasPreviousPage) {
      break
    }
    cursor = pageInfo.startCursor
  }

  await writeDb(db)

  return {
    paths,
    fallback: false,
  };
};

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;