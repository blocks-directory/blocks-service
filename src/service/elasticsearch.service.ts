import { createAWSConnection, awsCredsifyAll, awsGetCredentials } from '@acuris/aws-es-connection'
import { Client } from '@elastic/elasticsearch'
import { memoize } from 'lodash-es'

export const getElasticSearchClient = memoize(async () => {
  const awsCredentials = await awsGetCredentials()
  const AWSConnection = createAWSConnection(awsCredentials)
  return awsCredsifyAll(
    new Client({
      node: process.env.elasticSearchEndpoint,
      Connection: AWSConnection,
    }),
  )
})
