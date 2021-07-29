import GoodSocket from '../api/good/good.socket'

export default (io) => {
  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  // We can authenticate socket.io users and access their token through socket.decoded_token
  //
  // 1. You will need to send the token in `client/components/socket/socket.service.js`
  //
  // 2. Require authentication here:
  // socketio.use(require('socketio-jwt').authorize({
  //   secret: 'sweeter-secret',
  //   handshake: true
  // }))

  io.on('connection', (socket) => {
    socket.on('disconnect', () => {
      console.log('DISCONNECTED')
    })

    GoodSocket(io, socket)
    console.log('CONNECTED')
  })
}
