module.exports = (userIo) => {
  userIo.on('connection', (socket) => {
    console.log('connected to user namespace with username ' + socket.username)
    socket.emit('conncet')

    // room list 갱신이 필요한 경우 별도 on event를 활용하거나
    // 새로운 room이 생성 될 경우, 전체 사용자게 list emit
    const findRooms = () => {
      let availableRooms = []
      let rooms = userIo.sockets.adapter.rooms
      if (rooms) {
        for (var room in rooms) {
          if (!rooms[room].hasOwnProperty(room)) {
            availableRooms.push(room)
          }
        }
      }
      return availableRooms
    }

    socket.emit('S2C.roomList', findRooms())

    socket.on('C2S.joinRoom', (room, callback) => {
      try {
        // 필요하다면 auth check 한번 더
        console.log(`join : ${(socket.username, room)}`)
        socket.join(room)
        socket.boradcast.to(room).emit('S2C.joinRoom', socket.username)
        callback(`join ${room}`)
      } catch (e) {
        console.error(`err : join ${e}`)
        // todo...
      }
    })

    socket.on('C2S.leaveRoom', (room, callback) => {
      try {
        console.log(`leave : ${(socket.username, room)}`)
        socket.leave(room)
        socket.boradcast.to(room).emit('S2C.leave', socket.username)
        callback(`leave ${room}`)
      } catch (e) {
        console.error(`err : leave ${e}`)
        // todo...
      }
    })

    socket.on('C2S.roomMessage', ({ message, room }) => {
      if (!room) {
        socket.boradcast.emit('S2C.message', { message })
      } else {
        socket.boradcast.to(room).emit('S2C.message', { message })
      }
    })
  })

  // socket middleware
  userIo.use((socket, next) => {
    // auth token check
    if (socket.handshake.auth.token) {
      socket.username = getUsernameFromToken(socket.handshake.auth.token)
      next()
    } else {
      next(new Error('Please send token'))
    }
  })

  const getUsernameFromToken = (token) => {
    // todo...
    return 'userName'
  }
}
