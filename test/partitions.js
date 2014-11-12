var tape = require('tape');
var concat = require('concat-stream');

module.exports = function(db) {
  tape('partitions', function(t) {
    t.plan(6);

    db.put('a', 'a', function() {
      var sub1 = db.sublevel('one');
      
      sub1.put('b', 'b', function() {
        var sub2 = sub1.sublevel('two');
        
        sub2.put('c', 'c', function() {
          
          db.createReadStream().pipe(concat(function(data) {
            t.equals(data.length, 1);
            t.equals(data[0].key, 'a');
          }));
          
          sub1.createReadStream().pipe(concat(function(data) {
            t.equals(data.length, 1);
            t.equals(data[0].key, 'b');
          }));
          
          sub2.createReadStream().pipe(concat(function(data) {
            t.equals(data.length, 1);
            t.equals(data[0].key, 'c');
          }));
        });
      });
    });
  });
};
