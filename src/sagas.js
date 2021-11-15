import io from 'socket.io-client'
import { eventChannel } from 'redux-saga'
import { fork, take, call, put, cancel } from 'redux-saga/effects'
import {
  login,
  logout,
  addUser,
  removeUser,
  newMessage,
  sendMessage,
  testTrigger,
  testData,
} from './actions'

function connect() {
  const socket = io('http://localhost:3000', {
    path: '/socket',
    transports: ['websocket', 'polling', 'flashsocket'],
  })
  return new Promise((resolve) => {
    socket.on('conncet', () => {
      console.log('👍👍👍 연결 성공 👍👍👍')
      resolve(socket)
    })
  })
}

function subscribe(socket) {
  return eventChannel((emitter) => {
    socket.on('S2C.login', (userInfo) => {
      emitter(addUser(userInfo))
    })
    socket.on('S2C.logout', (userInfo) => {
      emitter(removeUser(userInfo))
    })
    socket.on('S2C.message', (message) => {
      emitter(newMessage(message))
    })
    socket.on('S2C.data', (data) => {
      emitter(testData(data))
    })
    // eventName 및 data 인자 수정하여 활용
    socket.on('evnetName', (data) => {
      console.log(data)
    })
    socket.on('some', (e) => {
      // ....
    })
    socket.on('disconnect', (e) => {
      // ....
    })
    return () => {}
  })
}

function* read(socket) {
  const channel = yield call(subscribe, socket)
  while (true) {
    let action = yield take(channel)
    yield put(action)
  }
}

function* write(socket) {
  while (true) {
    const { payload } = yield take(`${sendMessage}`)
    socket.emit('C2S.message', { text: payload.text })
  }
}

function* trigger(socket) {
  while (true) {
    const { payload } = yield take(`${testTrigger}`)
    socket.emit('C2S.data', { data: payload.data })
  }
}

function* handleIO(socket) {
  yield fork(read, socket)
  yield fork(write, socket)
  yield fork(trigger, socket)
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
