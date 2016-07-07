var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('files'));

app.get('/', function(req, res){
  res.sendfile('barco.html');
});

app.get('/remo', function(req, res){
  res.sendfile('remo.html');
});


io.on('connection', function(socket){  
  socket.on('acc', function(msg){
    io.emit('alpha', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});