import * as WebRTCAdapter from "webrtc-adapter";

var __VERSION__ = "dev-" + process.env.__VERSION__ // webpack defineplugin variable

// somewhere in module
console.log("WebRTC : " + JSON.stringify(WebRTCAdapter.browserDetails));

var STATUS_INIT =                 1;
var STATUS_WSOPENED =             2;
var STATUS_LOCALSTREAM_ATTACHED = 4;
var STATUS_NOTREADY =             8;
var STATUS_CANDIDATES_RECEIVED =  16;
var LOG_PREFIX = 'APIdaze-' + __VERSION__ + ' | ' + 'CLIENT' + ' |';

var CLIENT = function(configuration){
  let { type, wsurl, onReady, onDisconnected, onError, status = STATUS_INIT } = configuration;

  if (!"WebSocket" in window) {
    throw {ok: false, message: "WebSocket not supported"};
  }

  if (!/wss:\/\//.test(wsurl)) {
    throw {ok: false, message: "Wrong WebSocket URL, must start with wss://"};
  }

  this._type = type;
  this._status = status;

  // User defined handlers
  this._onDisconnected = onDisconnected || function(){ console.log(LOG_PREFIX, "Disconnected") };
  this._onReady = onReady || function(){ console.log(LOG_PREFIX, "Ready") };
  this._onError = onError || function(){ console.log(LOG_PREFIX, "Error") };

  this._websocket = new WebSocket(wsurl);
  this._websocket.onopen = handleWebSocketOpen.bind(this);
  this._websocket.onerror = handleWebSocketError.bind(this);
  this._websocket.onmessage = handleWebSocketMessage.bind(this);
  this._websocket.onclose = handleWebSocketClose.bind(this);

  console.log("OK")
}

CLIENT.prototype.type = function() {
  return this._type;
}

CLIENT.prototype.version = __VERSION__

/**
 * Log connection event and update status
 */
const handleWebSocketOpen = function(){
  console.log(LOG_PREFIX, "handleWebSocketOpen |", "WebSocket opened");
  this._status *= STATUS_WSOPENED;
}

/**
 * Call CLIENT.onError() and throw error
 */
const handleWebSocketError = function(err){
  console.log(LOG_PREFIX, "handleWebSocketError |", "Error ");
  this._onError(error);
}

/**
 * Handle messages from mod_verto
 */
const handleWebSocketMessage = function(event){
  console.log(LOG_PREFIX, "handleWebSocketMessage |", event);
}

 /**
  * Log connection event, update status, call CLIENT.onDisconnected()
  */
const handleWebSocketClose = function(err){
  console.log(LOG_PREFIX, "handleWebSocketClose |", "WebSocket closed");
  this._status = STATUS_INIT;
  this._onDisconnected();
}

export default CLIENT
