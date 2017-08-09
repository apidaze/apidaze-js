import * as WebRTCAdapter from "webrtc-adapter";
import Call from './Call.js';

var __VERSION__ = "dev-" + process.env.__VERSION__ // webpack defineplugin variable

// somewhere in module
console.log("WebRTC : " + JSON.stringify(WebRTCAdapter.browserDetails));

var STATUS_INIT =                 1;
var STATUS_WSOPENED =             2;
var STATUS_RECVD_PONG =           4;
var STATUS_NOTREADY =             8;
var LOG_PREFIX = 'APIdaze-' + __VERSION__ + ' | CLIENT |';

var CLIENT = function(configuration){
  let { type, wsurl, onReady, onDisconnected, onError, status = STATUS_INIT } = configuration;

  // User defined handlers
  this._onDisconnected = onDisconnected || function(){ console.log(LOG_PREFIX, "Disconnected") };
  this._onReady = onReady || function(){ console.log(LOG_PREFIX, "Ready") };
  this._onError = function(message){
    typeof onError === "function" ? onError(message) : console.log(LOG_PREFIX, "Error :", message);
    throw {ok: false, message: message}
  };

  if (!"WebSocket" in window) {
    this._onError("WebSocket not supported")
  }

  if (!/wss:\/\//.test(wsurl)) {
    this._onError("Wrong WebSocket URL, must start with wss://")
  }

  this._callArray = [];
  this._type = type;
  this._status = status;

  this._websocket = new WebSocket(wsurl);
  this._websocket.onopen = handleWebSocketOpen.bind(this);
  this._websocket.onerror = handleWebSocketError.bind(this);
  this._websocket.onmessage = handleWebSocketMessage.bind(this);
  this._websocket.onclose = handleWebSocketClose.bind(this);
}

CLIENT.prototype.type = function() {
  return this._type;
}

CLIENT.prototype.version = __VERSION__

CLIENT.prototype.sendMessage = function(json){
  console.log(LOG_PREFIX, "handleWebSocketMessage | C->S :", json);
  this._websocket.send(json);
}

CLIENT.prototype.call = function(params, listeners){
  try {
    var callObj = new Call(this, params, listeners);
    this._callArray.push(callObj);
    return callObj;
  } catch(error){
    this._onError(error);
  }
}

/**
* Log connection event and update status
*/
const handleWebSocketOpen = function(){
  console.log(LOG_PREFIX, "handleWebSocketOpen |", "WebSocket opened");
  this._status *= STATUS_WSOPENED;

  var request = {};
  request.wsp_version = "1";
  request.method = "ping";
  request.params = {};
  this.sendMessage(JSON.stringify(request));
}

/**
* Call CLIENT.onError() and throw error
*/
const handleWebSocketError = function(){
  console.log(LOG_PREFIX, "handleWebSocketError |", "Error ");
  this._onError("WebSocket error");
}

/**
* Handle messages from mod_verto
*/
const handleWebSocketMessage = function(event){
  console.log(LOG_PREFIX, "handleWebSocketMessage | S->C :", event.data);
  let json = JSON.parse(event.data);

  if (json.result) {
    // Process reponse after request from gateway
    if (json.result.message) {
      switch (json.result.message) {
        case "pong":
        this._status *= STATUS_RECVD_PONG;
        this._onReady();
        return;
        default:
        break;
      }
    }
  }

  if (json.method && json.method === "answer" && json.params && json.params.sdp) {
    this._callArray[0].setRemoteDescription(json.params.sdp);
  }
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
