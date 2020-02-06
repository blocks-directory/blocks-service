import { URL } from 'url'
import { gitHubService } from './github.service'

export interface RepositoryService {
  getRepositoryProjectData(repositoryUrl: URL): Promise<RepositoryProjectData>
  getFileText(repositoryUrl: URL, path: string): Promise<string>
  generateProjectId(repositoryUrl: URL): string
}

export interface RepositoryProjectData {
  name: string
  description: string
  repositoryUrl: string
  openIssues: number
  pullRequests: number
  lastCommitDate: string
  readmeUrl: string
}

const hostnameServiceMap = {
  'github.com': gitHubService,
}

export const getRepositoryService = (repositoryUrl: URL): RepositoryService => {
  const repositoryService = hostnameServiceMap[repositoryUrl.hostname]

  if (!repositoryService) {
    throw new Error('UNSUPPORTED_HOST')
  }

  return repositoryService
}
