import * as core from '@actions/core'
import create from './generator'

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('github_token')
    const path: string = core.getInput('path')
    await create(path, token)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
