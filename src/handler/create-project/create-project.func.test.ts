import * as AWS from 'aws-sdk'
import { DataMapper } from '@aws/dynamodb-data-mapper'
import { NumberValue } from '@aws/dynamodb-auto-marshaller'
import * as DynamoDB from 'aws-sdk/clients/dynamodb'

import '../../utils/func-test.env'
import { Project } from '../../entity/project'
import { elasticSearchService, getElasticSearchClient } from '../../service/elasticsearch.service'


const lambdaClient = new AWS.Lambda({ region: 'us-east-1' })
const mapper = new DataMapper({
  client: new DynamoDB({ region: 'us-east-1' }),
})

describe('create a project', () => {
  test('happy path', async () => {
    const response = await lambdaClient.invoke({
      FunctionName: 'dev-blocks-service-create-project',
      Payload: JSON.stringify({
        repositoryUrl: 'https://github.com/cloudkeeper-io/cloudkeeper-metrics-service',
      }),
    }).promise()

    const project = JSON.parse(response.Payload!.toString())

    expect(project).toEqual({
      id: 'github/cloudkeeper-io/cloudkeeper-metrics-service',
      name: 'cloudkeeper-metrics-service',
      description: null,
      platform: 'SERVERLESS',
      runtime: expect.any(String),
      provider: expect.any(String),
      repositoryUrl: expect.any(String),
      openIssues: expect.any(Number),
      pullRequests: expect.any(Number),
      lastCommitDate: expect.any(String),
      readmeUrl: expect.any(String),
    })

    const dynamoDbProject = await mapper.get(Object.assign(
      new Project(),
      { id: 'github/cloudkeeper-io/cloudkeeper-metrics-service' },
    ))

    expect(dynamoDbProject).toEqual({
      id: 'github/cloudkeeper-io/cloudkeeper-metrics-service',
      name: 'cloudkeeper-metrics-service',
      description: null,
      platform: 'SERVERLESS',
      runtime: expect.any(String),
      provider: expect.any(String),
      repositoryUrl: expect.any(String),
      openIssues: expect.any(NumberValue),
      pullRequests: expect.any(NumberValue),
      lastCommitDate: expect.any(String),
      readmeUrl: expect.any(String),
    })

    const elasticSearchClient = await getElasticSearchClient()

    const elasticSearchResponse = await elasticSearchClient.get({
      id: 'github/cloudkeeper-io/cloudkeeper-metrics-service',
      index: 'dev-projects-index',
    })

    // eslint-disable-next-line no-underscore-dangle
    expect(elasticSearchResponse.body._id).toEqual('github/cloudkeeper-io/cloudkeeper-metrics-service')

    // eslint-disable-next-line no-underscore-dangle
    expect(elasticSearchResponse.body._source).toEqual({
      name: 'cloudkeeper-metrics-service',
      description: null,
      platform: 'SERVERLESS',
      runtime: expect.any(String),
      provider: expect.any(String),
      lastCommitDate: expect.any(String),
    })
  })

  afterEach(async () => {
    try {
      await mapper.delete(Object.assign(
        new Project(),
        { id: 'github/cloudkeeper-io/cloudkeeper-metrics-service' },
      ))
    } catch (e) {
      console.log('Error cleaning up project ', e)
    }

    await elasticSearchService.delete('dev-projects-index', 'github/cloudkeeper-io/cloudkeeper-metrics-service')
  })
})
