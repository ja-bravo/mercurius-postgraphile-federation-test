const Fastify = require('fastify')
const mercurius = require('mercurius')

const app = Fastify({ logger: true })

app.register(mercurius, {
  gateway: {
    services: [
      {
        name: 'user',
        url: 'http://localhost:3001/graphql'
      },
      {
        name: 'dogs',
        url: 'http://localhost:3002/graphql'
      }
    ]
  }
}
)

app.log.info('Gateway service started on http://localhost:3000/graphql')
app.listen(3000)
