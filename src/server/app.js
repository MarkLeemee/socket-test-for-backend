const express = require('express')
const app = express()
const port = 3000

const server = require('http').createServer(app)
const socket = require('./socket')

socket(server, app)

// Todo...
app.get('/some', (req, res) => {
  console.log('🐱🐱🐱 Server : some... 🐱🐱🐱')
  const io = app.get('io')
  io.emit('some', { id: 0 })
  res.send('Hello world')
})

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
