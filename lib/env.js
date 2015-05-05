var debug = require('debug')('win-detect-browsers')

// Clone env, dont mutate
var env = module.exports = {}

// Normalize to uppercase
Object.keys(process.env).forEach(function(name){
  env[name.toUpperCase()] = process.env[name]
})

env.PROGRAMFILES_X86 = env['PROGRAMFILES(X86)'] || env['PROGRAMFILES']
env.PROGRAMFILES_X64 = env.PROGRAMW6432 // "C:\Program Files" on x64

if (!env.USERPROFILE)
  env.USERPROFILE = env.HOMEDRIVE + env.HOMEPATH

// eg, "%USERPROFILE%\AppData\Local" or
//     "%USERPROFILE%\Local Settings\Application Data" (XP)
if (!env.LOCALAPPDATA)
  env.LOCALAPPDATA = env.USERPROFILE + '\\Local Settings\\Application Data'

env.X64 =
  process.arch == 'x64' || 
  'PROGRAMFILES(X86)' in env ||
  'PROCESSOR_ARCHITEW6432' in env // in 32-bit process

debug('32-bit Program Files: %s', env.PROGRAMFILES_X86 || '-')
if (env.X64) debug('64-bit Program Files: %s', env.PROGRAMFILES_X64 || '-')

debug('USERPROFILE: %s', env.USERPROFILE || '-')
debug('LOCALAPPDATA: %s', env.LOCALAPPDATA || '-')
debug('SYSTEMROOT: %s', env.SYSTEMROOT || '-')
