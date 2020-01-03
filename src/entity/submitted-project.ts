import { hashKey, table } from '@aws/dynamodb-data-mapper-annotations'

@table(`${process.env.stage}-blocks-service-projects-to-review`)
export class ProjectToReview {
  @hashKey()
  repositoryUrl: string
}
