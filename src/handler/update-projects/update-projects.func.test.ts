import * as AWS from 'aws-sdk'

import '../../utils/func-test.env'

const lambdaClient = new AWS.Lambda({ region: 'us-east-1' })

describe('update projects', () => {
  test('happy path', async () => {
    jest.setTimeout(60000)

    const response = await lambdaClient.invoke({
      FunctionName: 'dev-blocks-service-update-projects',
    }).promise()

    const responsePayload = JSON.parse(response.Payload!.toString())
    expect(responsePayload).toBe(null)
  })
})
