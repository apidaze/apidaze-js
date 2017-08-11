var Logger = function(debug, prefix){
  this._debug = debug;
  this._prefix = prefix;

  this.log = function(message){
    if (this._debug){
      console.log(this._prefix, message);
    }
  }
}

export default Logger;
