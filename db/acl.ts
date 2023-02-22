import { pool } from '../server'
import { ACL } from '../types/types'

export const getACLRulesFromDb = async (): Promise<ACL[]> => {
  const [rows] = await pool.query('SELECT * FROM acl')
  return rows
}

export const getUserACLRulesFromDb = async (username: string) => {
  const [rows] = await pool.query('SELECT * FROM acl WHERE username = ?', [
    username,
  ])
  return rows
}

export const getACLByIdFromDb = async (id: number): Promise<ACL> => {
  const [rows] = await pool.query('SELECT * FROM acl WHERE id = ?', [id])
  return rows[0]
}

export const getACLByUsernameAndTopicFromDb = async (
  username: string,
  topic: string
): Promise<ACL> => {
  const [rows] = await pool.query(
    'SELECT * FROM acl WHERE username = ? AND topic = ?',
    [username, topic]
  )
  return rows[0]
}

export const addACLRuleToDb = async (acl: Omit<ACL, 'id'>) => {
  const { username, topic, rw } = acl

  const [result] = await pool.query(
    'INSERT INTO acl (username, topic, rw) VALUES (?, ?, ?)',
    [username, topic, rw]
  )

  return result
}

export const editACLInDb = async (acl: ACL) => {
  const { topic, rw, id } = acl

  const [result] = await pool.query('UPDATE acl SET topic=?, rw=? WHERE id=?', [
    topic,
    rw,
    id,
  ])

  return result
}

export const deleteACLRulesFromDb = async (username: string, ids: number[]) => {
  const [result] = await pool.query(
    'DELETE FROM acl WHERE username = ? AND id IN (?)',
    [username, ids]
  )

  return result
}
