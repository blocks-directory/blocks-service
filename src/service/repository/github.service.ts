import * as Octokit from '@octokit/rest'
import { URL } from 'url'
import fetch from 'node-fetch'
import * as baseConverter from 'base-converter'

import { RepositoryProjectData, RepositoryService } from './repository.service'

const octokit = new Octokit({
  auth: process.env.githubToken,
})

export class GitHubService implements RepositoryService {
  async countPullRequests(owner: string, repo: string) {
    let pullRequestsCount = 0
    let page = 0
    const pageSize = 100

    while (true) {
      const listPullRequestsResponse = await octokit.pulls.list({
        owner,
        repo,
        per_page: pageSize,
        state: 'open',
        page,
      })

      const currentPageCount = listPullRequestsResponse.data.length
      pullRequestsCount += currentPageCount
      page += 1

      if (currentPageCount < pageSize) {
        return pullRequestsCount
      }
    }
  }

  async getLastCommitDate(owner: string, repo: string) {
    const listResponse = await octokit.repos.listCommits({
      owner,
      repo,
    })

    return listResponse.data[0].commit.committer.date
  }

  async getRepositoryProjectData(repositoryUrl: URL): Promise<RepositoryProjectData> {
    const [_, owner, repo] = repositoryUrl.pathname.split('/')

    const gitHubProjectData = await octokit.repos.get({
      owner,
      repo,
    })

    const readmeResponse = await octokit.repos.getReadme({
      owner,
      repo,
    })

    const pullRequests = await this.countPullRequests(owner, repo)
    const lastCommitDate = await this.getLastCommitDate(owner, repo)

    return {
      name: gitHubProjectData.data.name,
      description: gitHubProjectData.data.description,
      repositoryUrl: repositoryUrl.toString(),
      openIssues: gitHubProjectData.data.open_issues_count,
      pullRequests,
      lastCommitDate,
      readmeUrl: readmeResponse.data.download_url,
    }
  }

  async getFileText(repositoryUrl: URL, path: string) {
    const [_, owner, repo] = repositoryUrl.pathname.split('/')

    const getFileResponse = await octokit.repos.getContents({
      owner,
      repo,
      path,
    })

    // @ts-ignore
    const downloadFileResponse = await fetch(getFileResponse.data.download_url)

    return downloadFileResponse.text()
  }

  generateProjectId(repositoryUrl: URL) {
    const repo = repositoryUrl.pathname.split('/')[2]

    return `${repo}-${baseConverter.decTo62(new Date().getTime())}`
  }
}

export const gitHubService = new GitHubService()
