module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.SERVER_PORT || process.env.PORT || 9000,
  userRoles: ['guest', 'user', 'looked_admin', 'admin', 'root']
}
