import io from 'socket.io-client'
import { eventChannel, buffers } from 'redux-saga'
import { fork, take, call, put, cancel, delay, race } from 'redux-saga/effects'
import {
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

function connect() {
  // 👇👇👇 연결 호스트 및 네임스페이스 설정 👇👇👇
  const socket = io(HOST_NAME, {
    // path: '/socket',
    transports: ['websocket', 'polling', 'flashsocket'],
  })
  return new Promise((resolve) => {
    socket.on('conncet', () => {
      console.log('🐶🐶🐶 Client : connected 🐶🐶🐶')
      resolve(socket)
    })
  })
}

function subscribe(socket, buffer) {
  return eventChannel((emitter) => {
    socket.on('disconnect', (e) => {
      console.log(`🐶🐶🐶 Client : disconnected 🐶🐶🐶`)
      // 재연결 로직...
    })
    socket.on('S2C.login', ({ username }) => {
      console.log(`🐶🐶🐶 Client : login success 🐶🐶🐶`)
      emitter(addUser({ username }))
    })
    socket.on('S2C.logout', ({ username }) => {
      console.log(`🐶🐶🐶 Client : logout success 🐶🐶🐶`)
      emitter(removeUser({ username }))
    })
    socket.on('S2C.message', ({ message }) => {
      console.log(`🐶🐶🐶 Client : message received 🐶🐶🐶`, message)
      emitter(newMessage({ message }))
    })
    socket.on('S2C.data', ({ data }) => {
      console.log(`🐶🐶🐶 Client : data eceived 🐶🐶🐶`, data)
      emitter(newData({ data }))
    })

    // 👇👇👇 eventName 및 data을 수정하여 활용 👇👇👇
    socket.on(EVENT_NAME, ({ data }) => {
      console.log(`🐶🐶🐶 Client : eventName 🐶🐶🐶`, data)
    })

    return function unsubscribe() {
      socket.off(socket, emitter)
    }
  }, buffer || buffers.none())
}

function closeChannel(channel) {
  if (channel) {
    channel.close()
  }
}

function* read(socket) {
  const channel = yield call(subscribe, socket, null)
  while (true) {
    try {
      const { timeout, action } = yield race({
        timeout: delay(10000000),
        action: take(channel),
      })
      if (timeout) {
        alert('timeout')
        closeChannel(channel)
      } else {
        yield put(action)
      }
      // const action = yield take(channel)
      yield put(action)
    } catch (e) {
      alert(e.message)
      closeChannel(channel)
    }
  }
}

function* write(socket) {
  while (true) {
    const sendMessageTask = yield take(`${sendMessage}`)
    socket.emit('C2S.message', { text: sendMessageTask.payload.text })

    const sendDataTask = yield take(`${sendData}`)
    socket.emit('C2S.data', { data: sendDataTask.payload.data })

    const newEmitTask = yield take(`${newEmit}`)
    socket.emit(newEmitTask.payload.event, { data: newEmitTask.payload.data })
  }
}

function* handleIO(socket) {
  yield fork(read, socket)
  yield fork(write, socket)
}

function* flow() {
  while (true) {
    const { payload } = yield take(`${login}`)
    const socket = yield call(connect)

    socket.emit('C2S.login', payload)

    const task = yield fork(handleIO, socket)

    const action = yield take(`${logout}`)
    yield cancel(task)
    socket.emit('C2S.logout', action.payload)
  }
}

const globalSagas = [fork(flow)]

export default globalSagas
