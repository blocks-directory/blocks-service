import { createAWSConnection, awsCredsifyAll, awsGetCredentials } from '@acuris/aws-es-connection'
import { Client } from '@elastic/elasticsearch'
import { get, map, memoize } from 'lodash-es'

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

  async search(index: string, query?: string, size: number = 20, offset: number = 0, sort?: string) {
    const elasticSearchClient = await getElasticSearchClient()

    const queryObject: any = {
      index,
      search_type: 'dfs_query_then_fetch',
      from: offset,
      size,
      sort,
    }

    if (query) {
      queryObject.q = query
      queryObject.analyze_wildcard = true
    }

    const searchResult = await elasticSearchClient.search(queryObject)

    const hits = get(searchResult, 'body.hits.hits')

    return map(hits, hit => ({
      // eslint-disable-next-line no-underscore-dangle
      id: hit._id,
      // eslint-disable-next-line no-underscore-dangle
      ...hit._source,
    }))
  }
}

export const elasticSearchService = new ElasticSearchService()
