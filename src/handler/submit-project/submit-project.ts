import { DataMapper } from '@aws/dynamodb-data-mapper'
import * as DynamoDB from 'aws-sdk/clients/dynamodb'

import { ProjectToReview } from '../../entity/submitted-project'
import { slackService } from '../../service/slack.service'

interface SubmitProjectReview {
  repositoryUrl: string
}

const mapper = new DataMapper({
  client: new DynamoDB(),
})

export const handler = async ({ repositoryUrl }: SubmitProjectReview) => {
  const project = await mapper.put(Object.assign(new ProjectToReview(), { repositoryUrl }))

  await slackService.sendMessage(`New project to review: ${repositoryUrl}`, process.env.reviewSlackChannel!)

  return project
}
