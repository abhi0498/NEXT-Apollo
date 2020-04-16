import { ApolloServer } from 'apollo-server-micro'
import { schema } from '../../apollo/schema'
import { db } from '../../apollo/database/db'

db.authenticate()
  .then(() => {
    console.log('connected to db');
  })

const apolloServer = new ApolloServer({
  schema,
  context(ctx) {
    return ctx
  },
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default apolloServer.createHandler({ path: '/api/graphql' })
