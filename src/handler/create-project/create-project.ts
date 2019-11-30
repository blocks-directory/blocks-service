import { projectService } from '../../service/project/project.service'

interface CreateProjectRequest {
  repositoryUrl: string
}

export const handler = async ({ repositoryUrl }: CreateProjectRequest) => {
  const projectData = await projectService.collectProjectData(repositoryUrl)

  return projectService.save({
    id: projectService.generateId(repositoryUrl),
    ...projectData,
  })
}
