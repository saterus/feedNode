var fs = require('fs'),
    jade = require('jade'),
    express = require('express'),
    app = express.createServer(),
    socket = require('socket.io').listen(app),
    Queue = require('./public/queue');

var applicationsFilePath = process.argv[2];

var max_queue_size = 10;

//fail fast if no arg was specified
if(!applicationsFilePath){
  console.error("You must enter the ApplicationsFile Path of your configuration file!");
  process.exit(1);
}

//read in configuration - we want synchronous so that everything is loaded before the server starts listening
try{
  var applicationFile = JSON.parse(fs.readFileSync(applicationsFilePath,'utf8'));

  var applications = {};

  applicationFile.forEach(function(app){
    applications[app.token] = app;
    console.log("ApplicationFileE: " + app);
    console.log("ApplicationFileE.token: " + app.token);
  });


  console.log("Applications Length: " + Object.keys(applications).length);


}catch(err){
  console.error(err.stack)
  console.error('Make sure the specified file exists and that it is formatted correctly!');
  process.exit(1);
}


// App Configuration
app.set('view engine', 'jade');
app.set('view options', {layout: false});

app.configure(function(){
  app.use(express.logger());
  app.use(express.static(__dirname + '/public'));
});



// Routes
app.get('/', function(req, res){
  res.render('index');
});

app.get('/queue_check', function(req, res) {
  res.send(queues, 200);
});

var queues = {};
queues['all'] = new Queue.Q(max_queue_size);

app.post('/:token/:msg', function(req, res){

  var token = req.params.token;
  console.log("Token: " + token);
  if(applications[token]){

    var item = {
      category: token,
      item: req.params.msg,
      timestamp: Date.now()
    };

    var q = queues[token];

    if(!q) {
      q = new Queue.Q(max_queue_size);
      queues[token] = q;
    }

    // add the new item to the right queue
    q.push(item);
    // add the new item to the 'all' queue
    queues['all'].push(item);

    // tell the client we received it
    res.send('yup',200);

    // tell everyone there is a new event
    socket.broadcast( { item: item} );

  }else{
    res.send('nope',403);
  }
});

// Client Connections
var activeClients = 0;

function clientDisconnect(client){
  activeClients -=1;
  client.broadcast( {
    clients: activeClients
  } );
}

socket.on('connection', function(client){

  activeClients +=1;

  socket.broadcast( {
    clients: activeClients
  } );

  client.send( {
    apps: applications
  });

  client.send( {
    queues: queues
  });

  client.on('disconnect', function(){
    clientDisconnect(client);
  });
});

app.listen(3000)

