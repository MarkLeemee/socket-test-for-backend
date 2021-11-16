import { createAction } from 'redux-act'

export const login = createAction('login')
export const logout = createAction('logout')

export const addUser = createAction('add user')
export const removeUser = createAction('remove user')

export const newMessage = createAction('new message')
export const sendMessage = createAction('send message')

export const newData = createAction('new data')
export const sendData = createAction('send data')

export const newEmit = createAction('new emit')
