import { projectService } from '../../service/project/project.service'
import { Project } from '../../entity/project'

interface GetProjectByIdRequest {
  id: string
}

export const handler = async ({ id }: GetProjectByIdRequest): Promise<Project | null> => (
  projectService.getById(id)
)
