import parser from 'fast-xml-parser'
import fs, {promises as fsPromise} from 'fs'

export interface Coverage {
  type: string
  missed: number
  covered: number
  coverage: number
}

// Comment identifier
export const IDENTIFIER = 'd3f06eff-da11-4bab-9164-8393ac271c50'
// Grid spaces
const columnWidth = 12
const columnValueWidth = 6

export async function createCommentOnPullRequest(
  path: string,
  coveragePath: string,
  coverallsUrl: string,
  pullRequestNumber?: number
): Promise<{
  comment: string
  sourceCoverages: Coverage[]
  targetCoverages: Coverage[]
}> {
  const jacocoXmlResult = await fsPromise.readFile(path, 'utf8')
  const xml = parser.parse(jacocoXmlResult, {
    ignoreAttributes: false
  })
  const sourceCoverages: Coverage[] = xml.report.counter
    /* eslint-disable @typescript-eslint/no-explicit-any*/
    .map((node: any) => {
      /* eslint-enable */
      const missed = parseInt(node['@_missed'])
      const covered = parseInt(node['@_covered'])
      return {
        type: node['@_type'],
        missed,
        covered,
        coverage: Math.round((1 - missed / (covered + missed)) * 1000000) / 10000
      }
    })
    .sort(function (a: Coverage, b: Coverage) {
      return a.type.localeCompare(b.type)
    })
  let targetCoverages: Coverage[] = []
  if (fs.existsSync(coveragePath)) {
    const coverageReportResult = await fsPromise.readFile(coveragePath, 'utf8')
    targetCoverages = JSON.parse(coverageReportResult).sort(function (
      a: Coverage,
      b: Coverage
    ) {
      return a.type.localeCompare(b.type)
    })
  }

  const comment = []
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
  const body1 = createCommentCoverageLine(
    sourceCoverages.find((coverage: Coverage) => {
      return coverage.type.toUpperCase() === 'LINE'
    }),
    targetCoverages.find((coverage: Coverage) => {
      return coverage.type.toUpperCase() === 'LINE'
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
    .map((sourceCoverage: Coverage) => {
      return createCommentCoverageLine(
        sourceCoverage,
        targetCoverages.find((coverage: Coverage) => {
          return coverage.type.toUpperCase() === sourceCoverage.type
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
  comment.push('\n')
  comment.push('```')
  comment.push('\n')
  comment.push('\n')
  comment.push(`For coveralls report: ${coverallsUrl}`)
  return {
    comment: comment.join(''),
    targetCoverages,
    sourceCoverages
  }
}

function createCommentCoverageLine(
  source?: Coverage,
  target?: Coverage
): string {
  if (!source) {
    throw new Error(
      'Source coverage is undefine, did jacoco coverage finished successsfully?'
    )
  }
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
  const diffCoverage = Math.abs(source.coverage - (target?.coverage ?? 0.0))
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
    return `- ${type}${targetCoverage}${sourceCoverage}-${diffCoverage}`
  }
}
