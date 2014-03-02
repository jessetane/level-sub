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

      put: function(key, value, opts, cb) {
        if (name) key = prefix + key;
        if (typeof opts === 'function') {
          cb = opts;
          opts = undefined;
        }
        return db.put(key, value, opts, cb);
      },

      get: function(key, opts, cb) {
        if (name) key = prefix + key;
        if (typeof opts === 'function') {
          cb = opts;
          opts = undefined;
        }
        return db.get(key, opts, cb);
      },

      del: function(key, opts, cb) {
        if (name) key = prefix + key;
        if (typeof opts === 'function') {
          cb = opts;
          opts = undefined;
        }
        return db.del(key, opts, cb);
      },

      batch: function (ops_, cb) {
        var ops = ops_.slice();
        for (var i = 0; i < ops.length; i++) {
          ops[i] = {
            key: prefix + ops_[i].key,
            type: ops_[i].type,
            value: ops_[i].value
          };
        }
        return db.batch(ops, cb);
      },

      createWriteStream: function(opts) {
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
      },

      createReadStream: function(opts) {
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
    };
  }
  
};
