import * as AWS from 'aws-sdk'
import { DataMapper } from '@aws/dynamodb-data-mapper'
import * as DynamoDB from 'aws-sdk/clients/dynamodb'

import '../../utils/func-test.env'
import { ProjectToReview } from '../../entity/submitted-project'

const lambdaClient = new AWS.Lambda({ region: 'us-east-1' })
const mapper = new DataMapper({
  client: new DynamoDB({ region: 'us-east-1' }),
})

describe('submit a project', () => {
  test('happy path', async () => {
    const response = await lambdaClient.invoke({
      FunctionName: 'dev-blocks-service-submit-project',
      Payload: JSON.stringify({
        repositoryUrl: 'https://github.com/cloudkeeper-io/cloudkeeper-metrics-service',
      }),
    }).promise()

    const project = JSON.parse(response.Payload!.toString())

    expect(project).toEqual({
      repositoryUrl: 'https://github.com/cloudkeeper-io/cloudkeeper-metrics-service',
    })

    const dynamoDbProject = await mapper.get(Object.assign(
      new ProjectToReview(),
      { repositoryUrl: 'https://github.com/cloudkeeper-io/cloudkeeper-metrics-service' },
    ))

    expect(dynamoDbProject).toEqual({
      repositoryUrl: 'https://github.com/cloudkeeper-io/cloudkeeper-metrics-service',
    })
  })

  afterEach(async () => {
    try {
      await mapper.delete(Object.assign(
        new ProjectToReview(),
        { repositoryUrl: 'https://github.com/cloudkeeper-io/cloudkeeper-metrics-service' },
      ))
    } catch (e) {
      console.log('Error cleaning up project ', e)
    }
  })
})
