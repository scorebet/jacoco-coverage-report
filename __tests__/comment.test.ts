import {createCommentOnPullRequest} from '../src/comment'

test('Create comment verification with positive coverage', async () => {
  let result = await createCommentOnPullRequest(
    './fixtures/jacocoTestReport.xml',
    './fixtures/coverage-report-positive.cov',
    2857
  )

  const expectedComment = `
\`\`\`diff d3f06eff-da11-4bab-9164-8393ac271c50
@@                    Coverage                   @@
===================================================
##              dev         #2857       +/-      ##
===================================================
+ LINE          95.123%     97.614%     +2.4907%


@@                 Coverage Summary              @@
===================================================
##              dev         #2857       +/-      ##
===================================================
+ BRANCH        54.123%     78.593%     +24.469%
+ CLASS         43.123%     96.817%     +53.694%
+ COMPLEXITY    45.123%     77.729%     +32.605%
+ INSTRUCTION   90.123%     94.914%     +4.7914%
+ LINE          95.123%     97.614%     +2.4907%
+ METHOD        35.123%     93.833%     +58.710%`

  expect(result.comment).toEqual(expectedComment)
  expect(result.targetCoverages).toContainEqual({
    type: 'LINE',
    missed: 123,
    covered: 123123,
    coverage: 95.1234
  })
})

test('Create comment verification with negative coverage', async () => {
  let result = await createCommentOnPullRequest(
    './fixtures/jacocoTestReport.xml',
    './fixtures/coverage-report-negative.cov',
    2857
  )

  const expectedComment = `
\`\`\`diff d3f06eff-da11-4bab-9164-8393ac271c50
@@                    Coverage                   @@
===================================================
##              dev         #2857       +/-      ##
===================================================
- LINE          98.123%     97.614%     -0.509%


@@                 Coverage Summary              @@
===================================================
##              dev         #2857       +/-      ##
===================================================
- BRANCH        98.123%     78.593%     -19.53%
- CLASS         98.123%     96.817%     -1.306%
- COMPLEXITY    98.123%     77.729%     -20.39%
- INSTRUCTION   98.123%     94.914%     -3.208%
- LINE          98.123%     97.614%     -0.509%
- METHOD        98.123%     93.833%     -4.289%`

  expect(result.comment).toEqual(expectedComment)
  expect(result.targetCoverages).toContainEqual({
    type: 'LINE',
    missed: 123,
    covered: 123123,
    coverage: 98.1234
  })
})

test('Create comment verification with equal coverage', async () => {
  let result = await createCommentOnPullRequest(
    './fixtures/jacocoTestReport.xml',
    './fixtures/coverage-report-equal.cov',
    2857
  )

  const expectedComment = `
\`\`\`diff d3f06eff-da11-4bab-9164-8393ac271c50
@@                    Coverage                   @@
===================================================
##              dev         #2857       +/-      ##
===================================================
# LINE          97.614%     97.614%     +0.000%


@@                 Coverage Summary              @@
===================================================
##              dev         #2857       +/-      ##
===================================================
# BRANCH        78.593%     78.593%     +0.000%
# CLASS         96.817%     96.817%     +0.000%
# COMPLEXITY    77.729%     77.729%     +0.000%
# INSTRUCTION   94.914%     94.914%     +0.000%
# LINE          97.614%     97.614%     +0.000%
# METHOD        93.833%     93.833%     +0.000%`

  expect(result.comment).toEqual(expectedComment)
  expect(result.targetCoverages).toContainEqual({
    type: 'LINE',
    missed: 123,
    covered: 123123,
    coverage: 97.6141
  })
})

test('Create comment verification with missing coverage', async () => {
  let result = await createCommentOnPullRequest(
    './fixtures/jacocoTestReport.xml',
    './fixtures/coverage-report-missing.cov',
    2857
  )

  const expectedComment = `
\`\`\`diff d3f06eff-da11-4bab-9164-8393ac271c50
@@                    Coverage                   @@
===================================================
##              dev         #2857       +/-      ##
===================================================
# LINE          --          97.614%     --


@@                 Coverage Summary              @@
===================================================
##              dev         #2857       +/-      ##
===================================================
# BRANCH        --          78.593%     --
# CLASS         --          96.817%     --
# COMPLEXITY    --          77.729%     --
# INSTRUCTION   --          94.914%     --
# LINE          --          97.614%     --
# METHOD        --          93.833%     --`

  expect(result.comment).toEqual(expectedComment)
  expect(result.targetCoverages.length).toEqual(0)
})

test('Create comment verification with single-digit coverage', async () => {
  let result = await createCommentOnPullRequest(
    './fixtures/jacocoTestReport.xml',
    './fixtures/coverage-report-single-digit.cov',
    2857
  )

  const expectedComment = `
\`\`\`diff d3f06eff-da11-4bab-9164-8393ac271c50
@@                    Coverage                   @@
===================================================
##              dev         #2857       +/-      ##
===================================================
+ LINE          9.1234%     97.614%     +88.490%


@@                 Coverage Summary              @@
===================================================
##              dev         #2857       +/-      ##
===================================================
+ BRANCH        5.1234%     78.593%     +73.469%
+ CLASS         3.1234%     96.817%     +93.694%
+ COMPLEXITY    4.1234%     77.729%     +73.605%
+ INSTRUCTION   9.1234%     94.914%     +85.791%
+ LINE          9.1234%     97.614%     +88.490%
+ METHOD        5.1234%     93.833%     +88.710%`

  expect(result.comment).toEqual(expectedComment)
})

test('Create comment verification with null pull request', async () => {
  let result = await createCommentOnPullRequest(
    './fixtures/jacocoTestReport.xml',
    './fixtures/coverage-report-single-digit.cov',
    undefined
  )

  const expectedComment = `
\`\`\`diff d3f06eff-da11-4bab-9164-8393ac271c50
@@                    Coverage                   @@
===================================================
##              dev         # --        +/-      ##
===================================================
+ LINE          9.1234%     97.614%     +88.490%


@@                 Coverage Summary              @@
===================================================
##              dev         # --        +/-      ##
===================================================
+ BRANCH        5.1234%     78.593%     +73.469%
+ CLASS         3.1234%     96.817%     +93.694%
+ COMPLEXITY    4.1234%     77.729%     +73.605%
+ INSTRUCTION   9.1234%     94.914%     +85.791%
+ LINE          9.1234%     97.614%     +88.490%
+ METHOD        5.1234%     93.833%     +88.710%`

  expect(result.comment).toEqual(expectedComment)
})
