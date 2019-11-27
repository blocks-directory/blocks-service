import { ProjectPlatform } from '../entity/project-platform'
import { projectService } from '../service/project/project.service'

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

interface GetPreviewRequest {
  repositoryUrl: string
}

export const handler = async ({ repositoryUrl }: GetPreviewRequest): Promise<ProjectPreview> => (
  projectService.collectProjectData(repositoryUrl)
)
