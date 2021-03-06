module.exports = (io) => {
  let usernames = []
  let messages = []

  io.on('connection', (socket) => {
    console.log('π±π±π± Server : connected π±π±π±')
    socket.emit('conncet')

    socket.on('disconnect', () => {
      const { username } = socket
      if (username) {
        console.log(`π±π±π± Server : disconnected: ${username} π±π±π±`)
        usernames = usernames.filter((u) => u !== username)
      }
    })

    socket.on('C2S.login', ({ username }) => {
      console.log(`π±π±π± Server : login: ${username} π±π±π±`)
      usernames.push(username)
      socket.username = username
      socket.emit('S2C.login', { username })
    })

    socket.on('C2S.logout', () => {
      const { username } = socket
      if (username) {
        console.log(`π±π±π± Server : logout: ${username} π±π±π±`)
        usernames = usernames.filter((u) => u !== username)
        delete socket['username']
        socket.emit('S2C.login', { username })
      }
    })

    socket.on('C2S.message', ({ text }) => {
      console.log(`π±π±π± Server : message: ${text} π±π±π±`)
      const message = {
        id: messages.length,
        text,
        username: socket.username,
      }
      messages.push(message)

      socket.emit('S2C.message', { message })
    })

    socket.on('C2S.data', (data) => {
      console.log(`π±π±π± Server : data: ${data} π±π±π±`)
      // Todo...
      socket.emit('S2C.data', { data })
    })

    socket.on('C2S.data', (data) => {
      console.log(`π±π±π± Server : data: ${data} π±π±π±`)
      // Todo...
      socket.emit('S2C.data', { data })
    })

    // πππ eventName λ° dataμ μμ νμ¬ νμ© πππ
    socket.on('evnetName', (data) => {
      console.log(`π±π±π± Server : data: ${data} π±π±π±`)
      // Todo...
      socket.emit('S2C.data', { data })
    })
  })
}
