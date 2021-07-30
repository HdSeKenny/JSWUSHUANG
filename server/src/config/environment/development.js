/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/dkp-system-dev'
  },

  // Seed database on startup
  seedDB: process.env.SEED_DB || false
}
