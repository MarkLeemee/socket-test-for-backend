const { instrument } = require('@socket.io/admin-ui')
const SocketIO = require('socket.io')
const GlobalSpace = require('./globalIo')
const UserNameSpace = require('./userIo')

module.exports = (server, app) => {
  const io = SocketIO(server, {
    cors: {
      // origin: [
      //   'http://localhost:5000',
      //   'https://admin.socket.io/', // admin-ui cors
      // ],
      origin: '*',
      methods: ['*'],
    },
    // path: '/socket',
  })

  app.set('io', io)

  // 일반 global test space
  GlobalSpace(io)

  // user namespace
  const userIo = io.of('/user')
  UserNameSpace(userIo)

  // `admin.socket.io`로 손쉽게 socket 관리
  instrument(io, { auth: false })
}
