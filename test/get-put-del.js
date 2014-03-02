var tape = require('tape');

module.exports = function(db) {
  
  tape('no sublevels', function(t) {
    t.plan(7);
    run(t, function() {
      db = db.sublevel('one');
      t.end();
    });
  });

  tape('one sublevel', function(t) {
    t.plan(7);
    run(t, function() {
      db = db.sublevel('two');
      t.end();
    });
  });

  tape('two sublevels', function(t) {
    t.plan(7);
    run(t, t.end.bind(t));
  });

  function run(t, cb) {
    db.put('get-put-del', '333', function(err) {
      t.error(err);
      t.pass('put callback ran');

      db.get('get-put-del', function(err, data) {
        t.error(err);
        t.equal(data, '333', 'get value matches put value');

        db.del('get-put-del', function(err) {
          t.error(err);
          t.pass('del callback ran');

          db.get('get-put-del', function(err) {
            t.ok(err, 'del works');
            cb();
          });
        });
      });
    });
  }

};
