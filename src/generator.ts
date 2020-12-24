import * as core from '@actions/core'
import * as github from '@actions/github'
import parser from 'fast-xml-parser'
import convert from 'xml-js'

var fs = require('fs').promises

let header1 = 'Type | Missed | Covered | Total'
let header2 = '-----|----|-----|------'

export default async function create(path: string, githubToken: string) {
  const comment = await createCommentOnPR(path)
  await pushCommentOnPR(githubToken, comment)
}

async function createCommentOnPR(path: string): Promise<string> {
  const jacocoXmlResult = await fs.readFile(path, 'utf8')
  var options = {
    ignoreAttributes: false
  }
  let xml = parser.parse(jacocoXmlResult, options)

  //   let xml = JSON.parse(convert.xml2json(jacocoXmlResult))
  let counters = xml.report.counter.map((counter: any) => {
    let missed = parseInt(counter['@_missed'])
    let covered = parseInt(counter['@_covered'])
    return {
      type: counter['@_type'],
      missed: missed,
      covered: covered,
      coverage: Math.round((covered / (covered + missed)) * 1000000) / 10000
    }
  })

  let comment = []

  let body = counters
    .map((counter: any) => {
      if (counter.type === 'LINE') {
        return `**${counter.type}**|**${counter.missed}**|**${counter.covered}**|**${counter.coverage}%**`
      } else {
        return `${counter.type}|${counter.missed}|${counter.covered}|${counter.coverage}%`
      }
    })
    .join('\n')
  comment.push(header1)
  comment.push(header2)
  comment.push(body)

  return comment.join('\n')
}

async function pushCommentOnPR(githubToken: string, comment: string) {
  const {
    sha: commitSha,
    repo: {repo: repoName, owner: repoOwner}
  } = github.context

  let defaultParameter = {
    repo: repoName,
    owner: repoOwner
  }

  const octokit = github.getOctokit(githubToken)

  const {
    data: pullRequests
  } = await octokit.repos.listPullRequestsAssociatedWithCommit({
    ...defaultParameter,
    commit_sha: commitSha
  })
  if (pullRequests.length == 0) {
    core.info(`Unable to find pull request for commit sha: ${commitSha}`)
    return
  }
  let targetPullRequest = pullRequests[0]

  let {data: comments} = await octokit.issues.listComments({
    ...defaultParameter,
    issue_number: targetPullRequest.number
  })
  let targetComment = comments.find(comment => {
    return comment.body?.startsWith(header1)
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
    issue_number: targetPullRequest.number,
    body: comment
  })
}
