'use strict'

const Fastify = require('fastify')
const mercurius = require('mercurius')
const users = require('./data/users')

const app = Fastify({ logger: true })

const schema = `
  extend type Query {
    me: User
    findUserByID(id: Int!): User
  }

 type User @key(fields: "id") {
  id: ID!
  username: String
 }
`

const resolvers = {
  Query: {
    me: async () => {
      return users[0]
    },
    findUserByID: async (_, { id }) => {
      return users.find(u => u.id === id)
    }
  }
}

const loaders = {
  User: {
    __resolveReference: {
      async loader (query, { reply }) {
        return query.map(({ obj }) => users.find((user) => user.id === obj.id))
      },
      opts: {
        cache: true
      }
    }
  }
}

app.register(mercurius, {
  schema,
  resolvers,
  loaders,
  federationMetadata: true
})

app.log.info('Users service started on http://localhost:3001/graphql')
app.listen(3001)
