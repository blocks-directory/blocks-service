import * as AWS from 'aws-sdk'

import '../../utils/func-test.env'
import { projectService } from '../../service/project/project.service'
import { ProjectPlatform } from '../../entity/project-platform'

const lambdaClient = new AWS.Lambda({ region: 'us-east-1' })

describe('get project by id', () => {
  jest.setTimeout(40000)

  const project = {
    id: 'github/ArsenyYankovsky/screenshot-service-ts',
    name: 'screenshot-service-ts',
    description: 'screenshot service made with puppeteer and TypeScript',
    platform: ProjectPlatform.SERVERLESS,
    runtime: 'nodejs8.10',
    provider: 'aws',
    repositoryUrl: 'https://github.com/ArsenyYankovsky/screenshot-service-ts',
    openIssues: 0,
    pullRequests: 0,
    lastCommitDate: '2019-11-11T19:09:08Z',
    readmeUrl: 'https://raw.githubusercontent.com/ArsenyYankovsky/screenshot-service-ts/master/README.md',
  }

  beforeAll(async () => {
    await projectService.save(project)
  })

  test('happy path', async () => {
    const response = await lambdaClient.invoke({
      FunctionName: 'dev-blocks-service-get-project-by-id',
      Payload: JSON.stringify({
        id: 'github/ArsenyYankovsky/screenshot-service-ts',
      }),
    }).promise()

    const getProjectResult = JSON.parse(response.Payload!.toString())

    expect(getProjectResult).toEqual(project)
  })

  test('not found should return null', async () => {
    const response = await lambdaClient.invoke({
      FunctionName: 'dev-blocks-service-get-project-by-id',
      Payload: JSON.stringify({
        id: 'github/ArsenyYankovsky/screenshot-service-ts-not-found-test-1575131208',
      }),
    }).promise()

    const searchResults = JSON.parse(response.Payload!.toString())

    expect(searchResults).toEqual(null)
  })

  afterAll(async () => {
    await projectService.delete(project.id)
  })
})
