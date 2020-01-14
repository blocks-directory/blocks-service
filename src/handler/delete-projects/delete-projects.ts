import { projectService } from '../../service/project/project.service'

export const handler = async (ids: string[]) => projectService.deleteAll(ids)
