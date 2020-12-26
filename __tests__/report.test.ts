import {report} from 'process'
import {createOutput} from '../src/report'
import {Coverage} from '../src/comment'

test('Verify output success', async () => {
  let sourceCoverage: Coverage[] = [
    {
      type: 'LINE',
      missed: 5,
      covered: 10,
      coverage: 55.0
    }
  ]
  let targetCoverage: Coverage[] = [
    {
      type: 'LINE',
      missed: 5,
      covered: 10,
      coverage: 50.0
    }
  ]
  let result = createOutput(sourceCoverage, targetCoverage)
  expect(result).toEqual(true)
})

test('Verify output success when equal', async () => {
  let sourceCoverage: Coverage[] = [
    {
      type: 'LINE',
      missed: 5,
      covered: 10,
      coverage: 50.0
    }
  ]
  let targetCoverage: Coverage[] = [
    {
      type: 'LINE',
      missed: 5,
      covered: 10,
      coverage: 50.0
    }
  ]
  let result = createOutput(sourceCoverage, targetCoverage)
  expect(result).toEqual(true)
})

test('Verify output failure', async () => {
  let sourceCoverage: Coverage[] = [
    {
      type: 'LINE',
      missed: 5,
      covered: 10,
      coverage: 45.0
    }
  ]
  let targetCoverage: Coverage[] = [
    {
      type: 'LINE',
      missed: 5,
      covered: 10,
      coverage: 50.0
    }
  ]
  let result = createOutput(sourceCoverage, targetCoverage)
  expect(result).toEqual(false)
})
