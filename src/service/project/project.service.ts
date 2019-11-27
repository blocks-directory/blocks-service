import { URL } from 'url'
import { DataMapper } from '@aws/dynamodb-data-mapper'
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Project } from '../../entity/project'
import { getRepositoryService } from '../repository/repository.service'
import { getPlatformService } from '../platform/platform.service'
import { ProjectPreview } from '../../handler/get-project-preview'
import { getElasticSearchClient } from '../elasticsearch.service'

export class ProjectService {
  private mapper = new DataMapper({
    client: new DynamoDB(),
  })

  async save(project: Project) {
    const updatedProject = await this.mapper.put(project)

    const elasticSearchClient = await getElasticSearchClient()

    await elasticSearchClient.index({
      index: `${process.env.stage}-projects-index`,
      id: project.id,
      body: {
        name: project.name,
        description: project.description,
        platform: project.platform,
      },
    })

    return updatedProject
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
}

export const projectService = new ProjectService()
