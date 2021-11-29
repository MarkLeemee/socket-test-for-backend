import io from 'socket.io-client'
import _ from 'lodash'
import { eventChannel, takeEvery } from 'redux-saga'
import { fork, take, call, put, cancel, race } from 'redux-saga/effects'

import { connectIO, disconnectIO, joinRoom, leaveRoom } from './actions'
import { HOST_NAME } from '../config'

function closeChannel(channel) {
  if (channel) {
    channel.close()
  }
}

function connect(action) {
  const { socketURL, socketRoom, socketEvent, roomEvent, accessToken } =
    action.payload
  try {
    const socket = io(`${HOST_NAME}/${socketURL}`, {
      // path: '/socket',
      // withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 'infinity',
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling', 'flashsocket'],
      auth: { token: `Bearer ${accessToken}` },
    })
    return new Promise((resolve, reject) => {
      socket.on('connect', () => {
        socket.socketURL = socketURL
        socket.socketRoom = socketRoom
        socket.socketEvent = socketEvent
        socket.roomEvent = roomEvent
        socket.accessToken = accessToken
        socket.emit('C2S.joinRoom', socketRoom, () => {})
        resolve(socket)
      })
      socket.on('connect_error', (err) => {
        reject(new Error(err?.msg))
      })
    })
  } catch (e) {
    return new Promise((resolve, reject) => {
      reject(new Error(e))
    })
  }
}

function subscribeSocket(socket) {
  const { socketURL, socketRoom, socketEvent, roomEvent, accessToken } = socket
  return eventChannel((emitter) => {
    socket.on('disconnect', (res) => {
      console.log(`🐶🐶🐶 Client : disconnected 🐶🐶🐶`)
      if (res.msg) {
        emitter(
          connectIO({
            socketURL,
            socketRoom,
            socketEvent,
            roomEvent,
            accessToken,
          }),
        )
      }
    })

    socket.on('joinRoom', () => {
      emitter()
    })

    socket.on('refuseToJoin', () => {
      emitter()
    })

    socket.on('leaveRoom', (e) => {
      emitter()
    })

    socket.on('ping', () => {
      emitter()
    })

    _.map(socketEvent.listener, (item) =>
      socket.on(item.name, (res) => {
        emitter(item.actionCreator(res))
      }),
    )

    return function unsubscribe(socket, emitter) {
      socket.off('disconnect', emitter)
      socket.off('joinRoom', emitter)
      socket.off('refuseToJoin', emitter)
      socket.off('ping', emitter)
      _.map(socketEvent.listener, (item) => socket.off(item.name, emitter))
    }
  })
}

function subscribeRoom(socket) {
  return eventChannel((emitter) => {
    _.map(socket.roomEvent.listener, (item) =>
      socket.on(item.name, (res) => {
        emitter(item.actionCreator(res))
      }),
    )

    return function unsubscribe(socket, emitter) {
      _.map(socket.roomEvent.listener, (item) => socket.off(item.name, emitter))
    }
  })
}

function* readRoom(socket) {
  const channel = yield call(subscribeRoom, socket)
  while (true) {
    try {
      let action = yield take(channel)
      yield put(action)
    } catch (e) {
      console.error(e)
      closeChannel(channel)
    }
  }
}

function* joinRoomSaga(socket) {
  while (true) {
    const joinTask = yield take(`${joinRoom}`)
    socket.emit('C2S.joinRoom', joinTask.payload, () => {})

    const task = yield fork(readRoom, socket)

    const leaveTask = yield take(`${leaveRoom}`)
    yield cancel(task)
    socket.emit('C2S.leaveRoom', leaveTask.payload, () => {})
  }
}

function* readSocketSaga(socket) {
  const channel = yield call(subscribeSocket, socket)
  while (true) {
    try {
      const { timeout, action } = yield race({
        // timeout: delay(1000000),
        action: take(channel),
      })
      if (timeout) {
        alert('timeout')
        closeChannel(channel)
      } else {
        yield put(action)
      }
    } catch (e) {
      console.error(e)
      closeChannel(channel)
    }
  }
}

function* handleIO(socket) {
  yield fork(joinRoomSaga, socket)
  yield fork(readSocketSaga, socket)

  const socketTrigger = socket.socketEvent.trigger
  for (let i = 0; i < socketTrigger.length; i++) {
    yield takeEvery(socketTrigger[i].action, (action) =>
      socket.emit(socketTrigger[i].name, action.payload),
    )
  }

  const roomTrigger = socket.roomEvent.trigger
  for (let i = 0; i < roomTrigger.length; i++) {
    yield takeEvery(roomTrigger[i].action, (action) =>
      socket.emit(roomTrigger[i].name, action.payload),
    )
  }
}

function* flow() {
  while (true) {
    try {
      const connetTask = yield take(`${connectIO}`)
      const socket = yield call(connect, connetTask)
      // optional
      // socket.emit('C2S.connect', connetTask.payload)

      const task = yield fork(handleIO, socket)

      const disconnectTask = yield take(`${disconnectIO}`)
      yield cancel(task)
      // optional
      // socket.emit('C2S.disconnet', disconnectTask.payload)
    } catch (e) {
      console.error(e)
    }
  }
}

const userSagas = [fork(flow)]

export default userSagas
