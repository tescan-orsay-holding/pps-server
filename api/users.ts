import express, { Request, Response } from 'express'
import { check, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'

import { ResponseError } from '../types/types'
import {
  getUserByUsernameFromDb,
  getUserByIdFromDb,
  getUsersFromDb,
  addUserToDb,
  deleteUsersFromDb,
  editUserInDb,
} from '../db/users'
import { getUserACLRulesFromDb } from '../db/acl'

import { User, ACL } from '../types/types'
import {
  getUserWithoutPassword,
  getMultipleUsersWithoutPassword,
} from '../utils'

const router = express.Router()

// @route    GET api/users
// @desc     Get all users
// @access   Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await getUsersFromDb()

    res.json({
      users: getMultipleUsersWithoutPassword(users),
    })
  } catch (err) {
    console.error(err)
    res.status(500).send('Sever Error')
  }
})
// @route    GET api/users
// @desc     Get user
// @access   Public
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user: User & { acl?: ACL[] } = await getUserByIdFromDb(
      Number(req.params.id)
    )

    if (!user) {
      return res.status(400).json({
        error: {
          type: 'USER_NOT_FOUND',
          message: 'User with given ID not found',
        },
      } as ResponseError)
    }

    const acl = await getUserACLRulesFromDb(user.username)
    user.acl = acl
    const { password_hash, ...userWithoutPassword } = user

    res.json({
      user: getUserWithoutPassword(user),
    })
  } catch (err) {
    console.error(err)
    res.status(500).send('Sever Error')
  }
})

// @route    POST api/users
// @desc     Add user
// @access   Public
router.post(
  '/',
  [
    check('username', 'Username with 1 to 50 characters is required').isLength({
      min: 1,
      max: 50,
    }),
    check(
      'password',
      'Password with atleast 6 characters is required'
    ).isLength({
      min: 6,
    }),
    check('role', 'Role must be either user or admin').isIn(['user', 'admin']),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            type: 'ADD_USER_VALIDATION_FAILED',
            message: `Adding user failed on validation. ${errors
              .array()
              .map((err) => err.msg)
              .join('. ')}`,
          },
        } as ResponseError)
      }

      const { username, password, role } = req.body

      const match = await getUserByUsernameFromDb(username)

      if (match) {
        return res.status(400).json({
          error: {
            type: 'USER_ALREADY_EXISTS',
            message: `User already exists.`,
          },
        } as ResponseError)
      }

      const user: Omit<User, 'id'> = {
        username,
        password_hash: password,
        role,
      }

      const salt = await bcrypt.genSalt(10)
      user.password_hash = await bcrypt.hash(password, salt)

      await addUserToDb(user)

      res.json({
        user: getUserWithoutPassword(user),
      })
    } catch (err) {
      console.error(err)
      res.status(500).send('Sever Error')
    }
  }
)

// @route    PUT api/users
// @desc     Edit user
// @access   Public
router.put(
  '/',
  [
    check('password', 'Password with atleast 6 characters is required')
      .isLength({
        min: 6,
      })
      .optional(),
    check('role', 'Role must be either user or admin')
      .isIn(['user', 'admin'])
      .optional(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            type: 'EDIT_USER_VALIDATION_FAILED',
            message: `Editing user failed on validation. ${errors
              .array()
              .map((err) => err.msg)
              .join('. ')}`,
          },
        } as ResponseError)
      }

      const { username, password, role } = req.body

      const user = await getUserByUsernameFromDb(username)

      if (!user) {
        return res.status(400).json({
          error: {
            type: 'USER_NOT_FOUND',
            message: `User not found.`,
          },
        } as ResponseError)
      }

      if (password) {
        const salt = await bcrypt.genSalt(10)
        user.password_hash = await bcrypt.hash(password, salt)
      }
      if (role) user.role = role

      await editUserInDb(user)

      res.json({
        user: getUserWithoutPassword(user),
      })
    } catch (err) {
      console.error(err)
      res.status(500).send('Sever Error')
    }
  }
)

// @route    DELETE api/users
// @desc     Delete user
// @access   Public
router.delete('/', async (req: Request, res: Response) => {
  try {
    const { ids } = req.body

    if (!ids || !ids.length) {
      return res.status(400).json({
        error: {
          type: 'USER_DELETE_INCORRENT_ID_INPUT',
          message: `Incorrect id input has been provided.`,
        },
      } as ResponseError)
    }

    const deleteRes = await deleteUsersFromDb(ids)

    if (deleteRes.affectedRows <= 0) {
      return res.status(400).json({
        error: {
          type: 'DELETE_FAILED_USER_WITH_ID_NOT_FOUND',
          message: `No user with given ID found`,
        },
      } as ResponseError)
    }

    res.json({
      msg: 'User(s) has been deleted',
    })
  } catch (err) {
    console.error(err)
    res.status(500).send('Sever Error')
  }
})

export default router
