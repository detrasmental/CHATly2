const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const exphbs = require('express-handlebars');
const session = require('express-session');
// const sequelize = require('sequelize');
const routes = require('./controllers/');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser,userLeave, 
      getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const chatLy = 'CHATly';

const PORT = process.env.PORT || 3001;

const sequelize = require('./config/connection');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sess = {
  secret: 'super secret secret',
  cookie: {},
  resave: false,
  saveUnitialized: true,
  store: new SequelizeStore({
    db: sequelize
  }) 
};




app.use(session(sess));

const hbs = exphbs.create({ });

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public')));
app.use(require('./controllers/'));

app.use(routes);




//connection from browser
io.on('connection', socket => {
  socket.on('joinRoom', ({username, room}) => {
      const user = userJoin(socket.id, username, room);
      socket.join(user.room);
// //Current user connects
socket.emit('message', formatMessage(chatLy, 'Welcome to Chatly'));
// When a new user connects
socket.broadcast.to(user.room).emit( 'message', formatMessage(chatLy, `${user.username} has joined the chat`));

io.to(user.room).emit('roomUsers', {
  room: user.room, users: getRoomUsers(user.room)
});
});


// Get chat messages
socket.on('chatMessage',msg => {
  const user = getCurrentUser(socket.id);
  io.to(user.room).emit('message', formatMessage(user.username, msg));
});
// Runs when client disconnects
socket.on('disconnect', () => {
  const user = userLeave(socket.id);

if (user) {
  io.to(user.room).emit('message', formatMessage(chatLy, `${user.username} has left the chat`));
  };
  io.to(user.room).emit('roomUsers', {
      room: user.room, users: getRoomUsers(user.room)
  });
  
});
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  sequelize.sync({
    force: false
  });
})
// sequelize.sync({ force: false }).then(() => {
//   app.listen(PORT, () => console.log('Now listening'));
// });
// db.sequelize.sync({force: true}).then(function () {
//   app.listen(PORT, function () {
//     console.log("APP LISTENING ON PORT " + PORT);
    

//    });
// })