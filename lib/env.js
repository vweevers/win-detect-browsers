// Clone env, dont mutate
var env = module.exports = require('xtend')(process.env)
  , debug = require('debug')('win-detect-browsers')

env.ProgramFiles_x86 = env['ProgramFiles(x86)'] || env['ProgramFiles']
env.ProgramFiles_x64 = env.ProgramW6432 // "C:\Program Files" on x64

if (!env.USERPROFILE)
  env.USERPROFILE = env.HOMEDRIVE + env.HOMEPATH

// eg, "%USERPROFILE%\AppData\Local" or
//     "%USERPROFILE%\Local Settings\Application Data" (XP)
if (!env.LOCALAPPDATA)
  env.LOCALAPPDATA = env.USERPROFILE + '\\Local Settings\\Application Data'

env.x64 =
  process.arch == 'x64' || 
  'ProgramFiles(x86)' in env || 
  'PROCESSOR_ARCHITEW6432' in env // in 32-bit process

debug('32-bit Program Files: %s', env.ProgramFiles_x86 || '-')
if (env.x64) debug('64-bit Program Files: %s', env.ProgramFiles_x64 || '-')
debug('USERPROFILE: %s', env.USERPROFILE || '-')
debug('LOCALAPPDATA: %s', env.LOCALAPPDATA || '-')
