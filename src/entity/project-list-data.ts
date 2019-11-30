import { ProjectPlatform } from './project-platform'

export interface ProjectListData {
  id: string
  name: string
  description: string
  platform: ProjectPlatform
  provider: string
  runtime: string
  lastCommitDate: string
}
