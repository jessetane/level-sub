# level-sub
minimalist implementation of [`level-sublevel`](https://github.com/dominictarr/level-sublevel)

## why
so you can create sublevels from a [`multilevel`](https://github.com/juliangruber/multilevel) client

## how
```javascript
var net = require('net');
var level = require('level');
var multilevel = require('multilevel');
var sublevel = require('../');

var port = 3000;

// multilevel server
var dbname = __dirname + '/test.db';
var serverdb = level(dbname);
var server = net.createServer(function (con) {
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
      
  var rs = db.createReadStream();
  rs.on('data', console.log);  // { key: 'table', value: 'meta infos' }

  rs = table.createReadStream();
  rs.on('data', console.log);  // { key: 'row1', value: 'row data' }
                               // { key: 'row2', value: 'row data' }
});
```

## api
supports the minimum useful subset of `levelup` / `level-sublevel` apis:
* `sublevel()`
* `put()`
* `get()`
* `del()`
* `createReadStream()`
* `createWriteStream()`

## notes  
should produce 100% [`level-sublevel`](https://github.com/dominictarr/level-sublevel) compatible leveldbs

## license
WTFPL