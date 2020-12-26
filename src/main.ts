import * as core from '@actions/core'
import create from './report'

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('github_token')
    const path: string = core.getInput('path')
    const coveragePath: string = core.getInput('coverage_path')
    const coverallsUrl: string = core.getInput('coveralls_url')
    await create(path, coveragePath, token, coverallsUrl)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
