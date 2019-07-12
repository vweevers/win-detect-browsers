'use strict'

const extractPath = require('../extract-path')
const env = require('windows-env')
const fs = require('fs')
const { basename, resolve, dirname } = require('path')
const registry = require('../registry')

const GUIDS = [
  '8A69D345-D564-463C-AFF1-A69D9E530F96', // 32
  '4DC8B4CA-1BDA-483E-B5FA-D3C12E15B62D', // 64
  '4EA16AC7-FD5A-47C3-875B-DBF4A2008C20' // canary
]

const CHANNELS = [
  'canary',
  'beta',
  'dev'
]

module.exports = function findUpdateClients () {
  const next = this.plan(GUIDS.length * (env.X64 ? 4 : 2))

  GUIDS.forEach(guid => {
    queryState(this, 'HKCU', guid, false, next)
    queryState(this, 'HKLM', guid, false, next)

    if (env.X64) {
      queryState(this, 'HKCU', guid, true, next)
      queryState(this, 'HKLM', guid, true, next)
    }
  })
}

function queryState (self, hive, guid, inWoW, done) {
  const software = inWoW ? 'Software\\Wow6432Node' : 'Software'
  const key = `${software}\\Google\\Update\\ClientState\\{${guid}}`

  registry.values(hive, key, function (err, client) {
    if (err) {
      done(err.notFound ? null : err)
    } else if (client.ap) {
      let path
      const ap = new Set(client.ap.split('-'))

      const metadata = {
        channel: getReleaseChannel(ap),
        bitness: ap.has('x64') ? 64 : 32,
        guid
      }

      // Not always available
      if (client.LastInstallerSuccessLaunchCmdLine) {
        path = extractPath(client.LastInstallerSuccessLaunchCmdLine)
      }

      if (client.UninstallString) {
        const args = client.UninstallArguments

        metadata.uninstall = {
          path: client.UninstallString,
          arguments: args ? args.split(' ').filter(Boolean) : []
        }

        if (!path) {
          // Possibly Google\Chrome\Application\<version>\Installer\setup.exe
          // with chrome.exe at Google\Chrome\Application\chrome.exe
          const installer = extractPath(client.UninstallString)

          if (installer && basename(dirname(installer)) === 'Installer' && basename(installer) === 'setup.exe') {
            const path = resolve(installer, '..', '..', '..', 'chrome.exe')

            return fs.access(path, fs.constants.F_OK, (err) => {
              if (err) done()
              else self.found(path, metadata, key + '\\UninstallString', done)
            })
          }
        }
      }

      if (path) self.found(path, metadata, key + '\\LastInstallerSuccessLaunchCmdLine', done)
      else done()
    } else {
      done()
    }
  })
}

function getReleaseChannel (ap) {
  for (const channel of CHANNELS) {
    if (ap.has(channel)) return channel
  }

  return 'stable'
}
