export type ResponseError = {
  error: {
    type: String
    message: String
  }
}

export type User = {
  id: number
  username: string
  password_hash: string
  role: 'admin' | 'user'
}

export type ACL = {
  id: number
  username: string
  topic: string
  rw: number
}
