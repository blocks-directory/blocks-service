import { projectService } from '../../service/project/project.service'
import { ProjectPlatform } from '../../entity/project-platform'

interface CreateProjectRequest {
  name: string
  description: string
  platform: ProjectPlatform
  runtime: string
  provider: string
  repositoryUrl: string
  openIssues: number
  pullRequests: number
  lastCommitDate: string
  writtenIn: string
  readmeUrl: string
}

export const handler = async (projectData: CreateProjectRequest) => projectService.save({
  id: projectService.generateId(projectData.repositoryUrl),
  ...projectData,
})
