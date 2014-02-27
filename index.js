var thru = require('thru');
var sep = '\xff';

module.exports = function(db) {
  
  return sublevel();
  
  function sublevel(parent, name) {
    name = name || '';
    parent = parent || '';
    
    if (parent) {
      name = parent + sep + sep + name;
    }
    
    var prefix = sep + name + sep;
    
    return {
      sublevel: function(sub) {
        return sublevel(name, sub);
      },
      put: put,
      get: get,
      del: del,
      createWriteStream: createWriteStream,
      createReadStream: createReadStream,
      batch: function (ops_, cb) {
        var ops = ops_.slice();
        for (var i = 0; i < ops.length; i++) {
          ops[i].key = prefix + ops[i].key;
        }
        return db.batch(ops, cb);
      }
    };

    function put(key, value, opts, cb) {
      if (name) key = prefix + key;
      if (typeof opts === 'function') {
        cb = opts;
        opts = undefined;
      }
      return db.put(key, value, opts, cb);
    }
    
    function get(key, opts, cb) {
      if (name) key = prefix + key;
      if (typeof opts === 'function') {
        cb = opts;
        opts = undefined;
      }
      return db.get(key, opts, cb);
    }
    
    function del(key, opts, cb) {
      if (name) key = prefix + key;
      if (typeof opts === 'function') {
        cb = opts;
        opts = undefined;
      }
      return db.del(key, opts, cb);
    } 
    
    function createWriteStream(opts) {
      var ws = db.createWriteStream(opts);
      if (name) {
        var w = ws;
        ws = thru(function(obj, cb) {
          obj.key = prefix + obj.key;
          cb(null, obj);
        });
        w.on('error', ws.emit.bind(ws, 'error'));
        ws.pipe(w);
      }
      return ws;
    }

    function createReadStream(opts) {
      opts = opts || {};
      var end = '';
      
      if (name) {
        if (opts.start) opts.start = prefix + opts.start;
        else opts.start = prefix;
        end = prefix;
      }
      
      if (opts.end) opts.end = end + opts.end;
      else opts.end = end;
      opts.end += sep;
      
      var rs = db.createReadStream(opts);
      
      if (name) {
        var r = rs;
        rs = thru(function(obj, cb) {
          obj.key = obj.key.slice(prefix.length);
          cb(null, obj);
        });
        r.on('error', rs.emit.bind(rs, 'error'));
        r.pipe(rs);
      }
      
      return rs;
    }
  }
  
};
