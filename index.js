var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendfile('canoa.html');
});

app.get('/remo', function(req, res){
  res.sendfile('remo.html');
});


io.on('connection', function(socket){  
  socket.on('acc', function(msg){
    io.emit('acc', msg);
  });
});

http.listen(process.env.PORT || 3000, function(){
  console.log(`Listening on ${ process.env.PORT }`);
});

