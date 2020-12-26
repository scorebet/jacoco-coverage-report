import * as core from '@actions/core'
import * as github from '@actions/github'
import {IDENTIFIER} from './comment'

const {
  sha: commitSha,
  repo: {repo: repoName, owner: repoOwner}
} = github.context

let defaultParameter = {
  repo: repoName,
  owner: repoOwner
}

export async function findPullRequest(githubToken: string) {
  const octokit = github.getOctokit(githubToken)

  const {
    data: pullRequests
  } = await octokit.repos.listPullRequestsAssociatedWithCommit({
    ...defaultParameter,
    commit_sha: commitSha
  })
  if (pullRequests.length == 0) {
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
) {
  const octokit = github.getOctokit(githubToken)

  let {data: comments} = await octokit.issues.listComments({
    ...defaultParameter,
    issue_number: pullRequestNumber
  })
  let targetComment = comments.find(comment => {
    return comment.body?.includes(IDENTIFIER)
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
