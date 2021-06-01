/** 
    @author Mingjie Jiang
    Socket.io routing file
 */

let io = null

exports.init = (http) => {
  io = require('socket.io')(http)

  io.on('connection', (socket) => {
    console.log(`[Socket] ${socket.id} connected`)
    require('@socket/auth')(socket)
  })

  return io
}

exports.io = () => io
