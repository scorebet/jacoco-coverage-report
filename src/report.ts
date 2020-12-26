import * as core from '@actions/core'
import * as github from '@actions/github'
import {createCommentOnPullRequest} from './comment'
import {findPullRequest, pushCommentOnPullRequest} from './pull-request'

export default async function create(
  path: string,
  coveragePath: string,
  githubToken: string
) {
  const pullRequest = await findPullRequest(githubToken)
  const comment = await createCommentOnPullRequest(
    path,
    coveragePath,
    pullRequest?.number
  )
  if (pullRequest) {
    await pushCommentOnPullRequest(pullRequest.number, githubToken, comment)
  } else {
    core.info(`WARNING: Pull request not found, skipping PR comment....`)
  }
}
