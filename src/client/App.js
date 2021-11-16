import React from 'react'
import styled from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'
import { login, logout, sendMessage, sendData, newEmit } from './actions'

const MainContainer = styled.div`
  display: flex;
  margin: 50px 100px;
`

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 50px;
`

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const InputBox = styled.div`
  display: flex;
  margin-top: 0.5em;
`

const Button = styled.button`
  width: 10em;
  height: 5em;
`

const TextInput = styled.input.attrs({
  type: 'text',
})`
  width: 30em;
  height: 5em;
  margin-right: 0.5em;
`

const Text = styled.span`
  margin-bottom: 0.5em;
`

const App = () => {
  const dispatch = useDispatch()
  const { username, users, messages } = useSelector((state) => ({
    username: state.app.username,
    users: state.users,
    messages: state.messages,
  }))

  const handleLogout = () => {
    dispatch(logout())
  }

  const handleLogin = () => {
    const inputUsername = document.getElementById('login-username').value
    if (inputUsername && 0 < inputUsername.length) {
      dispatch(login({ username: inputUsername }))
    }
  }

  const handleSendMessage = () => {
    const inputMessage = document.getElementById('msg-text').value
    dispatch(sendMessage({ text: inputMessage }))
    document.getElementById('msg-text').value = ''
  }

  const handleSendData = () => {
    const inputData = document.getElementById('socket-data').value
    dispatch(sendData({ data: inputData }))
    document.getElementById('socket-data').value = ''
  }

  const handleEmit = () => {
    const inputData = document.getElementById('socket-data').value
    const inputEvent = document.getElementById('socket-emit').value
    dispatch(newEmit({ evetn: inputEvent, data: inputData }))
    document.getElementById('socket-data').value = ''
    document.getElementById('socket-emit').value = ''
  }

  return (
    <>
      {username ? (
        <MainContainer>
          <InputContainer>
            <Button onClick={handleLogout}> logout </Button>
            <h3>Message 전송</h3>
            <InputBox>
              <TextInput
                id="msg-text"
                name="message"
                placeholder="message를 입력하세요."
              />
              <Button onClick={handleSendMessage}> send message </Button>
            </InputBox>
            <h3>Data(JSON) 전송</h3>
            <InputBox>
              <TextInput
                id="socket-data"
                name="data"
                placeholder="JSON 타입으로 입력하세요."
              />
              <Button onClick={handleSendData}> send (JSON) data</Button>
            </InputBox>
            <h3>Emit 발생</h3>
            <InputBox>
              <TextInput
                id="socket-emit"
                name="emit"
                placeholder="emit명을 입력하세요."
              />
              <Button onClick={handleEmit}> new emit </Button>
            </InputBox>
          </InputContainer>
          <MessageContainer>
            <h3>참여자 리스트</h3>
            {Object.keys(users).map((username, idx) => (
              <Text key={`username__${idx}`}>{username}</Text>
            ))}
            <h3>메세지</h3>
            {messages.list
              .map((id) => messages.entities[id])
              .map((item, idx) => (
                <Text key={`message__${idx}`}>
                  {`${item.username} : ${item.text}`}
                </Text>
              ))}
          </MessageContainer>
        </MainContainer>
      ) : (
        <div>
          <TextInput
            id="login-username"
            name="username"
            placeholder="id를 입력하세요."
          />
          <Button onClick={handleLogin}> login </Button>
        </div>
      )}
    </>
  )
}

export default App
