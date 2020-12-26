import * as core from '@actions/core'
import * as github from '@actions/github'
import parser from 'fast-xml-parser'
import fs, {promises as fsPromise} from 'fs'

// Comment identifier
export const IDENTIFIER = 'd3f06eff-da11-4bab-9164-8393ac271c50'
// Grid spaces
const columnWidth = 12
const columnValueWidth = 6

export async function createCommentOnPullRequest(
  path: string,
  coveragePath: string,
  pullRequestNumber?: number
): Promise<string> {
  const jacocoXmlResult = await fsPromise.readFile(path, 'utf8')
  let xml = parser.parse(jacocoXmlResult, {
    ignoreAttributes: false
  })
  let sourceCoverages = xml.report.counter
    .map((counter: any) => {
      let missed = parseInt(counter['@_missed'])
      let covered = parseInt(counter['@_covered'])
      return {
        type: counter['@_type'],
        missed: missed,
        covered: covered,
        coverage: Math.round((covered / (covered + missed)) * 1000000) / 10000
      }
    })
    .sort(function (a: any, b: any) {
      return a.type.localeCompare(b.type)
    })
  var targetCoverages: any[] = []
  if (fs.existsSync(coveragePath)) {
    const coverageReportResult = await fsPromise.readFile(coveragePath, 'utf8')
    targetCoverages = JSON.parse(coverageReportResult).sort(function (
      a: any,
      b: any
    ) {
      return a.type.localeCompare(b.type)
    })
  }

  let comment = []
  const headerPullRequestNumber = (pullRequestNumber ?? ' --')
    .toString()
    .padEnd(4, ' ')
  const headerPullRequestTargetBranch = 'dev'

  const header1 = `
\`\`\`diff ${IDENTIFIER}
@@                    Coverage                   @@
===================================================
##              ${headerPullRequestTargetBranch.padEnd(
    columnWidth,
    ' '
  )}${'#'
    .concat(headerPullRequestNumber)
    .padEnd(columnWidth, ' ')}${'+/-'.padEnd(columnWidth - 3, ' ')}##
===================================================
`
  var body1 = createCommentCoverageLine(
    sourceCoverages.find((coverage: any) => {
      return coverage.type.toUpperCase() == 'LINE'
    }),
    targetCoverages.find((coverage: any) => {
      return coverage.type.toUpperCase() == 'LINE'
    })
  )

  const header2 = `
@@                 Coverage Summary              @@
===================================================
##              ${headerPullRequestTargetBranch.padEnd(
    columnWidth,
    ' '
  )}${'#'
    .concat(headerPullRequestNumber)
    .padEnd(columnWidth, ' ')}${'+/-'.padEnd(columnWidth - 3, ' ')}##
===================================================
`
  const body2 = sourceCoverages
    .map((sourceCoverage: any) => {
      return createCommentCoverageLine(
        sourceCoverage,
        targetCoverages.find((coverage: any) => {
          return coverage.type.toUpperCase() == sourceCoverage.type
        })
      )
    })
    .join('\n')

  //  Coverage body
  comment.push(header1)
  comment.push(body1)
  comment.push('\n')
  comment.push('\n')
  // Coverage summary
  comment.push(header2)
  comment.push(body2)
  return comment.join('')
}

function createCommentCoverageLine(source: any, target?: any): string {
  const type = source.type.toUpperCase().padEnd(14, ' ')
  const targetCoverage = (target?.coverage?.toFixed(4) ?? '')
    .toString()
    .substring(0, columnValueWidth)
    .padEnd(columnValueWidth, '0')
    .concat('%')
    .padEnd(columnWidth, ' ')
  const sourceCoverage = (source?.coverage?.toFixed(4) ?? '')
    .toString()
    .substring(0, columnValueWidth)
    .padEnd(columnValueWidth, '0')
    .concat('%')
    .padEnd(columnWidth, ' ')
  const diffCoverage = (source.coverage - target?.coverage)
    .toFixed(4)
    .toString()
    .substring(0, columnValueWidth)
    .padEnd(6, '0')
    .concat('%')
  if (!target) {
    return `# ${type}${'--'.padEnd(columnWidth, ' ')}${sourceCoverage}--`
  } else if (source.coverage === target.coverage) {
    return `# ${type}${targetCoverage}${sourceCoverage}+0.000%`
  } else if (source.coverage > target.coverage) {
    return `+ ${type}${targetCoverage}${sourceCoverage}+${diffCoverage}`
  } else {
    return `- ${type}${targetCoverage}${sourceCoverage}${diffCoverage}`
  }
}
