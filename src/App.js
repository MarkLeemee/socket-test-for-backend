import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { login, logout, sendMessage } from './actions'

const App = () => {
  const dispatch = useDispatch()
  const { username, users, messages, data } = useSelector((state) => ({
    username: state.app.username,
    users: state.users,
    messages: state.messages,
    data: state.data,
  }))

  const handleLogin = () => {
    const inputUsername = document.getElementById('login-username').value
    if (inputUsername && 0 < inputUsername.length) {
      dispatch(login({ username: inputUsername }))
    }
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  const handleSend = () => {
    const inputMessage = document.getElementById('msg-text').value
    dispatch(sendMessage({ text: inputMessage }))
  }

  return (
    <div>
      {username ? (
        <div>
          <div onClick={handleLogout}> Logout </div>
          {Object.keys(users).map((username, idx) => (
            <div key={`username__${idx}`}>{username}</div>
          ))}
        </div>
      ) : (
        <div>
          <input id="login-username" type="text" name="username" />
          <div onClick={handleLogin}> Login </div>
        </div>
      )}
      <input id="msg-text" type="text" name="message" />
      <div onClick={handleSend}> Send </div>
      {messages.list
        .map((id) => messages.entities[id])
        .map((item, idx) => (
          <div key={`message__${idx}`}>
            <div>{item.username}</div>
            <div>{item.text}</div>
          </div>
        ))}
    </div>
  )
}

export default App
