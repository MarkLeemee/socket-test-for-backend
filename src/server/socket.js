const SocketIO = require('socket.io')

module.exports = (server, app) => {
  const io = SocketIO(server, {
    cors: {
      origin: '*',
      methods: ['*'],
    },
    path: '/socket',
  })
  app.set('io', io)

  let usernames = []
  let messages = []

  io.on('connection', (socket) => {
    console.log('🐱🐱🐱 Server : connected 🐱🐱🐱')
    socket.emit('conncet')

    socket.on('disconnect', () => {
      const { username } = socket
      if (username) {
        console.log(`🐱🐱🐱 Server : disconnected: ${username} 🐱🐱🐱`)
        usernames = usernames.filter((u) => u !== username)
      }
    })

    socket.on('C2S.login', ({ username }) => {
      console.log(`🐱🐱🐱 Server : login: ${username} 🐱🐱🐱`)
      usernames.push(username)
      socket.username = username
      socket.emit('S2C.login', { username })
    })

    socket.on('C2S.logout', () => {
      const { username } = socket
      if (username) {
        console.log(`🐱🐱🐱 Server : logout: ${username} 🐱🐱🐱`)
        usernames = usernames.filter((u) => u !== username)
        delete socket['username']
        socket.emit('S2C.login', { username })
      }
    })

    socket.on('C2S.message', ({ text }) => {
      console.log(`🐱🐱🐱 Server : message: ${text} 🐱🐱🐱`)
      const message = {
        id: messages.length,
        text,
        username: socket.username,
      }
      messages.push(message)

      socket.emit('S2C.message', { message })
    })

    socket.on('C2S.data', (data) => {
      console.log(`🐱🐱🐱 Server : data: ${data} 🐱🐱🐱`)
      // Todo...
      socket.emit('S2C.data', { data })
    })

    socket.on('C2S.data', (data) => {
      console.log(`🐱🐱🐱 Server : data: ${data} 🐱🐱🐱`)
      // Todo...
      socket.emit('S2C.data', { data })
    })

    // 👇👇👇 eventName 및 data을 수정하여 활용 👇👇👇
    socket.on('evnetName', (data) => {
      console.log(`🐱🐱🐱 Server : data: ${data} 🐱🐱🐱`)
      // Todo...
      socket.emit('S2C.data', { data })
    })
  })
}
