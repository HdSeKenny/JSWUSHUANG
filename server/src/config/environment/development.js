/*eslint no-process-env:0*/
const _GlobalConfigs = require('../../../../global_configs.json')

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/dkp-system-dev'
  },

  // Seed database on startup
  seedDB: _GlobalConfigs.SEED_DB || false
}
