'use strict'

import path from 'path'
import _ from 'lodash'
import _GlobalConfigs from '../../../../global_configs.json'

// All configurations will extend these options
// ============================================
const _root = path.normalize(`${__dirname}/../../../../`)

const all = {
  env: process.env.NODE_ENV,
  root: _root,
  protocol: _GlobalConfigs.PROTOCOL || 'http',
  host: _GlobalConfigs.SERVER_HOST || '127.0.0.1',
  port: _GlobalConfigs.SERVER_PORT || 9000,

  // Server IP
  ip: _GlobalConfigs.SERVER_IP || process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: _GlobalConfigs.SEED_DB || false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'dkp-system-secret'
  },

  // MongoDB connection options
  mongo: {
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }
  },

  upload: {
    target: path.join(_root, 'server', 'src', 'uploads', 'images')
  }
}

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(all, require('./shared'), require(`./${process.env.NODE_ENV}.js`) || {})
