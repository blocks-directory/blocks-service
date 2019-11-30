import { projectService } from '../../service/project/project.service'

interface FindProjectsRequest {
  query: string
  offset: number
}

export const handler = async ({ query, offset }: FindProjectsRequest) => (
  projectService.find(query, offset)
)
