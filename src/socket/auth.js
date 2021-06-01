const io = require('@socket').io()

module.exports = (socket) => {
  socket.on('auth_listen', (hash) => {
    const size = roomSize(`AUTH_${hash}`)
    if (!size || size === 0) {
      socket.join(`AUTH_${hash}`)
      console.log(`[Socket] Joined client ${socket.id} to room #AUTH_${hash}`)
    } else {
      socket.emit('error', 'This login hash is no longer valid, please try again.')
    }
  })
}

const roomSize = (id) => {
  return io.sockets.adapter.rooms.get(id)?.size
}
