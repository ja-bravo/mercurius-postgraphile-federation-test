const fp = require('fastify-plugin')
const { execute, printSchema } = require('graphql')
const { createPostGraphileSchema, withPostGraphileContext } = require('postgraphile')
const { stitchSchemas } = require('@graphql-tools/stitch')
const fs = require('fs')

async function mercuriusPostGraphile (fastify, opts) {
  const { graphql } = fastify

  const {
    connectionString,
    instanceName = 'public',
    localStitchOpts = {},
    pgPool,
    postGraphileContextOpts = {},
    postGraphileSchemaOpts = {},
    postGraphileStitchOpts = {}
  } = opts

  if (!connectionString) {
    throw new Error('Missing connectionString in options')
  }

  if (!pgPool) {
    throw new Error('Missing pgPool in options')
  }

  const postGraphileSchema = await createPostGraphileSchema(
    connectionString,
    instanceName,
    {
      subscriptions: true,
      dynamicJson: true,
      setofFunctionsContainNulls: false,
      ignoreRBAC: false,
      ignoreIndexes: false,
      legacyRelations: 'omit',
      ...postGraphileSchemaOpts
    }
  )

  const getContextOpts = typeof postGraphileContextOpts === 'function' ? postGraphileContextOpts : () => postGraphileContextOpts

  const { jwtSecret, pgDefaultRole } = postGraphileSchemaOpts

  async function postGraphileExecutor ({
    document,
    variables,
    context,
    rootValue,
    operationName
  }) {
    return await withPostGraphileContext({
      pgPool,
      jwtSecret,
      pgDefaultRole,
      ...getContextOpts(context)
    }, async (pgContext) => {
      return await execute(
        postGraphileSchema,
        document,
        rootValue,
        { ...context, ...pgContext },
        variables,
        operationName
      )
    })
  }

  const newSchema = stitchSchemas({
    subschemas: [
      {
        schema: postGraphileSchema,
        executor: postGraphileExecutor,
        ...postGraphileStitchOpts
      },
      {
        schema: graphql.schema,
        ...localStitchOpts
      }
    ],
    typeMergingOptions: {
      validationScopes: {
        DogsOrderBy: {
          validationLevel: 'off'
        },
        UsersOrderBy: { validationLevel: 'off' }
      }
    }
  })
  fs.writeFileSync('./test.gql', printSchema(postGraphileSchema), 'utf-8')
  graphql.replaceSchema(newSchema)
}

module.exports = fp(mercuriusPostGraphile, {
  name: 'mercurius-postgraphile',
  dependencies: ['mercurius']
})
