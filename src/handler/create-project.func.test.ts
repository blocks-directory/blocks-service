import * as AWS from 'aws-sdk'

const lambdaClient = new AWS.Lambda({ region: 'us-east-1' })

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
  })
})
