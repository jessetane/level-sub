var net = require('net');
var level = require('level-test')();
var multilevel = require('multilevel');
var sublevel = require('../');

var port = 3000;

// multilevel server
var dbname = 'exampledb';
var serverdb = level(dbname);
var server = net.createServer(function(con) {
  con.pipe(multilevel.server(serverdb)).pipe(con);
}).listen(port);

// multilevel client
var clientdb = multilevel.client();
var client = net.connect(port);
client.pipe(clientdb.createRpcStream()).pipe(client);
client.on('connect', function() {

  var db = sublevel(clientdb);
  var ws = db.createWriteStream();
  ws.write({ key: 'table', value: 'meta infos' });
  
  var table = db.sublevel('table');
  ws = table.createWriteStream();
  ws.write({ key: 'row1', value: 'row data' });
  ws.write({ key: 'row2', value: 'row data' });
  
  setTimeout(function() {
    
    var rs = db.createReadStream();
    rs.on('data', console.log);  // { key: 'table', value: 'meta infos' }
  
    rs = table.createReadStream();
    rs.on('data', console.log);  // { key: 'row1', value: 'row data' }
                                 // { key: 'row2', value: 'row data' }
    rs.on('end', function() {
      server.close();
      client.destroy();
    });
    
  }, 100);
});
