import path from 'path'
import { type WebpackPluginInstance, createUnplugin } from 'unplugin'
import { runGitCommand, writeHtml, writeJson, consoler } from './utils'
import GitRevision from './type'
import { DEFAULT_OPTIONS, COMMAND_VERSION } from './options'

const name = 'GitRevision'

function unpluginFactory(options: GitRevision.InputOptions): GitRevision.OptionsForCreateUnplugin {
  let isError = false
  if (options === null || options === undefined) {
    consoler.error('"options" is required')
    isError = true
  } else if (Object.prototype.toString.call(options) !== '[object Object]' || Object.keys(options).length === 0) {
    consoler.error('"options" must be a valid JSON object')
    isError = true
  }
  if (isError) {
    // 仅打印错误，返回空插件，不中断外部打包流程
    return {
      name,
      async execute(showConsoler = true) {
        return Promise.resolve()
      }
    }
  }

  // 校验选项
  if (options?.versionCommand && options?.lightweightTags) {
    throw new Error("lightweightTags can't be used together versionCommand")
  }

  // 合并默认选项
  const mergedOptions: GitRevision.ResolvedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    versionCommand: options?.versionCommand || `${COMMAND_VERSION}${options?.lightweightTags ? ' --tags' : ''}`,
    gitDataCache: {}
  }

  const outDir = path.resolve(mergedOptions.outDir)

  // Git 数据缓存，避免重复生成
  const gitDataCache = mergedOptions.gitDataCache

  /**
   * 生成 git 数据并填充缓存（仅在缓存为空时执行）
   */
  async function populateGitDataCache(): Promise<void> {
    if (Object.keys(gitDataCache).length > 0) return

    const gitWorkTree = mergedOptions.gitWorkTree

    type GitDataEntry = {
      flag: keyof Pick<GitRevision.Options, 'branch' | 'buildUsername' | 'buildUsermail' | 'commitHash' | 'lastCommitTime' | 'lastCommitMsg' | 'lastCommitUsername' | 'lastCommitUsermail'>
      command: keyof Pick<GitRevision.Options, 'branchCommand' | 'buildUsernameCommand' | 'buildUsermailCommand' | 'commitHashCommand' | 'lastCommitTimeCommand' | 'lastCommitMsgCommand' | 'lastCommitUsernameCommand' | 'lastCommitUsermailCommand'>
      var: keyof Pick<GitRevision.Options, 'branchVar' | 'buildUsernameVar' | 'buildUsermailVar' | 'commitHashVar' | 'lastCommitTimeVar' | 'lastCommitMsgVar' | 'lastCommitUsernameVar' | 'lastCommitUsermailVar'>
    }

    const gitDataArray: GitDataEntry[] = [
      { flag: 'branch', command: 'branchCommand', var: 'branchVar' },
      { flag: 'buildUsername', command: 'buildUsernameCommand', var: 'buildUsernameVar' },
      { flag: 'buildUsermail', command: 'buildUsermailCommand', var: 'buildUsermailVar' },
      { flag: 'commitHash', command: 'commitHashCommand', var: 'commitHashVar' },
      { flag: 'lastCommitTime', command: 'lastCommitTimeCommand', var: 'lastCommitTimeVar' },
      { flag: 'lastCommitMsg', command: 'lastCommitMsgCommand', var: 'lastCommitMsgVar' },
      { flag: 'lastCommitUsername', command: 'lastCommitUsernameCommand', var: 'lastCommitUsernameVar' },
      { flag: 'lastCommitUsermail', command: 'lastCommitUsermailCommand', var: 'lastCommitUsermailVar' }
    ]

    for (const entry of gitDataArray) {
      if (mergedOptions[entry.flag] && mergedOptions[entry.command]) {
        gitDataCache[mergedOptions[entry.var]] = await runGitCommand(gitWorkTree, mergedOptions[entry.command])
      }
    }

    // 构建时间和应用版本
    const now = new Date()
    gitDataCache.GIT_BUILD_TIME = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    gitDataCache.WEB_APP_VERSION = process.env.npm_package_version || ''
  }

  /**
   * 写入版本文件到输出目录
   */
  async function endHandler(showConsoler: boolean = true): Promise<void> {
    await populateGitDataCache()

    try {
      writeJson(gitDataCache, outDir)
      writeHtml(gitDataCache, outDir)
      if (showConsoler) {
        consoler.success(`Version files generated: ${outDir}`)
      }
    } catch (error) {
      consoler.error(`Failed to generate version files`)
      console.error(error)
    }
  }

  return {
    name,

    /**
     * 独立执行函数
     */
    async execute(showConsoler: boolean = true) {
      await populateGitDataCache()
      await endHandler(showConsoler)
      return Promise.resolve()
    },

    /**
     * buildStart hook（Rollup / Webpack 下生成 git 数据）
     */
    async buildStart() {
      await populateGitDataCache()
    },

    /**
     * writeBundle hook（构建结束后写入版本文件）
     */
    async writeBundle() {
      // 跳过 Vue CLI 的 Modern Mode 第一轮 (Legacy Bundle)
      if (process.env.VUE_CLI_MODERN_MODE && !process.env.VUE_CLI_MODERN_BUILD) {
        return
      }
      await endHandler()
    },

    /**
     * Vite config hook — 注入 __GIT_REVISION_INFO__ 全局变量
     */
    async config() {
      await populateGitDataCache()
      const defineData: Record<string, string> = {}
      for (const [key, value] of Object.entries(gitDataCache)) {
        if (key !== 'GIT_BUILD_TIME' && key !== 'WEB_APP_VERSION') {
          defineData[key] = value
        }
      }
      return {
        define: {
          __GIT_REVISION_INFO__: JSON.stringify(defineData)
        }
      }
    },

    /**
     * Vite transformIndexHtml hook — 注入脚本到 HTML body
     */
    async transformIndexHtml() {
      await populateGitDataCache()
      const jsonStr = JSON.stringify(gitDataCache)
      const scriptContent = `const ${mergedOptions.customVar} = ${jsonStr};${mergedOptions.consoleDirectly ? `console.log(${jsonStr})` : ''}`
      return [
        {
          tag: 'script',
          attrs: { defer: true },
          children: scriptContent,
          injectTo: 'body'
        }
      ]
    }
  } as GitRevision.OptionsForCreateUnplugin
}

const Instance: GitRevision.Instance = {
  ...createUnplugin(unpluginFactory as any),
  exec: (options, showConsoler) => unpluginFactory(options).execute(showConsoler),
  runGitDefineCommand: async (gitWorkTree: string | undefined, gitCommand: string) => {
    if (gitCommand.startsWith('git')) {
      gitCommand = gitCommand.substring(3)
    }
    try {
      return await runGitCommand(gitWorkTree || '', gitCommand)
    } catch (error) {
      consoler.error(`Failed to run git command: ${gitCommand}`)
      return undefined
    }
  }
}

const RollupPluginGitRevision = Instance.rollup
const VitePluginGitRevision = Instance.vite
class GitRevisionWebpackPlugin {
  private instance: WebpackPluginInstance
  constructor(options?: GitRevision.InputOptions) {
    this.instance = Instance.webpack(options)
  }
  apply(compiler: any): void {
    this.instance.apply(compiler)
  }
}
type GitRevisionInputOptions = GitRevision.InputOptions

export { Instance as default, RollupPluginGitRevision, VitePluginGitRevision, GitRevisionWebpackPlugin, GitRevisionInputOptions }
