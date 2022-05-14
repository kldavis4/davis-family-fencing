import fs from 'fs'

const pathToDb = '.next/db.json'

export interface Db {
  pages: {
    cursor: string,
    limit: number,
    sort: string
  }[]
}


export const readDb = async (): Promise<Db> => {
  try {
    const buf = await fs.promises.readFile(pathToDb)
    return JSON.parse(buf.toString('utf-8'))
  } catch (err) {
    return { pages: [] }
  }
}

export const writeDb = async (db: Db): Promise<void> => {
  await fs.promises.writeFile(pathToDb, JSON.stringify(db))
}