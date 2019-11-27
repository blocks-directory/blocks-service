import { projectService } from '../service/project/project.service'
import { Project } from '../entity/project'

interface CreateProjectRequest {
  repositoryUrl: string
}

export const handler = async ({ repositoryUrl }: CreateProjectRequest) => {
  const projectData = await projectService.collectProjectData(repositoryUrl)

  return projectService.save(Object.assign(new Project(), {
    id: projectService.generateId(repositoryUrl),
    ...projectData,
  }))
}
