import * as AWS from 'aws-sdk'
import { times, sortBy, map } from 'lodash-es'

import '../../utils/func-test.env'
import { projectService } from '../../service/project/project.service'
import { ProjectPlatform } from '../../entity/project-platform'
import { delay } from '../../utils/test.utils'

const lambdaClient = new AWS.Lambda({ region: 'us-east-1' })

describe('find projects', () => {
  jest.setTimeout(40000)

  const paginationProjects = times(40, i => ({
    id: `github/ArsenyYankovsky/pagination-test-${i}`,
    name: 'pagination',
    description: 'description for pagination test',
    platform: ProjectPlatform.SERVERLESS,
    runtime: 'nodejs8.10',
    provider: 'aws',
    repositoryUrl: 'https://github.com/ArsenyYankovsky/pagination-test',
    openIssues: 0,
    pullRequests: 0,
    lastCommitDate: '2019-11-11T19:09:08Z',
    readmeUrl: 'https://raw.githubusercontent.com/ArsenyYankovsky/pagination-test/master/README.md',
  }))

  const projects = [{
    id: 'github/ArsenyYankovsky/screenshot-service',
    name: 'screenshot-service',
    description: 'screenshot service made with puppeteer',
    platform: ProjectPlatform.SERVERLESS,
    runtime: 'nodejs8.10',
    provider: 'aws',
    repositoryUrl: 'https://github.com/ArsenyYankovsky/screenshot-service',
    openIssues: 0,
    pullRequests: 0,
    lastCommitDate: '2019-11-11T19:09:08Z',
    readmeUrl: 'https://raw.githubusercontent.com/ArsenyYankovsky/screenshot-service/master/README.md',
  }, {
    id: 'github/ArsenyYankovsky/test-service',
    name: 'test-service',
    description: 'something something says screenshot in the description',
    platform: ProjectPlatform.SERVERLESS,
    runtime: 'nodejs8.10',
    provider: 'aws',
    repositoryUrl: 'https://github.com/ArsenyYankovsky/test-service',
    openIssues: 0,
    pullRequests: 0,
    lastCommitDate: '2019-11-11T19:09:08Z',
    readmeUrl: 'https://raw.githubusercontent.com/ArsenyYankovsky/test-service/master/README.md',
  }, {
    id: 'github/ArsenyYankovsky/anomaly-detector-service',
    name: 'anomaly-detector-service',
    description: 'this is an anomaly detection service',
    platform: ProjectPlatform.SERVERLESS,
    runtime: 'nodejs8.10',
    provider: 'aws',
    repositoryUrl: 'https://github.com/ArsenyYankovsky/anomaly-detector-service',
    openIssues: 0,
    pullRequests: 0,
    lastCommitDate: '2019-11-11T19:09:08Z',
    readmeUrl: 'https://raw.githubusercontent.com/ArsenyYankovsky/anomaly-detector-service/master/README.md',
  }, ...paginationProjects]

  beforeAll(async () => {
    await projectService.saveAll(projects)
  })

  test('search for screenshot', async () => {
    const response = await lambdaClient.invoke({
      FunctionName: 'dev-blocks-service-find-projects',
      Payload: JSON.stringify({
        query: 'screenshot',
      }),
    }).promise()

    const searchResults = JSON.parse(response.Payload!.toString())

    expect(searchResults).toEqual([
      {
        id: 'github/ArsenyYankovsky/screenshot-service',
        name: 'screenshot-service',
        description: 'screenshot service made with puppeteer',
        platform: 'SERVERLESS',
        provider: 'aws',
        runtime: 'nodejs8.10',
        lastCommitDate: '2019-11-11T19:09:08Z',
      },
      {
        id: 'github/ArsenyYankovsky/test-service',
        name: 'test-service',
        description: 'something something says screenshot in the description',
        platform: 'SERVERLESS',
        provider: 'aws',
        runtime: 'nodejs8.10',
        lastCommitDate: '2019-11-11T19:09:08Z',
      },
    ])
  })

  test('search for puppeteer', async () => {
    const response = await lambdaClient.invoke({
      FunctionName: 'dev-blocks-service-find-projects',
      Payload: JSON.stringify({
        query: 'puppeteer',
      }),
    }).promise()

    const searchResults = JSON.parse(response.Payload!.toString())

    expect(searchResults).toEqual([
      {
        id: 'github/ArsenyYankovsky/screenshot-service',
        name: 'screenshot-service',
        description: 'screenshot service made with puppeteer',
        platform: 'SERVERLESS',
        provider: 'aws',
        runtime: 'nodejs8.10',
        lastCommitDate: '2019-11-11T19:09:08Z',
      },
    ])
  })

  test('pagination', async () => {
    const response = await lambdaClient.invoke({
      FunctionName: 'dev-blocks-service-find-projects',
      Payload: JSON.stringify({
        query: 'pagination',
      }),
    }).promise()

    const expectedSearchResults = map(sortBy(paginationProjects, 'id'), item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      platform: item.platform,
      runtime: item.runtime,
      provider: item.provider,
      lastCommitDate: item.lastCommitDate,
    }))

    const searchResults = JSON.parse(response.Payload!.toString())

    await delay(5000)

    expect(searchResults).toEqual(expectedSearchResults.slice(0, 20))

    const secondPageResponse = await lambdaClient.invoke({
      FunctionName: 'dev-blocks-service-find-projects',
      Payload: JSON.stringify({
        query: 'pagination',
        offset: 20,
      }),
    }).promise()

    const secondPageSearchResults = JSON.parse(secondPageResponse.Payload!.toString())

    await delay(5000)

    expect(secondPageSearchResults).toEqual(expectedSearchResults.slice(20, 40))
  })

  afterAll(async () => {
    await projectService.deleteAll(map(projects, 'id'))
  })
})
