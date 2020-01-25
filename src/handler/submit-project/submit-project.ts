import { DataMapper } from '@aws/dynamodb-data-mapper'
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { ProjectToReview } from '../../entity/submitted-project'

interface SubmitProjectReview {
  repositoryUrl: string
}

const mapper = new DataMapper({
  client: new DynamoDB(),
})

export const handler = async ({ repositoryUrl }: SubmitProjectReview) => (
  mapper.put(Object.assign(new ProjectToReview(), { repositoryUrl }))
)
