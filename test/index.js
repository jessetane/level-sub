var level = require('level-test')();
var sublevel = require('../');
var db = sublevel(level('testdb'));

require('./get-put-del')(db);
require('./batch')(db);
require('./streams')(db);
