var tape = require('tape');

module.exports = function(db) {

  tape('no sublevels', function(t) {
    t.plan(9);
    run(t, function() {
      db = db.sublevel('one');
      t.end();
    });
  });

  tape('one sublevel', function(t) {
    t.plan(9);
    run(t, function() {
      db = db.sublevel('two');
      t.end();
    });
  });

  tape('two sublevels', function(t) {
    t.plan(9);
    run(t, t.end.bind(t));
  });

  function run(t, cb) {
    db.put('batch-1', 555, function (err) {
      t.error(err);

      var ops = [
        { type: 'put', key: 'batch-2', value: '444' },
        { type: 'del', key: 'batch-1' },
        { type: 'put', key: 'batch-3', value: '333' },
      ];

      db.batch(ops, function(err) {
        t.error(err);

        db.get('batch-1', function (err) {
          t.ok(err, 'batch-1 was deleted');

          db.get('batch-2', function (err, value) {
            t.error(err);
            t.equal(value, '444', 'batch-2 matches');

            db.get('batch-3', function (err, value) {
              t.error(err);
              t.equal(value, '333', 'batch-3 matches');

              db.del('batch-2', function (err) {
                t.error(err);

                db.del('batch-3', function (err) {
                  t.error(err);
                  t.end();
                });
              });
            });
          });
        });
      });
    });
  }

};
