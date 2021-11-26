import io from 'socket.io-client'
import { eventChannel } from 'redux-saga'
import { fork, take, call, put, cancel, race, delay } from 'redux-saga/effects'
import {
  connectIO,
  disconnectIO,
  joinRoom,
  leaveRoom,
  login,
  logout,
  addUser,
  removeUser,
  newMessage,
  sendMessage,
  sendData,
  newData,
  newEmit,
} from './actions'
import { HOST_NAME, EVENT_NAME } from './config'

const getAccessToken = () => 'ACtoken'
const getRefreshToken = () => 'REtoken'
const redirect = (route) => console.log(`to ${route}`)

function closeChannel(channel) {
  if (channel) {
    channel.close()
  }
}

function connect(action) {
  try {
    const socket = io(HOST_NAME, {
      // path: '/socket',
      // withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 'infinity',
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling', 'flashsocket'],
      auth: { token: `Bearer ${action?.payload?.accessToken}` },
    })
    return new Promise((resolve, reject) => {
      socket.on('connect', () => {
        resolve(socket)
      })
      socket.on('connect_error', (err) => {
        if (err?.code === '401') {
          try {
            return connect({ payload: getRefreshToken() })
          } catch (e) {
            redirect('/signin')
          }
        } else {
          reject(new Error(err?.msg))
        }
      })
    })
  } catch (e) {
    return new Promise((resolve, reject) => {
      reject(new Error(e))
    })
  }
}

function subscribe(socket) {
  return eventChannel((emitter) => {
    socket.on('disconnect', (e) => {
      console.log(`🐶🐶🐶 Client : disconnected 🐶🐶🐶`)
      emitter(connectIO(getAccessToken()))
    })

    socket.on('joinRoom', () => {
      emitter()
    })

    socket.on('refuseToJoin', () => {
      emitter()
    })

    return function unsubscribe(socket, emitter) {
      socket.off('disconnect', emitter)
    }
  })
}

function subscribeRoom(socket) {
  return eventChannel((emitter) => {
    socket.on('disconnect', (e) => {
      console.log(`🐶🐶🐶 Client : disconnected 🐶🐶🐶`)
      emitter(connectIO(getAccessToken()))
    })

    socket.on('joinRoom', () => {
      emitter()
    })

    socket.on('refuseToJoin', () => {
      emitter()
    })

    return function unsubscribe(socket, emitter) {
      socket.off('disconnect', emitter)
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

function* join(socket) {
  while (true) {
    const joinTask = yield take(`${joinRoom}`)
    socket.emit('C2S.joinRoom', joinTask.payload, () => {})

    const task = yield fork(readRoom, socket)
    const leaveTask = yield take(`${leaveRoom}`)
    yield cancel(task)
    socket.emit('C2S.leaveRoom', leaveTask.payload, () => {})
  }
}

function* read(socket) {
  const channel = yield call(subscribe, socket)
  while (true) {
    try {
      const { timeout, action } = yield race({
        timeout: delay(1000000),
        action: take(channel),
      })
      if (timeout) {
        alert('timeout')
        closeChannel(channel)
      } else {
        yield put(action)
      }
      yield put(action)
    } catch (e) {
      console.error(e)
      closeChannel(channel)
    }
  }
}

function* handleIO(socket) {
  yield fork(join, socket)
  yield fork(read, socket)
}

function* flow() {
  while (true) {
    try {
      const connetTask = yield take(`${connectIO}`)
      const socket = yield call(connect, connetTask)
      socket.emit('C2S.connect', connetTask.payload)

      const task = yield fork(handleIO, socket)

      const disconnectTask = yield take(`${disconnectIO}`)
      yield cancel(task)
      socket.emit('C2S.disconnet', disconnectTask.payload)
    } catch (e) {
      console.error(e)
    }
  }
}

const userSagas = [fork(flow)]

export default userSagas
