import { combineReducers } from 'redux'
import { createReducer } from 'redux-act'
import {
  login,
  logout,
  addUser,
  removeUser,
  newMessage,
  testData,
} from './actions'

const initial = {
  app: {
    username: null,
  },
  users: [],
  messages: {
    list: [],
    entities: {},
  },
  data: [],
}

const app = createReducer(
  {
    [login]: (state, payload) => {
      return { ...state, username: payload.username }
    },
    [logout]: (state, payload) => {
      return { ...state, username: null }
    },
  },
  initial.app,
)

const users = createReducer(
  {
    [addUser]: (state, payload) => {
      return { ...state, [payload.username]: true }
    },
    [removeUser]: (state, payload) => {
      const newState = { ...state }
      delete newState[payload.username]
      return newState
    },
  },
  initial.users,
)

const messages = createReducer(
  {
    [newMessage]: (state, payload) => {
      const { message } = payload
      console.log(message, 232323)
      return {
        ...state,
        list: [...state.list, message.id],
        entities: { ...state.entities, [message.id]: message },
      }
    },
  },
  initial.messages,
)

const data = createReducer(
  {
    [testData]: (state, payload) => {
      const { data } = payload
      return [...state, data]
    },
  },
  initial.data,
)

export default combineReducers({ app, users, messages, data })
