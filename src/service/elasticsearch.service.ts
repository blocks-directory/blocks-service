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

export class ElasticSearchService {
  async index(index: string, id: string, document: any) {
    const elasticSearchClient = await getElasticSearchClient()

    await elasticSearchClient.index({
      index,
      id,
      body: {
        ...document,
      },
    })
  }

  async delete(index: string, id: string) {
    const elasticSearchClient = await getElasticSearchClient()

    await elasticSearchClient.delete({
      index,
      id,
    })
  }
}

export const elasticSearchService = new ElasticSearchService()
