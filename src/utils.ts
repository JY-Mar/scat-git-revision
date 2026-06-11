import os from 'os'
import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import { exec } from 'child_process'
import { promisify } from 'util'
import GitRevision from './type'

const execAsync = promisify(exec)
const pkgname = '@scat1995/git-revision'

/**
 * 日志的 chalk 包装
 * @param        {string} text
 * @param        {GitRevision.Consoler.MsgInputType} msgType
 * @return       {string}
 */
export function colorful(text: string, msgType: GitRevision.Consoler.MsgInputType = 'info'): string {
  let color = '#00ffff'
  switch (msgType) {
    case 'success':
      color = '#7fff58'
      break
    case 'warn':
    case 'warning':
      color = '#faad14'
      break
    case 'error':
      color = '#ff4d4f'
      break
    case 'link':
      color = '#1677ff'
      break
    case 'info':
      color = '#00ffff'
      break
    case 'tip':
      color = '#757575'
      break
    case 'emphasize':
      color = '#ff16e0'
      break
    case 'debug':
      color = '#ff5e00'
      break
    default:
      color = '#00ffff'
      break
  }
  return chalk.hex(color)(text)
}

/**
 * 日志包装后的文字
 * @param        {string} text
 * @param        {GitRevision.Consoler.MsgInputType} msgType
 * @return       {string}
 */
export function colorfulWithTitle(text: string, msgType: GitRevision.Consoler.MsgInputType = 'info'): string {
  let icon = ''

  switch (msgType) {
    case 'success':
      icon = '✅'
      break
    case 'warn':
    case 'warning':
      icon = '⚠️'
      break
    case 'error':
      icon = '‼️'
      break
    case 'link':
      icon = '🔗'
      break
    case 'info':
      icon = '🧾'
      break
    case 'tip':
      icon = '🍰'
      break
    case 'emphasize':
      icon = '✨'
      break
    case 'debug':
      icon = '🔧'
      break
    default:
      icon = msgType ? msgType : ' '
      break
  }
  const pkg = colorful(`[${pkgname} ${icon}]`, 'emphasize')
  const outputText = `${pkg} ${text}`
  return colorful(outputText, msgType)
}

function _consolerOut(text: string, msgType: GitRevision.Consoler.MsgType, eol: 'start' | 'end' | 'both' | 'none' = 'start'): void {
  let outputText: string = colorfulWithTitle(text, msgType)
  if (!outputText.startsWith(os.EOL) && eol === 'start') {
    outputText = os.EOL + outputText
  }
  if (outputText.endsWith(os.EOL) && eol !== 'end' && eol !== 'both') {
    outputText = outputText.slice(0, -os.EOL.length)
  }

  console.info(outputText)
}

/**
 * 打印日志
 * @param text 内容
 * @param msgType 类型
 */
export const consoler = Object.fromEntries(
  GitRevision.Consoler.MSG_TYPES.map((msgType) => [msgType, (text: string, eol: 'start' | 'end' | 'both' | 'none' = 'start') => _consolerOut(text, msgType, eol)])
) as GitRevision.Consoler.Instance

/**
 * Removes trailing empty lines and whitespace from a given string.
 * @param string The input string.
 * @returns A new string with trailing empty lines and whitespace removed.
 */
export function removeEmptyLines(string: string): string {
  return string.replace(/[\s\r\n]+$/, '')
}

/**
 * Executes a git command on a given git work tree.
 * @param gitWorkTree The path to the git work tree.
 * @param command The git command to execute.
 * @returns The standard output of the git command.
 */
export async function runGitCommand(gitWorkTree: string | undefined, command: string): Promise<string> {
  try {
    const gitBaseCommand = gitWorkTree ? `git --git-dir=${path.join(gitWorkTree, '.git')} --work-tree=${gitWorkTree}` : 'git'
    const { stdout } = await execAsync(`${gitBaseCommand} ${command}`)
    return removeEmptyLines(stdout)
  } catch (error) {
    consoler.error(`Error executing git command: ${command}`)
    return `Error executing git command`
  }
}

/**
 * Write version.json to the output directory.
 * @param json The data to write.
 * @param outDir The output directory.
 */
export function writeJson(json: Record<string, any>, outDir: string): void {
  let stringifyWriteIn: string
  try {
    stringifyWriteIn = JSON.stringify(json, null, 2)
  } catch (error) {
    consoler.error(`Failed to stringify version JSON`)
    stringifyWriteIn = JSON.stringify({})
  }
  const outputPath = path.resolve(outDir, 'version.json')
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, stringifyWriteIn, { encoding: 'utf8' })
}

/**
 * Write version.html to the output directory.
 * @param json The data to render.
 * @param outDir The output directory.
 */
export function writeHtml(json: Record<string, any>, outDir: string): void {
  const stringifyWriteIn = `<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1,IE=11,IE=10">
  <meta name="viewport"
    content="width=device-width, initial-scale=1.0, minimum-scale=0.5, maximum-scale=2.0, user-scalable=yes" />
  <title>版本信息</title>
  <style>
    .label {
      color: #666666;
      margin-right: 10px;
      display: inline;
      width: 85px;
    }
    body > div {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    body > div + div {
      margin-top: 10px;
    }
  </style>
</head>

<body>
  <h1>本次部署</h1>
  <div>
    <div class="label">部署版本：</div>
    ${json?.WEB_APP_VERSION ?? ''}
  </div>
  <div>
    <div class="label">部署分支：</div>
    ${json?.GIT_BRANCH ?? ''}
  </div>
  <div>
    <div class="label">部署人员：</div>
    ${json?.GIT_BUILD_USERNAME ?? ''}
  </div>
  <div>
    <div class="label">部署时间：</div>
    ${json?.GIT_BUILD_TIME ?? ''}
  </div>
  <h1>末次提交</h1>
  <div>
    <div class="label">提交SHA：</div>
    ${json?.GIT_COMMIT_HASH ?? ''}
  </div>
  <div>
    <div class="label">提交备注：</div>
    ${json?.GIT_LASTCOMMITMSG ?? ''}
  </div>
  <div>
    <div class="label">提交人员：</div>
    ${json?.GIT_LASTCOMMIT_USERNAME ?? ''}
  </div>
  <div>
    <div class="label">提交时间：</div>
    ${json?.GIT_LASTCOMMITTIME ?? ''}
  </div>
</body>

</html>`
  const outputPath = path.resolve(outDir, 'version.html')
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, stringifyWriteIn, { encoding: 'utf8' })
}
