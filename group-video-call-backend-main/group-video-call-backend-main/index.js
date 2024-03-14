const express = require('express')
const app = express()
const server = require('http').createServer(app)

const io=require('socket.io')(server,{  //socket io server
  cors:true
})

const PORT = process.env.PORT || 4000

require('./db/connection')
const Users=require('./models/Users')

let socketList = {}

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const cors=require('cors')
app.use(cors())

// app.use(function (req,res,next){
//   res.header("Access-Control-Allow-Origin","*")
//   res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept")
//   next()
// })



// app.use(express.static(path.join(__dirname, 'public')))

// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/build')))

//   app.get('/*', function (req, res) {
//     res.sendFile(path.join(__dirname, '../client/build/index.html'))
//   })
// }


// Socket
io.on('connection', (socket)=>{
  console.log(`New User connected: ${socket.id}`)

  socket.on('disconnect', () => {
    socket.disconnect()
    console.log('User disconnected!')
  })

  socket.on('BE-check-user', ({ roomId, userName }) => {
    let error = false

    io.sockets.in(roomId).clients((err, clients) => {
      clients.forEach((client) => {
        if (socketList[client] == userName) {
          error = true
        }
      })
      socket.emit('FE-error-user-exist', { error })
    });
  });

  /**
   * Join Room
   */
  socket.on('BE-join-room', ({ roomId, userName }) => {
    // Socket Join RoomName
    socket.join(roomId)
    socketList[socket.id] = { userName, video: true, audio: true }

    // Set User List
    io.sockets.in(roomId).clients((err, clients) => {
      try {
        const users = []
        clients.forEach((client) => {
          // Add User List
          users.push({ userId: client, info: socketList[client] })
        })
        socket.broadcast.to(roomId).emit('FE-user-join', users)
        // io.sockets.in(roomId).emit('FE-user-join', users);
      } catch (e) {
        io.sockets.in(roomId).emit('FE-error-user-exist', { err: true })
      }
    })
  })

  socket.on('BE-call-user', ({ userToCall, from, signal }) => {
    io.to(userToCall).emit('FE-receive-call', {
      signal,
      from,
      info: socketList[socket.id],
    })
  })

  socket.on('BE-accept-call', ({ signal, to }) => {
    io.to(to).emit('FE-call-accepted', {
      signal,
      answerId: socket.id,
    })
  })

  socket.on('BE-send-message', ({ roomId, msg, sender }) => {
    io.sockets.in(roomId).emit('FE-receive-message', { msg, sender })
  })

  socket.on('BE-leave-room', ({ roomId, leaver }) => {
    delete socketList[socket.id]
    socket.broadcast
      .to(roomId)
      .emit('FE-user-leave', { userId: socket.id, userName: [socket.id] })
    io.sockets.sockets[socket.id].leave(roomId)
  })

  socket.on('BE-toggle-camera-audio', ({ roomId, switchTarget }) => {
    if (switchTarget === 'video') {
      socketList[socket.id].video = !socketList[socket.id].video
    } else {
      socketList[socket.id].audio = !socketList[socket.id].audio
    }
    socket.broadcast
      .to(roomId)
      .emit('FE-toggle-camera', { userId: socket.id, switchTarget })
  })
})


//Routes
app.get('/',cors(),(req,res)=>{
  res.send('Backend')
})

app.post('/signup',cors(),async (req,res)=>{
  // console.log(res)
  const{name,email,pass}=req.body
  try{
      const check=await Users.findOne({email:email})
      if(check){
          res.json('exists')
      }else{
          res.json('notexists')
          const data={
              name:name,
              email:email,
              pass:pass
          }
          await Users.insertMany([data])
      }
  }catch(e){
      console.log(e)
      res.json('notexists')
  }
})

app.post('/signin',cors(),async (req,res)=>{
  const{email,pass}=req.body
  try{
      const check=await Users.findOne({email:email})
      if(check){
          if(check.pass===pass){
              res.json('authorize')
          }else{
              res.json('wrongpass')
          }
      }else{
          res.json('notexists')
      }
  }catch(e){
      res.json('notexists')
  }
})

app.get('/user/:email',cors(), async (req, res) => {
  try {
    const email = req.params.email
    const user = await Users.findOne({ email })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ name: user.name })
  } catch (error) {
    console.error('Error fetching user by email:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})


server.listen(PORT, () => {
  console.log(`Connected : ${PORT}`);
})
