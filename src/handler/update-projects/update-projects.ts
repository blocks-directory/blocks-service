import { URL } from 'url'

import { getRepositoryService } from '../../service/repository/repository.service'
import { projectService } from '../../service/project/project.service'

export const handler = async () => {
  for await (const project of projectService.findAll()) {
    console.log('Updating project', project.id)
    const parsedUrl = new URL(project.repositoryUrl)

    const repositoryService = getRepositoryService(parsedUrl)

    const repositoryData = await repositoryService.getRepositoryProjectData(parsedUrl)

    project.name = repositoryData.name
    project.description = repositoryData.description
    project.readmeUrl = repositoryData.readmeUrl
    project.openIssues = repositoryData.openIssues
    project.pullRequests = repositoryData.pullRequests
    project.lastCommitDate = repositoryData.lastCommitDate

    await projectService.save(project)
  }
}
