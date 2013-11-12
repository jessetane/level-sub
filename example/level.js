var level = require('level');
var destroy = require('leveldown').destroy;
var sublevel = require('../');

var dbname = __dirname + '/test.db';
var serverdb = level(dbname);

var db = sublevel(serverdb);
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

rs.on('end', function() {
  serverdb.close();
  destroy(dbname, function() {});
});
