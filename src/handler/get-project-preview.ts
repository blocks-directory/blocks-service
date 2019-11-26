import { URL } from 'url'
import { getRepositoryService } from '../service/repository/repository.service'
import { getPlatformService, ProjectPlatform } from '../service/platform/platform.service'

export interface Project {
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

interface GetPreviewRequest {
  repositoryUrl: string
}

export const handler = async ({ repositoryUrl }: GetPreviewRequest): Promise<Project> => {
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
