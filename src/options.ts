/**
 * Default git command constants
 */
export const COMMAND_COMMIT_HASH = 'rev-parse HEAD'
export const COMMAND_VERSION = 'describe --always'
export const COMMAND_BRANCH = 'rev-parse --abbrev-ref HEAD'
export const COMMAND_LASTCOMMIT_TIME = 'log -1 --format=%cI'
export const COMMAND_LASTCOMMIT_MSG = 'log -1 --format=%s'
export const COMMAND_LASTCOMMIT_USERNAME = 'log -1 --format=%cn'
export const COMMAND_LASTCOMMIT_USERMAIL = 'log -1 --format=%ce'
export const COMMAND_BUILD_USERNAME = 'config user.name'
export const COMMAND_BUILD_USERMAIL = 'config user.email'

/**
 * Default variable name constants
 */
export const VAR_COMMIT_HASH = 'GIT_COMMIT_HASH'
export const VAR_VERSION = 'GIT_VERSION'
export const VAR_BRANCH = 'GIT_BRANCH'
export const VAR_LASTCOMMIT_TIME = 'GIT_LASTCOMMITTIME'
export const VAR_LASTCOMMIT_MSG = 'GIT_LASTCOMMITMSG'
export const VAR_LASTCOMMIT_USERNAME = 'GIT_LASTCOMMIT_USERNAME'
export const VAR_LASTCOMMIT_USERMAIL = 'GIT_LASTCOMMIT_USERMAIL'
export const VAR_BUILD_USERNAME = 'GIT_BUILD_USERNAME'
export const VAR_BUILD_USERMAIL = 'GIT_BUILD_USERMAIL'

/**
 * Default options for GitRevision plugin
 */
export const DEFAULT_OPTIONS = {
  commitHash: true,
  version: true,
  branch: true,
  lightweightTags: false,
  lastCommitTime: true,
  lastCommitMsg: true,
  lastCommitUsername: true,
  lastCommitUsermail: true,
  buildUsername: true,
  buildUsermail: true,
  commitHashVar: VAR_COMMIT_HASH,
  versionVar: VAR_VERSION,
  branchVar: VAR_BRANCH,
  lastCommitTimeVar: VAR_LASTCOMMIT_TIME,
  lastCommitMsgVar: VAR_LASTCOMMIT_MSG,
  lastCommitUsernameVar: VAR_LASTCOMMIT_USERNAME,
  lastCommitUsermailVar: VAR_LASTCOMMIT_USERMAIL,
  buildUsernameVar: VAR_BUILD_USERNAME,
  buildUsermailVar: VAR_BUILD_USERMAIL,
  commitHashCommand: COMMAND_COMMIT_HASH,
  versionCommand: COMMAND_VERSION,
  branchCommand: COMMAND_BRANCH,
  lastCommitTimeCommand: COMMAND_LASTCOMMIT_TIME,
  lastCommitMsgCommand: COMMAND_LASTCOMMIT_MSG,
  lastCommitUsernameCommand: COMMAND_LASTCOMMIT_USERNAME,
  lastCommitUsermailCommand: COMMAND_LASTCOMMIT_USERMAIL,
  buildUsernameCommand: COMMAND_BUILD_USERNAME,
  buildUsermailCommand: COMMAND_BUILD_USERMAIL,
  gitWorkTree: '',
  customVar: '__GIT__INFO',
  outDir: 'dist',
  consoleDirectly: false
} as const
