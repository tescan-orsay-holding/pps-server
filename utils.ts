type CustomUser = {
  password_hash: string
  [key: string]: any
}

export const getMultipleUsersWithoutPassword = (
  users: CustomUser[]
): Omit<CustomUser, 'password_hash'>[] => {
  return users.map((user) => getUserWithoutPassword(user))
}

export const getUserWithoutPassword = (
  user: CustomUser
): Omit<CustomUser, 'password_hash'> => {
  const { password_hash, ...userWithoutPassword } = user
  return userWithoutPassword
}
