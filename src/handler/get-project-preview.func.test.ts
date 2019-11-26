import * as AWS from 'aws-sdk'

const lambdaClient = new AWS.Lambda({ region: 'us-east-1' })

describe('get project preview', () => {
  test('happy path', async () => {
    const response = await lambdaClient.invoke({
      FunctionName: 'dev-blocks-service-get-project-preview',
      Payload: JSON.stringify({
        repositoryUrl: 'https://github.com/cloudkeeper-io/cloudkeeper-metrics-service',
      }),
    }).promise()

    const previewData = JSON.parse(response.Payload!.toString())

    expect(previewData).toEqual({
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
