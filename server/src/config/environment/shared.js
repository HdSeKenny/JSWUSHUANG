'use strict'
/*eslint no-process-env: 0*/
const _GlobalConfigs = require('../../../../global_configs.json')

module.exports = {
  env: process.env.NODE_ENV,
  port: _GlobalConfigs.SERVER_PORT || process.env.PORT || 9000,
  userRoles: ['guest', 'user', 'looked_admin', 'admin', 'root']
}
