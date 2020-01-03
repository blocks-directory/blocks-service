import { URL } from 'url'
import { DataMapper } from '@aws/dynamodb-data-mapper'
import { escape as luceneEscapeQuery } from 'lucene-escape-query'
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { map, get } from 'lodash-es'
import { Project } from '../../entity/project'
import { getRepositoryService } from '../repository/repository.service'
import { getPlatformService } from '../platform/platform.service'
import { elasticSearchService } from '../elasticsearch.service'
import { ProjectListData } from '../../entity/project-list-data'
import { ProjectPlatform } from '../../entity/project-platform'

export interface ProjectPreview {
  name: string
  description: string
  platform: ProjectPlatform
  runtime: string
  provider: string
  repositoryUrl: string
  openIssues: number
  pullRequests: number
  lastCommitDate: string
  readmeUrl: string
}

export class ProjectService {
  private static readonly projectsIndex = `${process.env.stage}-projects-index`

  private mapper = new DataMapper({
    client: new DynamoDB(),
  })

  async save(project: Project) {
    const updatedProject = await this.mapper.put(Object.assign(new Project(), project))

    await elasticSearchService.index(
      ProjectService.projectsIndex,
      project.id,
      {
        name: project.name,
        description: project.description,
        platform: project.platform,
        provider: project.provider,
        runtime: project.runtime,
        lastCommitDate: project.lastCommitDate,
        repositoryUrl: project.repositoryUrl,
      },
    )

    return updatedProject
  }

  async saveAll(projects: Project[]) {
    const entities = map(projects, project => Object.assign(new Project(), project))

    const updatedProject = await this.mapper.batchPut(entities)

    for (const project of entities) {
      await elasticSearchService.index(
        ProjectService.projectsIndex,
        project.id,
        {
          name: project.name,
          description: project.description,
          platform: project.platform,
          provider: project.provider,
          runtime: project.runtime,
          lastCommitDate: project.lastCommitDate,
          repositoryUrl: project.repositoryUrl,
        },
      )
    }

    return updatedProject
  }

  async find(query: string, offset: number = 0): Promise<ProjectListData[]> {
    const escapedQuery = luceneEscapeQuery(query)

    const queryString = escapedQuery ? `name:${escapedQuery}* or description:${escapedQuery}*` : undefined

    console.log(queryString)

    return elasticSearchService.search(
      `${process.env.stage}-projects-index`,
      queryString,
      20,
      offset,
      '_score,_id',
    )
  }

  generateId(repositoryUrl: string) {
    const parsedUrl = new URL(repositoryUrl)

    const repositoryService = getRepositoryService(parsedUrl)

    return repositoryService.generateProjectId(parsedUrl)
  }

  async collectProjectData(repositoryUrl: string): Promise<ProjectPreview> {
    const parsedUrl = new URL(repositoryUrl)

    const repositoryService = getRepositoryService(parsedUrl)

    const repositoryProjectData = await repositoryService.getRepositoryProjectData(parsedUrl)

    const platformService = await getPlatformService(repositoryService, parsedUrl)

    const additionalProjectData = await platformService.getProjectInformation(repositoryService, parsedUrl)

    return {
      ...repositoryProjectData,
      ...additionalProjectData,
    }
  }

  async getById(id: string): Promise<Project | null> {
    try {
      return await this.mapper.get(Object.assign(new Project(), {
        id,
      }))
    } catch (error) {
      if (get(error, 'name') === 'ItemNotFoundException') {
        return null
      }

      throw error
    }
  }

  async delete(id: string) {
    await this.mapper.delete(Object.assign(new Project(), { id }))

    await elasticSearchService.delete(ProjectService.projectsIndex, id)
  }

  async deleteAll(ids: string[]) {
    const deleteCriterias = map(ids, id => Object.assign(new Project(), { id }))

    await this.mapper.batchDelete(deleteCriterias)

    for (const id of ids) {
      await elasticSearchService.delete(ProjectService.projectsIndex, id)
    }
  }
}

export const projectService = new ProjectService()
