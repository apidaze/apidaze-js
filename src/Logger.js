var Logger = function(debug, prefix) {
  this._debug = debug;
  this._prefix = prefix;

  this.log = function() {
    if (this._debug) {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(prefix + " ");
      console.log.apply(console, args);
    }
  };
};

export default Logger;
