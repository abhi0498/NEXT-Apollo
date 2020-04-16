import { AuthenticationError, UserInputError } from 'apollo-server-micro'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import getConfig from 'next/config'
import bcrypt from 'bcrypt'
import v4 from 'uuid/v4'


const JWT_SECRET = getConfig().serverRuntimeConfig.JWT_SECRET

import Users from '../apollo/database/models/User'

function createUser(data) {
  const salt = bcrypt.genSaltSync()

  return {
    username: data.username,
    password: bcrypt.hashSync(data.password, salt),
  }
}

function validPassword(user, password) {
  console.log(bcrypt.compareSync(password, user.password))
  return bcrypt.compareSync(password, user.password)
}

export const resolvers = {
  Query: {
    async viewer(_parent, _args, context, _info) {
      const { token } = cookie.parse(context.req.headers.cookie ?? '')
      if (token) {
        try {
          const { id, email } = jwt.verify(token, JWT_SECRET)

          return users.find(user => user.id === id && user.email === email)
        } catch {
          throw new AuthenticationError(
            'Authentication token is invalid, please log in'
          )
        }
      }
    },
    async users() {


      return Users.findAll({ raw: true })
        .then(data => {
          return data
        })
    }
  },
  Mutation: {
    async signUp(_parent, args, _context, _info) {
      const user = createUser(args.input)
      //dont know why this is not working with promises
      Users.create(user)
        .then(user => {
          return user.get({ plain: true })
        })
        .catch(err => { console.log(err) })


      return { user }


    },

    async signIn(_parent, args, context, _info) {
      // const user = users.find(user => user.email === args.input.email)
      return Users.findOne({
        where: {
          username: args.input.email,
        },
        order: [['createdAt', 'DESC']],
        raw: true
      }).then(user1 => {
        console.log(user1)
        if (user1 && validPassword(user1, args.input.password)) {
          console.log('authed')
          const token = jwt.sign(
            { username: user1.username, id: user1.id, time: new Date() },
            JWT_SECRET,
            {
              expiresIn: '6h',
            }
          )

          context.res.setHeader(
            'Set-Cookie',
            cookie.serialize('token', token, {
              httpOnly: true,
              maxAge: 6 * 60 * 60,
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            })
          )

          return user1
        }
      })


      throw new UserInputError('Invalid email and password combination')
    },
    async signOut(_parent, _args, context, _info) {
      context.res.setHeader(
        'Set-Cookie',
        cookie.serialize('token', '', {
          httpOnly: true,
          maxAge: -1,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
      )

      return true
    },
  },
}
