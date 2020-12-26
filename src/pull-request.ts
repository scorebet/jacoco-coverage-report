import * as core from '@actions/core'
import * as github from '@actions/github'
import {IDENTIFIER} from './comment'

/* eslint-disable @typescript-eslint/no-explicit-any*/
export async function findPullRequest(githubToken: string): Promise<any> {
  /* eslint-enable */
  const octokit = github.getOctokit(githubToken)

  const {
    sha: commitSha,
    repo: {repo: repoName, owner: repoOwner}
  } = github.context

  const defaultParameter = {
    repo: repoName,
    owner: repoOwner
  }

  const {
    data: pullRequests
  } = await octokit.repos.listPullRequestsAssociatedWithCommit({
    ...defaultParameter,
    commit_sha: commitSha
  })
  if (pullRequests.length === 0) {
    core.info(
      `WARNING: Unable to find pull request for commit sha: ${commitSha}`
    )
    return null
  }
  return pullRequests[0]
}

export async function pushCommentOnPullRequest(
  pullRequestNumber: number,
  githubToken: string,
  comment: string
): Promise<void> {
  const octokit = github.getOctokit(githubToken)

  const {
    repo: {repo: repoName, owner: repoOwner}
  } = github.context

  const defaultParameter = {
    repo: repoName,
    owner: repoOwner
  }

  const {data: comments} = await octokit.issues.listComments({
    ...defaultParameter,
    issue_number: pullRequestNumber
  })
  const targetComment = comments.find(c => {
    return c.body?.includes(IDENTIFIER)
  })
  if (targetComment) {
    if (targetComment.body === comment) {
      core.info('Identical comment already exist, skipping...')
      return
    } else {
      core.info('Comment already exist, deleting...')
      await octokit.issues.deleteComment({
        ...defaultParameter,
        comment_id: targetComment.id
      })
      core.info(`Comment successfully deleted for id: ${targetComment.id}`)
    }
  }

  await octokit.issues.createComment({
    ...defaultParameter,
    issue_number: pullRequestNumber,
    body: comment
  })
}
