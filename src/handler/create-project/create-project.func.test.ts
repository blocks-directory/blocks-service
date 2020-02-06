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

let id

describe('create a project', () => {
  test('happy path', async () => {
    const response = await lambdaClient.invoke({
      FunctionName: 'dev-blocks-service-create-project',
      Payload: JSON.stringify({
        name: 'cloudkeeper-metrics-service',
        description: null,
        platform: 'SERVERLESS',
        runtime: 'nodejs8.10',
        provider: 'aws',
        repositoryUrl: 'https://github.com/cloudkeeper-io/cloudkeeper-metrics-service',
        openIssues: 4,
        pullRequests: 4,
        lastCommitDate: '2019-11-11T19:09:08Z',
        readmeUrl: 'https://raw.githubusercontent.com/cloudkeeper-io/cloudkeeper-metrics-service/master/README.md',
      }),
    }).promise()

    const project = JSON.parse(response.Payload!.toString())

    expect(project).toEqual({
      id: expect.any(String),
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

    id = project.id

    const dynamoDbProject = await mapper.get(Object.assign(
      new Project(),
      { id: project.id },
    ))

    expect(dynamoDbProject).toEqual({
      id: expect.any(String),
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
      id: project.id,
      index: 'dev-projects-index',
    })

    // eslint-disable-next-line no-underscore-dangle
    expect(elasticSearchResponse.body._id).toEqual(project.id)

    // eslint-disable-next-line no-underscore-dangle
    expect(elasticSearchResponse.body._source).toEqual({
      name: 'cloudkeeper-metrics-service',
      description: null,
      platform: 'SERVERLESS',
      runtime: expect.any(String),
      provider: expect.any(String),
      lastCommitDate: expect.any(String),
      repositoryUrl: expect.any(String),
    })
  })

  afterEach(async () => {
    try {
      await mapper.delete(Object.assign(
        new Project(),
        { id },
      ))
    } catch (e) {
      console.log('Error cleaning up project ', e)
    }

    await elasticSearchService.delete('dev-projects-index', id)
  })
})
