import { URL } from 'url'
import * as YAML from 'yaml'
import { RepositoryService } from '../repository/repository.service'
import { PlatformService, ProjectPlatform } from './platform.service'

export class ServerlessService implements PlatformService {
  async getProjectInformation(repositoryService: RepositoryService, repositoryUrl: URL) {
    const serverlessYmlContent = await repositoryService.getFileText(repositoryUrl, 'serverless.yml')

    const parsedServerlessConfig = YAML.parse(serverlessYmlContent)

    return {
      platform: ProjectPlatform.SERVERLESS,
      runtime: parsedServerlessConfig.provider.runtime,
      provider: parsedServerlessConfig.provider.name,
    }
  }

  async supports(repositoryService: RepositoryService, repositoryUrl: URL) {
    try {
      const serverlessYmlContent = await repositoryService.getFileText(repositoryUrl, 'serverless.yml')

      YAML.parse(serverlessYmlContent)
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }
}

export const serverlessService = new ServerlessService()
