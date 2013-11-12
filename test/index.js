var tape = require('tape');
var level = require('level');
var leveldown = require('leveldown');
var s1 = require('level-sublevel');
var s2 = require('../');

var writeoutput = '';
var readoutput = '';

var debug = false;

setup(false); // once for read
setup(true);  // once for write

function setup(mode) {
  var dbname = __dirname + (mode ? '/write-test.db' : '/read-test.db');
  var og = level(dbname);
  var db1 = mode ? s2(og) : s1(og);
  var db2 = mode ? s1(og) : s2(og);
  
  var writer, reader;
  var tested = [];
  
  ///////////////////////////////////////////
  
  tape('base', function(t) {
    t.plan(3);

    var w = db1.createWriteStream();
    
    w.write({
      key: 'lib',
      value: 'modules?'
    });

    read(db1, db2, function(err, r1, r2) {
      t.error(err);
      t.notEqual(r1, '');
      t.equal(r2, r1);
      
      tested.push(db1, db2);
      t.end();
    });
  });

  ///////////////////////////////////////////

  tape('one sublevel', function(t) {
    t.plan(3);

    writer = db1.sublevel('lib');
    reader = db2.sublevel('lib');
    
    var w = writer.createWriteStream();
    
    w.write({
      key: 'node_modules',
      value: 'could be modules'
    });
    
    read(writer, reader, function(err, r1, r2) {
      t.error(err);
      t.notEqual(r1, '');
      t.equal(r2, r1);
      
      tested.push(writer, reader);
      t.end();
    });
  });

  ///////////////////////////////////////////

  tape('two sublevels', function(t) {
    t.plan(3);

    writer = writer.sublevel('node_modules');
    reader = reader.sublevel('node_modules');
    
    var w = writer.createWriteStream();
    
    w.write({
      key: 'level',
      value: 'a leveldb module!'
    });

    // check first level (lib)
    read(writer, reader, function(err, r1, r2) {
      t.error(err);
      t.notEqual(r1, '');
      t.equal(r2, r1);
      
      tested.push(writer, reader);
      t.end();
    });
  });

  ///////////////////////////////////////////

  tape('three sublevels', function(t) {
    t.plan(3);
    
    writer = writer.sublevel('level');
    reader = reader.sublevel('level');
    
    var w = writer.createWriteStream();
    
    w.write({
      key: 'package.json',
      value: 'package meta infos'
    });
    
    read(writer, reader, function(err, r1, r2) {
      t.error(err);
      t.notEqual(r1, '');
      t.equal(r2, r1);

      tested.push(writer, reader);
      t.end();
    });
  });

  ///////////////////////////////////////////

  tape('check all', function(t) {
    t.plan(tested.length * 1.5);
    
    for (var i=0; i<tested.length; i+=2) {
      var db1 = tested[i];
      var db2 = tested[i+1];
      (function(i) {
        read(db1, db2, function(err, r1, r2) {
          t.error(err);
          t.notEqual(r1, '');
          t.equal(r2, r1);
          
          if (i === tested.length - 2) {
            t.end();
            finish();
          }
        });
      })(i);
    }
  });

  /////////////////////////////////////////// helper
  
  function read(db1, db2, cb) {
    setTimeout(function() {

      var rs = db1.createReadStream();
      var r = [];
      rs.on('data', function(d) { r.push(d) });
      rs.on('error', function(err) { cb(err); cb = null });
      rs.on('end', function() {
        if (cb && db2) {
          read(db2, null, function(err, r2) {
            r = r.length ? JSON.stringify(r) : '';
            r2 = r2.length ? JSON.stringify(r2) : '';
            cb(err, r, r2);
          });
        } else {
          cb && cb(null, r);
        }
      });

    }, 100);
  }

  function finish() {
    if (debug) {
      var rs = og.createReadStream();   // dump the db
      
      console.log('======= debug ======='); 
      rs.on('data', function(d) { console.log(d) });
      rs.on('end', function() {
        console.log('=====================');
        cleanup();
      });
    }
    else {
      cleanup();
    }
  }
  
  function cleanup() {
    og.close(function() {
      leveldown.destroy(dbname, function(err) {});
    });
  }

};
