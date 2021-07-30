// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip: process.env.OPENSHIFT_NODEJS_IP || process.env.ip || process.env.SERVER_IP || undefined,

  // Server port
  port: process.env.SERVER_PORT || 9000,

  // MongoDB connection options
  mongo: {
    uri:
      process.env.MONGODB_URI
      || process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME
      || 'mongodb://localhost/dkp-system-prod-jsws'
  }
}
