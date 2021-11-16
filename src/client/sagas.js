import io from 'socket.io-client'
import { eventChannel } from 'redux-saga'
import { fork, take, call, put, cancel, race, delay } from 'redux-saga/effects'
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
    path: '/socket',
    transports: ['websocket', 'polling', 'flashsocket'],
  })
  return new Promise((resolve) => {
    socket.on('conncet', () => {
      console.log('🐶🐶🐶 Client : connected 🐶🐶🐶')
      resolve(socket)
    })
  })
}

function subscribe(socket) {
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
      socket.off('disconnect', emitter)
    }
  })
}

function closeChannel(channel) {
  if (channel) {
    channel.close()
  }
}

// matcher 활용 시 (임시 코드)
// const matcher = action => action.headers.requester === MY_ID

function* read(socket) {
  // const channel = yield call(subscribe, socket, null, matcher)
  const channel = yield call(subscribe, socket)
  while (true) {
    try {
      // timeout (or debounce 등) 활용시
      // const { timeout, action } = yield race({
      //   timeout: delay(10000),
      //   action: take(channel),
      // })
      // if (timeout) {
      //   alert('timeout!!!')
      // } else {
      //   yield put(action)
      // }
      const action = yield take(channel)
      yield put(action)
    } catch (e) {
      alert(e.message)
    } finally {
      // takeEvery 활용 시
      // closeChannel(channel)
    }
  }
}

function* write(socket) {
  while (true) {
    const { payload } = yield take(`${sendMessage}`)
    socket.emit('C2S.message', { text: payload.text })
  }
}

function* writeData(socket) {
  while (true) {
    const { payload } = yield take(`${sendData}`)
    socket.emit('C2S.data', { data: payload.data })
  }
}

function* emitTrigger(socket) {
  while (true) {
    const { payload } = yield take(`${newEmit}`)
    socket.emit(payload.event, { data: payload.data })
  }
}

function* handleIO(socket) {
  yield fork(read, socket)
  yield fork(write, socket)
  yield fork(writeData, socket)
  yield fork(emitTrigger, socket)
}

function* flow() {
  while (true) {
    const { payload } = yield take(`${login}`)
    const socket = yield call(connect)

    socket.emit('C2S.login', payload)

    const task = yield fork(handleIO, socket)

    const aciton = yield take(`${logout}`)
    yield cancel(task)
    socket.emit('C2S.logout')
  }
}

export default function* rootSaga() {
  yield fork(flow)
}
