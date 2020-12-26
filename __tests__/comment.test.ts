import {createCommentOnPullRequest} from '../src/comment'

test('Create comment verification with positive coverage', async () => {
  let result = await createCommentOnPullRequest(
    './fixtures/jacocoTestReport.xml',
    './fixtures/coverage-report-positive.cov',
    'https://coveralls.io',
    2857
  )

  const expectedComment = `
\`\`\`diff d3f06eff-da11-4bab-9164-8393ac271c50
@@                    Coverage                   @@
===================================================
##              dev         #2857       +/-      ##
===================================================
+ LINE          95.123%     99.647%     +4.5242%


@@                 Coverage Summary              @@
===================================================
##              dev         #2857       +/-      ##
===================================================
+ BRANCH        54.123%     89.328%     +35.205%
+ CLASS         43.123%     99.425%     +56.301%
+ COMPLEXITY    45.123%     88.146%     +43.022%
+ INSTRUCTION   90.123%     98.867%     +8.7439%
+ LINE          95.123%     99.647%     +4.5242%
+ METHOD        35.123%     97.714%     +62.590%
\`\`\`

For coveralls report: https://coveralls.io`

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
    'https://coveralls.io',
    2857
  )

  const expectedComment = `
\`\`\`diff d3f06eff-da11-4bab-9164-8393ac271c50
@@                    Coverage                   @@
===================================================
##              dev         #2857       +/-      ##
===================================================
- LINE          99.923%     99.647%     -0.2758%


@@                 Coverage Summary              @@
===================================================
##              dev         #2857       +/-      ##
===================================================
- BRANCH        99.923%     89.328%     -10.594%
- CLASS         99.923%     99.425%     -0.4981%
- COMPLEXITY    99.923%     88.146%     -11.777%
- INSTRUCTION   99.923%     98.867%     -1.0561%
- LINE          99.923%     99.647%     -0.2758%
- METHOD        99.923%     97.714%     -2.2091%
\`\`\`

For coveralls report: https://coveralls.io`

  expect(result.comment).toEqual(expectedComment)
  expect(result.targetCoverages).toContainEqual({
    type: 'LINE',
    missed: 123,
    covered: 123123,
    coverage: 99.9234
  })
})

test('Create comment verification with equal coverage', async () => {
  let result = await createCommentOnPullRequest(
    './fixtures/jacocoTestReport.xml',
    './fixtures/coverage-report-equal.cov',
    'https://coveralls.io',
    2857
  )

  const expectedComment = `
\`\`\`diff d3f06eff-da11-4bab-9164-8393ac271c50
@@                    Coverage                   @@
===================================================
##              dev         #2857       +/-      ##
===================================================
# LINE          99.647%     99.647%     +0.000%


@@                 Coverage Summary              @@
===================================================
##              dev         #2857       +/-      ##
===================================================
# BRANCH        89.328%     89.328%     +0.000%
# CLASS         99.425%     99.425%     +0.000%
# COMPLEXITY    88.146%     88.146%     +0.000%
# INSTRUCTION   98.867%     98.867%     +0.000%
# LINE          99.647%     99.647%     +0.000%
# METHOD        97.714%     97.714%     +0.000%
\`\`\`

For coveralls report: https://coveralls.io`

  expect(result.comment).toEqual(expectedComment)
  expect(result.targetCoverages).toContainEqual({
    type: 'LINE',
    missed: 123,
    covered: 123123,
    coverage: 99.6476
  })
})

test('Create comment verification with missing coverage', async () => {
  let result = await createCommentOnPullRequest(
    './fixtures/jacocoTestReport.xml',
    './fixtures/coverage-report-missing.cov',
    'https://coveralls.io',
    2857
  )

  const expectedComment = `
\`\`\`diff d3f06eff-da11-4bab-9164-8393ac271c50
@@                    Coverage                   @@
===================================================
##              dev         #2857       +/-      ##
===================================================
# LINE          --          99.647%     --


@@                 Coverage Summary              @@
===================================================
##              dev         #2857       +/-      ##
===================================================
# BRANCH        --          89.328%     --
# CLASS         --          99.425%     --
# COMPLEXITY    --          88.146%     --
# INSTRUCTION   --          98.867%     --
# LINE          --          99.647%     --
# METHOD        --          97.714%     --
\`\`\`

For coveralls report: https://coveralls.io`

  expect(result.comment).toEqual(expectedComment)
  expect(result.targetCoverages.length).toEqual(0)
})

test('Create comment verification with single-digit coverage', async () => {
  let result = await createCommentOnPullRequest(
    './fixtures/jacocoTestReport.xml',
    './fixtures/coverage-report-single-digit.cov',
    'https://coveralls.io',
    2857
  )

  const expectedComment = `
\`\`\`diff d3f06eff-da11-4bab-9164-8393ac271c50
@@                    Coverage                   @@
===================================================
##              dev         #2857       +/-      ##
===================================================
+ LINE          9.1234%     99.647%     +90.524%


@@                 Coverage Summary              @@
===================================================
##              dev         #2857       +/-      ##
===================================================
+ BRANCH        5.1234%     89.328%     +84.205%
+ CLASS         3.1234%     99.425%     +96.301%
+ COMPLEXITY    4.1234%     88.146%     +84.022%
+ INSTRUCTION   9.1234%     98.867%     +89.743%
+ LINE          9.1234%     99.647%     +90.524%
+ METHOD        5.1234%     97.714%     +92.590%
\`\`\`

For coveralls report: https://coveralls.io`

  expect(result.comment).toEqual(expectedComment)
})

test('Create comment verification with null pull request', async () => {
  let result = await createCommentOnPullRequest(
    './fixtures/jacocoTestReport.xml',
    './fixtures/coverage-report-single-digit.cov',
    'https://coveralls.io',
    undefined
  )

  const expectedComment = `
\`\`\`diff d3f06eff-da11-4bab-9164-8393ac271c50
@@                    Coverage                   @@
===================================================
##              dev         # --        +/-      ##
===================================================
+ LINE          9.1234%     99.647%     +90.524%


@@                 Coverage Summary              @@
===================================================
##              dev         # --        +/-      ##
===================================================
+ BRANCH        5.1234%     89.328%     +84.205%
+ CLASS         3.1234%     99.425%     +96.301%
+ COMPLEXITY    4.1234%     88.146%     +84.022%
+ INSTRUCTION   9.1234%     98.867%     +89.743%
+ LINE          9.1234%     99.647%     +90.524%
+ METHOD        5.1234%     97.714%     +92.590%
\`\`\`

For coveralls report: https://coveralls.io`

  expect(result.comment).toEqual(expectedComment)
})
