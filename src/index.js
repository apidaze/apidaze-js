import * as WebRTCAdapter from "webrtc-adapter";
// somewhere in module
console.log("WebRTC : " + JSON.stringify(WebRTCAdapter.browserDetails));

let version = "2.0"

var CLIENTBIS = function(configuration){
  let { type } = configuration;
  this._type = type;
}

CLIENTBIS.prototype.type = function() {
  return this._type;
}

Object.defineProperties(CLIENTBIS, {
  version: {
    get: function(){ return '2.0'; }
  }
})

export {
  version,
  CLIENTBIS
}
