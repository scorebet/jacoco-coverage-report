import * as core from '@actions/core'
import {createCommentOnPullRequest, Coverage} from './comment'
import {findPullRequest, pushCommentOnPullRequest} from './pull-request'
import fs from 'fs'

export default async function create(
  path: string,
  coveragePath: string,
  githubToken: string
): Promise<void> {
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
  saveOutput(result.sourceCoverages, coveragePath)
}

export function createOutput(
  sourceCoverages: Coverage[],
  targetCoverage: Coverage[]
): boolean {
  core.setOutput('report-coverage-status', 'success')
  if (targetCoverage.length === 0) {
    core.info('No previous coverage was found, try running dev workflow again')
    core.setOutput(
      'report-coverage-summary',
      'No previous coverage was found, try running dev workflow again'
    )
    return true
  }
  const sourceLineCoverage = sourceCoverages.find((coverage: Coverage) => {
    return coverage.type.toUpperCase() === 'LINE'
  })
  const targetLineCoverage = targetCoverage.find((coverage: Coverage) => {
    return coverage.type.toUpperCase() === 'LINE'
  })
  if (!sourceLineCoverage) {
    throw new Error(
      'Source coverage is undefine, did jacoco coverage finished successsfully?'
    )
  }
  if (!targetLineCoverage) {
    throw new Error(
      'Target coverage is undefine, did jacoco coverage finished successsfully?'
    )
  }
  let coverageDecreaseThreshold = parseFloat(
    core.getInput('decrease_threshold')
  )
  if (isNaN(coverageDecreaseThreshold)) {
    coverageDecreaseThreshold = 0.0
  }

  const differenceCoverage =
    sourceLineCoverage.coverage - targetLineCoverage.coverage
  const acceptableCoverage =
    targetLineCoverage.coverage - coverageDecreaseThreshold
  core.info(`Acceptable coverage total: ${acceptableCoverage}`)

  if (sourceLineCoverage.coverage < acceptableCoverage) {
    const summary = `Coverage decreased (${differenceCoverage}%) to ${sourceLineCoverage.coverage}%`
    core.setOutput('report-coverage-summary', summary)
    core.setOutput('report-coverage-status', 'failure')
    core.info(`FAIL: ${summary}`)
    return false
  } else {
    let summary = ''
    if (differenceCoverage < 0) {
      summary = `Coverage decreased (${differenceCoverage}%) to ${sourceLineCoverage.coverage}%`
    } else {
      summary = `Coverage increased (+${differenceCoverage}%) to ${sourceLineCoverage.coverage}%`
    }
    core.setOutput('report-coverage-summary', summary)
    core.setOutput('report-coverage-status', 'success')
    core.info(`SUCCESS: ${summary}`)
    return true
  }
}

function saveOutput(sourceCoverages: Coverage[], coveragePath: string): void {
  core.info(`Saving new coverage: ${JSON.stringify(sourceCoverages)}`)
  fs.writeFileSync(coveragePath, JSON.stringify(sourceCoverages))
}
