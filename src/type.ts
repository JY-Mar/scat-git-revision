import type { UnpluginInstance, UnpluginOptions } from 'unplugin'

namespace GitRevision {
  /**
   * Input options for GitRevision plugin
   */
  export interface Options {
    // ---- Feature flags ----
    /** Whether to retrieve the commit hash. @default true */
    commitHash?: boolean
    /** Whether to retrieve the version. @default true */
    version?: boolean
    /** Whether to retrieve the branch. @default true */
    branch?: boolean
    /** Whether to retrieve the last commit time. @default true */
    lastCommitTime?: boolean
    /** Whether to include lightweight tags. @default false */
    lightweightTags?: boolean
    /** Whether to retrieve the last commit message. @default true */
    lastCommitMsg?: boolean
    /** Whether to retrieve the last commit username. @default true */
    lastCommitUsername?: boolean
    /** Whether to retrieve the last commit usermail. @default true */
    lastCommitUsermail?: boolean
    /** Whether to retrieve the build username. @default true */
    buildUsername?: boolean
    /** Whether to retrieve the build usermail. @default true */
    buildUsermail?: boolean

    // ---- Variable names ----
    /** Variable name for commit hash. @default 'GIT_COMMIT_HASH' */
    commitHashVar?: string
    /** Variable name for version. @default 'GIT_VERSION' */
    versionVar?: string
    /** Variable name for branch. @default 'GIT_BRANCH' */
    branchVar?: string
    /** Variable name for last commit time. @default 'GIT_LASTCOMMITTIME' */
    lastCommitTimeVar?: string
    /** Variable name for last commit message. @default 'GIT_LASTCOMMITMSG' */
    lastCommitMsgVar?: string
    /** Variable name for last commit username. @default 'GIT_LASTCOMMIT_USERNAME' */
    lastCommitUsernameVar?: string
    /** Variable name for last commit usermail. @default 'GIT_LASTCOMMIT_USERMAIL' */
    lastCommitUsermailVar?: string
    /** Variable name for build username. @default 'GIT_BUILD_USERNAME' */
    buildUsernameVar?: string
    /** Variable name for build usermail. @default 'GIT_BUILD_USERMAIL' */
    buildUsermailVar?: string

    // ---- Git commands ----
    /** Command for commit hash. @default 'rev-parse HEAD' */
    commitHashCommand?: string
    /** Command for version. @default 'describe --always' */
    versionCommand?: string
    /** Command for branch. @default 'rev-parse --abbrev-ref HEAD' */
    branchCommand?: string
    /** Command for last commit time. @default 'log -1 --format=%cI' */
    lastCommitTimeCommand?: string
    /** Command for last commit message. @default 'log -1 --format=%s' */
    lastCommitMsgCommand?: string
    /** Command for last commit username. @default 'log -1 --format=%cn' */
    lastCommitUsernameCommand?: string
    /** Command for last commit usermail. @default 'log -1 --format=%ce' */
    lastCommitUsermailCommand?: string
    /** Command for build username. @default 'config user.name' */
    buildUsernameCommand?: string
    /** Command for build usermail. @default 'config user.email' */
    buildUsermailCommand?: string

    // ---- Other options ----
    /** The git work tree path. @default '' */
    gitWorkTree?: string
    /** Custom variable name for the injected script. @default '__GIT__INFO' */
    customVar?: string
    /** Output directory relative to cwd. @default 'dist' */
    outDir?: string
    /** Whether to print git info directly to the console. @default false */
    consoleDirectly?: boolean
  }

  /**
   * Resolved options with all fields required
   */
  export interface ResolvedOptions extends Required<Options> {
    /** Cached git data for injection */
    gitDataCache: Record<string, string>
  }

  /**
   * Input options type
   */
  export type InputOptions = Options | undefined

  /**
   * Options for createUnplugin
   */
  export type OptionsForCreateUnplugin = UnpluginOptions & { execute: Execute }

  /**
   * Execute function type
   */
  export type Execute = (showConsoler?: boolean) => Promise<void>

  /**
   * Console
   */
  export namespace Consoler {
    /** All Console output types */
    export const MSG_TYPES = ['success', 'warn', 'warning', 'error', 'link', 'info', 'tip', 'emphasize', 'debug'] as const
    /** Console output type */
    export type MsgType = (typeof MSG_TYPES)[number]
    /** Console output type */
    export type MsgInputType = MsgType | (string & Record<never, never>)
    /** Console instance */
    export type Instance = {
      [K in MsgType]: (text: string, eol?: 'start' | 'end' | 'both' | 'none') => void
    }
  }

  /**
   * Instance of GitRevision
   */
  export type Instance = Pick<UnpluginInstance<InputOptions, boolean>, 'rollup' | 'webpack'> & {
    vite: UnpluginInstance<InputOptions, boolean>['rollup']
    /**
     * External Executable Function
     * @param        {InputOptions} options Input GitRevision Options
     * @param        {boolean} showConsoler Whether to display console output
     * @return       {Promise<void>}
     */
    exec: (options: InputOptions, showConsoler?: boolean) => Promise<void>
    /**
     * Run a git command and return its output
     * @param        {string | undefined} gitWorkTree Git work tree path
     * @param        {string} gitCommand Git command to execute
     * @return       {Promise<string | undefined>}
     */
    runGitDefineCommand: (gitWorkTree: string | undefined, gitCommand: string) => Promise<string | undefined>
  }
}

export default GitRevision
