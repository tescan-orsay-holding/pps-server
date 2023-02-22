import { pool } from '../server'
import { User } from '../types/types'

export const getUsersFromDb = async (): Promise<User[]> => {
  const [rows] = await pool.query('SELECT * FROM users')
  return rows
}

export const getUserByIdFromDb = async (id: number): Promise<User> => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
  return rows[0]
}

export const getUserByUsernameFromDb = async (
  username: string
): Promise<User> => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE username = ? LIMIT 1',
    [username]
  )
  return rows[0]
}

export const addUserToDb = async (user: Omit<User, 'id'>) => {
  const { username, password_hash, role } = user

  const [result] = await pool.query(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
    [username, password_hash, role]
  )

  return result
}

export const editUserInDb = async (user: User) => {
  const { id, password_hash, role } = user

  const [result] = await pool.query(
    'UPDATE users SET password_hash=?, role=? WHERE id=?',
    [password_hash, role, id]
  )

  return result
}

export const deleteUsersFromDb = async (ids: number[]) => {
  const [result] = await pool.query('DELETE FROM users WHERE id IN (?)', [ids])

  return result
}
