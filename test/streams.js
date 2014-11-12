var tape = require('tape');
var concat = require('concat-stream');

var delay = 100;

module.exports = function(db) {

  tape('no sublevels', function(t) {
    t.plan(4);
    run(t, function() {
      db = db.sublevel('one');
      t.end();
    });
  });

  tape('one sublevel', function(t) {
    t.plan(4);
    run(t, function() {
      db = db.sublevel('two');
      t.end();
    });
  });

  tape('two sublevels', function(t) {
    t.plan(4);
    run(t, t.end.bind(t));
  });

  function run(t, cb) {
    var ws = db.createWriteStream();

    var expected = [
      { key: 'streams-1', value: '111' },
      { key: 'streams-2', value: '222' },
      { key: 'streams-3', value: '333' }
    ];
  
    for (var obj in expected) {
      obj = expected[obj];
      ws.write(obj);
    }

    setTimeout(function() {
      ws.write({ type: 'del', key: expected.shift().key });

      setTimeout(function() {
        var rs = db.createReadStream();

        rs.pipe(concat(function(data) {
          for (var i in data) {
            var chunk = data[i];
            var obj = expected.shift();
            t.equal(obj.key, chunk.key, 'key matches');
            t.equal(obj.value, chunk.value, 'value matches');
            ws.write({ type: 'del', key: obj.key });
          }
        }));
      }, delay);
    }, delay);
  }

};
