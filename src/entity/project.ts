import { attribute, hashKey, table } from '@aws/dynamodb-data-mapper-annotations'

import { ProjectPlatform } from './project-platform'

@table(`${process.env.stage}-blocks-service-projects`)
export class Project {
  @hashKey()
  id: string

  @attribute()
  name: string

  @attribute()
  description?: string | null

  @attribute()
  platform: ProjectPlatform

  @attribute()
  runtime?: string | null

  @attribute()
  provider?: string | null

  @attribute()
  repositoryUrl: string

  @attribute()
  openIssues?: number | null

  @attribute()
  pullRequests?: number | null

  @attribute()
  lastCommitDate: string

  @attribute()
  readmeUrl?: string | null
}
