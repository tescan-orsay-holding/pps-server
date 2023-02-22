import express, { Request, Response } from 'express'
import { check, validationResult } from 'express-validator'

import { ResponseError, ACL } from '../types/types'

import { getUserByUsernameFromDb } from '../db/users'
import {
  addACLRuleToDb,
  getACLByUsernameAndTopicFromDb,
  getACLRulesFromDb,
  deleteACLRulesFromDb,
  getACLByIdFromDb,
  editACLInDb,
} from '../db/acl'

const router = express.Router()

// @route    GET api/users
// @desc     Get all users
// @access   Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const acl = await getACLRulesFromDb()

    res.json({
      acl,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send('Sever Error')
  }
})

// @route    POST api/acl
// @desc     Create ACL rule for given user
// @access   Public
router.post(
  '/',
  [
    check('username', 'Username with 1 to 50 characters is required').isLength({
      min: 1,
      max: 50,
    }),
    check('topic', 'Topic with 1 to 100 characters is required').isLength({
      min: 1,
      max: 100,
    }),
    check('rw', 'RW must be an integer between 1 and 4').isInt({
      min: 1,
      max: 4,
    }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            type: 'ADD_ACL_VALIDATION_FAILED',
            message: `Adding ACL rule failed on validation. ${errors
              .array()
              .map((err) => err.msg)
              .join('. ')}`,
          },
        } as ResponseError)
      }

      const { username, topic, rw } = req.body

      const user = await getUserByUsernameFromDb(username)

      if (!user) {
        return res.status(400).json({
          error: {
            type: 'USER_NOT_FOUND',
            message: 'User with given username not found',
          },
        } as ResponseError)
      }

      const existingACL = await getACLByUsernameAndTopicFromDb(username, topic)

      if (existingACL) {
        return res.status(400).json({
          error: {
            type: 'ACL_ALREADY_EXISTS',
            message: 'ACL with provided topic already exists',
          },
        } as ResponseError)
      }

      const acl: Omit<ACL, 'id'> = {
        username,
        topic,
        rw,
      }

      await addACLRuleToDb(acl)

      res.json({
        acl,
      })
    } catch (err) {
      console.error(err)
      res.status(500).send('Sever Error')
    }
  }
)

// @route    PUT api/acl
// @desc     Edit ACL
// @access   Public
router.put(
  '/',
  [
    check('id', 'ACL ID is required').isInt(),
    check('topic', 'Topic with 1 to 100 characters is required')
      .isLength({
        min: 1,
        max: 100,
      })
      .optional(),
    check('rw', 'RW must be an integer between 1 and 4')
      .isInt({
        min: 1,
        max: 4,
      })
      .optional(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            type: 'EDIT_ACL_VALIDATION_FAILED',
            message: `Editing ACL rule failed on validation. ${errors
              .array()
              .map((err) => err.msg)
              .join('. ')}`,
          },
        } as ResponseError)
      }

      const { id, topic, rw } = req.body

      const acl = await getACLByIdFromDb(id)

      if (!acl) {
        return res.status(400).json({
          error: {
            type: 'ACL_NOT_FOUND',
            message: `ACL to edit not found.`,
          },
        } as ResponseError)
      }

      if (topic) {
        acl.topic = topic
      }
      if (typeof rw == 'number' || typeof rw == 'string') {
        acl.rw = Number(rw)
      }

      await editACLInDb(acl)

      res.json({
        acl,
      })
    } catch (err) {
      console.error(err)
      res.status(500).send('Sever Error')
    }
  }
)

// @route    DELETE api/acl
// @desc     Delete ACL Rule
// @access   Public
router.delete('/', async (req: Request, res: Response) => {
  try {
    const { username, ids } = req.body

    if (!username) {
      return res.status(400).json({
        error: {
          type: 'USERNAME_NOT_PROVIDED_WHEN_DELETING_ACL',
          message: `Username not provided.`,
        },
      } as ResponseError)
    }

    if (!ids?.length) {
      return res.status(400).json({
        error: {
          type: 'ACL_DELETE_INCORRENT_ID_INPUT',
          message: `Incorrect id input has been provided.`,
        },
      } as ResponseError)
    }

    const user = await getUserByUsernameFromDb(username)

    if (!user) {
      return res.status(400).json({
        error: {
          type: 'USER_NOT_FOUND',
          message: 'User with given username not found',
        },
      } as ResponseError)
    }

    const deleteRes = await deleteACLRulesFromDb(username, ids)

    if (deleteRes.affectedRows <= 0) {
      return res.status(400).json({
        error: {
          type: 'DELETE_FAILED_ACL_WITH_ID_NOT_FOUND',
          message: `No acl with given ID found`,
        },
      } as ResponseError)
    }

    res.json({
      msg: 'ACL(s) has been deleted',
    })
  } catch (err) {
    console.error(err)
    res.status(500).send('Sever Error')
  }
})

export default router
