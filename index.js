var thru = require('thru');
var sep = '\xFF';

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
      createWriteStream: createWriteStream,
      createReadStream: createReadStream
    };
    
    function createWriteStream(opts) {
      var ws = db.createWriteStream(opts);
      if (name) {
        var w = ws;
        ws = thru(function(obj, cb) {
          obj.key = prefix + obj.key;
          cb(null, obj);
        });
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
        r.pipe(rs);
      }
      
      return rs;
    }
  }
  
};
