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
} from '../store/actions'
import { HOST_NAME, EVENT_NAME } from '../config'

function connect() {
  // πππ μ°κ²° νΈμ€νΈ λ° λ€μμ€νμ΄μ€ μ€μ  πππ
  const socket = io(HOST_NAME, {
    // path: '/socket',
    transports: ['websocket', 'polling', 'flashsocket'],
  })
  return new Promise((resolve) => {
    socket.on('conncet', () => {
      console.log('πΆπΆπΆ Client : connected πΆπΆπΆ')
      resolve(socket)
    })
  })
}

function subscribe(socket, buffer) {
  return eventChannel((emitter) => {
    socket.on('disconnect', (e) => {
      console.log(`πΆπΆπΆ Client : disconnected πΆπΆπΆ`)
      // μ¬μ°κ²° λ‘μ§...
    })
    socket.on('S2C.login', ({ username }) => {
      console.log(`πΆπΆπΆ Client : login success πΆπΆπΆ`)
      emitter(addUser({ username }))
    })
    socket.on('S2C.logout', ({ username }) => {
      console.log(`πΆπΆπΆ Client : logout success πΆπΆπΆ`)
      emitter(removeUser({ username }))
    })
    socket.on('S2C.message', ({ message }) => {
      console.log(`πΆπΆπΆ Client : message received πΆπΆπΆ`, message)
      emitter(newMessage({ message }))
    })
    socket.on('S2C.data', ({ data }) => {
      console.log(`πΆπΆπΆ Client : data eceived πΆπΆπΆ`, data)
      emitter(newData({ data }))
    })

    // πππ eventName λ° dataμ μμ νμ¬ νμ© πππ
    socket.on(EVENT_NAME, ({ data }) => {
      console.log(`πΆπΆπΆ Client : eventName πΆπΆπΆ`, data)
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
