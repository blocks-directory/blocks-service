import { URL } from 'url'
import { RepositoryService } from '../repository/repository.service'
import { serverlessService } from './serverless.service'

export interface PlatformService {
  getProjectInformation(repositoryService: RepositoryService, repositoryUrl: URL): Promise<any>
  supports(repositoryService: RepositoryService, repositoryUrl: URL): Promise<boolean>
}

const platformServices = [serverlessService]

export const getPlatformService = async (repositoryService: RepositoryService, repositoryUrl: URL) => {
  for (const platformService of platformServices) {
    if ((await platformService.supports(repositoryService, repositoryUrl))) {
      return platformService
    }
  }

  throw new Error('UNSUPPORTED_PLATFORM')
}
