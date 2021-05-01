import { SnapDB } from 'snap-db'

const db = new SnapDB("my_db")

export const get = async (key) => await db.get(key)
export const put = async (key, value) => await db.put(key, value)