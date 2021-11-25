const Fastify = require('fastify')
const mercurius = require('mercurius')
const { Pool } = require('pg')
const mercuriusPostGraphile = require('@autotelic/mercurius-postgraphile')
const emails = require('./data/emails')

const connectionString = 'postgresql://postgres:password@localhost:5432/postgres'
const app = Fastify({ logger: true })

const schema = `  
   extend type User @key(fields: "id") {
      id: ID! @external
      username: String @external
      email: String
  }
`

const resolvers = {
  User: {
    email: (user) => {
      return emails.find(u => u.id === Number.parseInt(user.id)).email
    }
  }
}

const pgPool = new Pool({ connectionString })

app.register(mercurius, {
  schema,
  resolvers,
  federationMetadata: true
})

app.register(mercuriusPostGraphile, {
  connectionString,
  pgPool
})

app.log.info('Postgraphile service started on http://localhost:3002/graphql')
app.listen(3002)
