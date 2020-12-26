import * as core from '@actions/core'
import * as github from '@actions/github'
import {createCommentOnPullRequest, Coverage} from './comment'
import {findPullRequest, pushCommentOnPullRequest} from './pull-request'

export default async function create(
  path: string,
  coveragePath: string,
  githubToken: string
) {
  const pullRequest = await findPullRequest(githubToken)
  const result = await createCommentOnPullRequest(
    path,
    coveragePath,
    pullRequest?.number
  )
  if (pullRequest) {
    await pushCommentOnPullRequest(
      pullRequest.number,
      githubToken,
      result.comment
    )
  } else {
    core.info(`WARNING: Pull request not found, skipping PR comment....`)
  }
  createOutput(result.sourceCoverages, result.targetCoverages)
}

export function createOutput(
  sourceCoverages: Coverage[],
  targetCoverage: Coverage[]
) {
  core.setOutput('report-coverage-status', 'success')
  if (targetCoverage.length == 0) {
    core.info('No previous coverage was found, try running dev workflow again')
    core.setOutput(
      'report-coverage-summary',
      'No previous coverage was found, try running dev workflow again'
    )
    return
  }
  let sourceLineCoverage = sourceCoverages.find((coverage: Coverage) => {
    return coverage.type.toUpperCase() == 'LINE'
  })!
  let targetLineCoverage = targetCoverage.find((coverage: Coverage) => {
    return coverage.type.toUpperCase() == 'LINE'
  })!
  let coverageDecreaseThreshold = parseFloat(
    core.getInput('decrease_threshold')
  )

  let differenceCoverage =
    sourceLineCoverage.coverage - targetLineCoverage.coverage
  let acceptableCoverage =
    sourceLineCoverage.coverage - coverageDecreaseThreshold
  core.info(`Acceptable coverage total: ${acceptableCoverage}`)

  if (sourceLineCoverage.coverage < acceptableCoverage) {
    const summary = `Coverage decreased (${differenceCoverage}%) to ${sourceLineCoverage.coverage}%`
    core.setOutput('report-coverage-summary', summary)
    core.setOutput('report-coverage-status', 'failure')
    core.info(`FAIL: ${summary}`)
  } else {
    const summary = `Coverage increased (+${differenceCoverage}%) to ${sourceLineCoverage.coverage}%`
    core.setOutput('report-coverage-summary', summary)
    core.setOutput('report-coverage-status', 'success')
    core.info(`SUCCESS: ${summary}`)
  }
}
