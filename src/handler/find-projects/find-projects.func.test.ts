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

  const timestamp = new Date().getTime()

  const projects = [{
    id: `github/ArsenyYankovsky/test-service-${timestamp}`,
    name: `test-service-${timestamp}`,
    description: `test service ${timestamp}`,
    platform: ProjectPlatform.SERVERLESS,
    runtime: 'nodejs8.10',
    provider: 'aws',
    repositoryUrl: 'https://github.com/ArsenyYankovsky/screenshot-service',
    openIssues: 0,
    pullRequests: 0,
    lastCommitDate: '2019-11-11T19:09:08Z',
    readmeUrl: 'https://raw.githubusercontent.com/ArsenyYankovsky/screenshot-service/master/README.md',
  }, {
    id: `github/ArsenyYankovsky/test-service-${timestamp}-2`,
    name: 'test-service-2',
    description: `test service ${timestamp} uniquedescriptionword`,
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

  test('search for timestamp', async () => {
    const response = await lambdaClient.invoke({
      FunctionName: 'dev-blocks-service-find-projects',
      Payload: JSON.stringify({
        query: timestamp.toString(),
      }),
    }).promise()

    const searchResults = JSON.parse(response.Payload!.toString())

    expect(searchResults).toEqual([
      {
        id: `github/ArsenyYankovsky/test-service-${timestamp}`,
        name: `test-service-${timestamp}`,
        description: `test service ${timestamp}`,
        platform: ProjectPlatform.SERVERLESS,
        runtime: 'nodejs8.10',
        provider: 'aws',
        lastCommitDate: '2019-11-11T19:09:08Z',
      }, {
        id: `github/ArsenyYankovsky/test-service-${timestamp}-2`,
        name: 'test-service-2',
        description: `test service ${timestamp} uniquedescriptionword`,
        platform: ProjectPlatform.SERVERLESS,
        runtime: 'nodejs8.10',
        provider: 'aws',
        lastCommitDate: '2019-11-11T19:09:08Z',
      },
    ])
  })

  test('search for word in a description', async () => {
    const response = await lambdaClient.invoke({
      FunctionName: 'dev-blocks-service-find-projects',
      Payload: JSON.stringify({
        query: 'uniquedescriptionword',
      }),
    }).promise()

    const searchResults = JSON.parse(response.Payload!.toString())

    expect(searchResults).toEqual([
      {
        id: `github/ArsenyYankovsky/test-service-${timestamp}-2`,
        name: 'test-service-2',
        description: `test service ${timestamp} uniquedescriptionword`,
        platform: ProjectPlatform.SERVERLESS,
        runtime: 'nodejs8.10',
        provider: 'aws',
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
