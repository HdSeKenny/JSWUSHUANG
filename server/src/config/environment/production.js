'use strict'
/*eslint no-process-env:0*/
const _GlobalConfigs = require('../../../../global_configs')
// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip: process.env.OPENSHIFT_NODEJS_IP || process.env.ip || _GlobalConfigs.SERVER_IP || undefined,

  // Server port
  port: _GlobalConfigs.SERVER_PORT || 9000,

  // MongoDB connection options
  mongo: {
    uri:
      _GlobalConfigs.MONGODB_URI
      || process.env.MONGODB_URI
      || process.env.MONGOHQ_URL
      || process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME
      || 'mongodb://localhost/dkp-system-default'
  }
}
