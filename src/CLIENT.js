import Call from './Call.js';
import Utils from './Utils.js';
import Logger from './Logger.js';

var __VERSION__ = process.env.VERSIONSTR // webpack defineplugin variable

var STATUS_INIT =                 1;
var STATUS_READY =                2;
var LOG_PREFIX = 'APIdaze-' + __VERSION__ + ' | CLIENT |';
var LOGGER = new Logger(false, LOG_PREFIX);

var CLIENT = function(configuration = {}){
  let {
    apiKey,
    wsurl,
    sessid = null,
    onReady,
    onDisconnected,
    onError,
    debug,
    userKeys = {}
  } = configuration;

  this.speedTest = speedTest.bind(this);
  this.ping = ping.bind(this);
  this.shutdown = shutdown.bind(this);

  // User defined handlers
  this._onDisconnected = function(){
    typeof onDisconnected === "function" && onDisconnected();
    LOGGER.log("Disconnected")
  };
  this._onReady = function(){
    this._status += STATUS_READY;
    LOGGER.log("Ready");
    typeof onReady === "function" && onReady();
  };
  this._onError = function(errorObj){
    /**
    * We may receive errors from FreeSWITCH over the WebSocket channel, in
    * this case, any exception thrown would be un-catchable. Such errors
    * are marcked with a type === "async". For more details, see :
    * https://stackoverflow.com/questions/16316815/catch-statement-does-not-catch-thrown-error
    */
    typeof onError === "function" ? onError(errorObj.message) : LOGGER.log("Error : " + errorObj.message);

    if (errorObj.type !== "async"){
      throw {ok: false, message: errorObj.message, origin: errorObj.origin}
    }
  };

  if (debug) {
    this.debug = true;
    LOGGER._debug = true;
  } else {
    this.debug = false;
  }

  if (!apiKey){
    this._onError({origin: "CLIENT", message: "Please provide an apiKey"})
  }

  if (!"WebSocket" in window) {
    this._onError({origin: "CLIENT", message: "WebSocket not supported"})
  }

  if (!/wss:\/\//.test(wsurl)) {
    this._onError({origin: "CLIENT", message: "Wrong WebSocket URL, must start with wss://"})
  }

  this._callArray = [];
  this._apiKey = apiKey;
  this._status = STATUS_INIT;
  this._sessid = sessid;
  this._userKeys = userKeys

  this._websocket = new WebSocket(wsurl);
  this._websocket.onopen = handleWebSocketOpen.bind(this);
  this._websocket.onerror = handleWebSocketError.bind(this);
  this._websocket.onmessage = handleWebSocketMessage.bind(this);
  this._websocket.onclose = handleWebSocketClose.bind(this);
}

CLIENT.prototype.version = __VERSION__

CLIENT.prototype._sendMessage = function(json){

  if (this._websocket.readyState !== this._websocket.OPEN){
    this._onError({origin: "CLIENT", message: "Client is not ready (WebSocket not open)"});
    return;
  }

  if ((this._status & STATUS_READY) === 0 && JSON.parse(json).method !== "ping"){
    this._onError({
      origin: "CLIENT",
      message: "Client is not ready (hello not received from server)"
    });
    return;
  }

  LOGGER.log("handleWebSocketMessage | C->S : " + json);
  this._websocket.send(json);
}

CLIENT.prototype.call = function(params, listeners = {}){
  try {
    var callObj = new Call(this, null, params, listeners);
    this._callArray.push(callObj);
    return callObj;
  } catch(error){
    error.origin = "call";
    error.type = "async";
    this._onError(error);
  }
}

CLIENT.prototype.reattach = function(callID, params, listeners = {}){
  try {
    var callObj = new Call(this, callID, params, listeners);
    this._callArray.push(callObj);
    return callObj;
  } catch(error){
    error.origin = "reattach";
    error.type = "async";
    this._onError(error);
  }
}
/**
* Log connection event and update status
*/
const handleWebSocketOpen = function(){
  LOGGER.log("handleWebSocketOpen | WebSocket opened");

  var request = {};
  request.wsp_version = "1";
  request.method = "ping";
  request.params = {
    apiKey: this._apiKey,
    sessid: this._sessid,
    userKeys: this._userKeys
  };
  this._sendMessage(JSON.stringify(request));
}

/**
* Call CLIENT.onError() and throw error
*/
const handleWebSocketError = function(){
  LOGGER.log("handleWebSocketError | Error ");
  this._onError({type: "async", origin: "CLIENT", message: "WebSocket error"});
}

/**
* Handle messages from mod_verto
*/
const handleWebSocketMessage = function(event){
  LOGGER.log("handleWebSocketMessage | S->C : " + event.data);

  // Special sub proto
  if (event.data[0] == "#" && event.data[1] == "S" && event.data[2] == "P") {
      if (event.data[3] == "U") {
          this.up_dur = parseInt(event.data.substring(4));
      } else if (event.data[3] == "D") {
          this.down_dur = parseInt(event.data.substring(4));

          var up_kps = (((this._speedBytes * 8) / (this.up_dur / 1000)) / 1024).toFixed(0);
          var down_kps = (((this._speedBytes * 8) / (this.down_dur / 1000)) / 1024).toFixed(0);

          console.info("Speed Test: Up: " + up_kps + "kbit/s Down: " + down_kps + "kbits/s");

          if (typeof this._speedCB === "function"){
            this._speedCB({upDur: this.up_dur, downDur: this.down_dur, upKPS: up_kps, downKPS: down_kps });
            this._speedCB = null;
          }
      }

      return;
  }

  var json = JSON.parse(event.data);

  if (json.error) {
    if (json.error.message === "Permission Denied" && json.error.code === -32602) {
      LOGGER.log("Not allowed to login");
      this._onError({type: "async", origin: "CLIENT", message: "Not allowed to login"})
      return;
    }
  }

  // Handle echo reply to our echo request
  if (json.result && json.result.type === "echo_request"){
    handleEchoReply.call(this, json);
    return;
  }

  // Handle response to our initial 'subscribe_message' request
  if (/^subscribe_message/.test(json.id)){
    let callID = json.id.split('|')[1];
    handleSubscribeFromVerto.call(this, json, callID);
    return;
  }

  // Handle response to our initial 'conference blabla list' request
  if (/^conference_list_command/.test(json.id)){
    let callID = json.id.split('|')[1];
    handleConferenceListResponse.call(this, json, callID);
    return;
  }

  if (json.result) {
    // Process reponse after request from gateway
    if (json.result.message) {
      let callID = null; // generated by APIdaze
      let sessid = null; // gotten back from FreeSWITCH, identifies the WebSocket
      let index = -1;
      switch (json.result.message) {
        case "pong":
//        this._status *= STATUS_RECVD_PONG;
        return;

        case "CALL CREATED":
        LOGGER.log("Got CALL CREATED event");
        callID = json.result.callID;
        sessid = json.result.sessid;
        index = this._callArray.findIndex(function(callObj){
          return callObj.callID === callID;
        });
        if (index < 0){
          LOGGER.log("Cannot find call with callID " + callID);
        } else {
          LOGGER.log("Call created with callID " + callID + " and sessid " + sessid);
          this._callArray[index].sessid = sessid;
          this._sessid = sessid;
        }
        return;

        case "CALL ENDED":
        LOGGER.log("Got CALL ENDED event");
        callID = json.result.callID;
        index = this._callArray.findIndex(function(callObj){
          return callObj.callID === callID;
        });
        if (index < 0){
          LOGGER.log("Cannot find call with callID " + callID)
        } else {
          LOGGER.log("Call ended with callID " + callID);
        }
        this._callArray[index]._onHangup();
        this._callArray[index] = null;
        this._callArray.splice(index, 1);
        return;

        default:
        break;
      }
    }

    if (json.result.action) {
      switch(json.result.action){
        case "sendDTMF":
        LOGGER.log("DTMF sent");
        return;
        default:
        return;
      }
    }
  }

  if (json.method === "event"){
    handleVertoEvent.call(this, json);
    return;
  }

  if (json.method === "verto.clientReady"){
    this._onReady();
    return;
  }

  let callID = json.params.callID;
  let index = this._callArray.findIndex(function(callObj){
    return callObj.callID === callID;
  });

  if (index < 0){
    LOGGER.log("Cannot find call with callID " + callID)
  }

  /**
  * FreeSWITCH can send us its SDP from various actions :
  * media (early media)
  * answer
  * ringing (if using <ringtone/> or <ringback/> from the API)
  *
  * We need to check whenever we get an SDP from FreeSWITCH and
  * call setRemoteDescription right way
  */
  switch(json.method){
    case "ringing":
    LOGGER.log("Ringing on call with callID " + this._callArray[index].callID);
    // FS may send SDP along with ringing event
    if (json.params.sdp){
      this._callArray[index].setRemoteDescription(json.params.sdp);
    }
    this._callArray[index]._onRinging();
    break;

    case "media":
    // In this case, we consider the call is ringing
    LOGGER.log("Found call index : " + index);
    if (json.params.sdp){
      this._callArray[index].setRemoteDescription(json.params.sdp);
    }
    this._callArray[index]._onRinging();
    break;

    case "answer":
    LOGGER.log("Found call index : " + index);
    if (json.params.sdp){
      this._callArray[index].setRemoteDescription(json.params.sdp);
    }
    this._callArray[index]._onAnswer();
    break;

    case "hangup":
    LOGGER.log("Hangup call with callID " + this._callArray[index].callID);
    this._callArray[index]._onHangup();
    this._callArray[index] = null;
    this._callArray.splice(index, 1);
    break;

    case "verto.attach":
    // We are re-attaching this session to an existing call in FreeSWITCH
    LOGGER.log("Re-attaching to call with ID : " + callID);
    LOGGER.log("Call index is " + (index < 0) ? "OK" : "Not OK");
    this._reattachParams = json.params;

    default:
    LOGGER.log("No action for this message");
  }
}

/**
* Handle events from mod_verto here
*
* The main purpose is to handle conference events, but one may expect to
* get other events here.
*/
const handleVertoEvent = function(event){
  var params = event.params;

  LOGGER.log("Received event of type " + params.eventType);
  LOGGER.log("Event channel UUID : " + params.eventChannelUUID);
  LOGGER.log("Event channel : " + params.eventChannel);
  var index = this._callArray.findIndex(function(callObj){
    return callObj.callID === params.eventChannelUUID;
  });

  if (index >= 0){
    // This is an event generated by one of our sessions (not a conference)
    LOGGER.log("Need to handle simple event");
    if (params.pvtData.action === "conference-liveArray-join"){
      /**
      * We receive this message the first time we join the conference.
      * Two actions performed :
      * - Send a subscribe message to FreeSWITCH in order to get all the
      *   conference events from this conference
      * - Retrieve list of current participants in the room
      */
      let request = {};
      request.wsp_version = "1";
      request.method = "verto.subscribe";
      request.id = "subscribe_message|" + this._callArray[index].callID;
      request.params = {
        eventChannel: [
          event.params.pvtData.laChannel,
          event.params.pvtData.chatChannel,
          event.params.pvtData.infoChannel
        ],
        subParams: {}
      };
      this._sendMessage(JSON.stringify(request));

      request.wsp_version = "1";
      request.method = "jsapi";
      request.id = "conference_list_command|" + this._callArray[index].callID;;
      request.params = {
        command: "fsapi",
        data: {
          cmd: "conference",
          arg: event.params.pvtData.laName + " list"
        }
      };
      this._sendMessage(JSON.stringify(request));

      /**
      * Set parameters to our callObj
      * - callType to 'conference'
      * - conferenceMemberID identifies me in the conference
      */
      this._callArray[index].callType = "conference";
      this._callArray[index].conferenceMemberID = parseInt(event.params.pvtData.conferenceMemberID);
      this._callArray[index].conferenceName = event.params.pvtData.laName;
    }

    return;
  }

  if (index < 0){
    /**
    * Could not find call that matches with eventChannelUUID, try to find
    * a match using eventChannel. This occurs in the following cases :
    * - a liveArray event indicating who's talking, entering, leaving the room
    *   has been received
    * - a group chat message is the room has been received
    */
    index = this._callArray.findIndex(function(callObj){
      return callObj.subscribedChannelsArray.indexOf(params.eventChannel) >= 0;
    });
  }

  if (index >= 0){
    if (/^conference-liveArray/.test(event.params.eventChannel)){
      console.log("event.params.data : ", JSON.stringify(event.params.data));

      let data = event.params.data.data;
      switch(event.params.data.action){
        case "modify":
        // Who is talking events are received here
        this._callArray[index]._onRoomTalking(data);
        break;
        case "add":
        // Some joined the conference
        this._callArray[index]._onRoomAdd(data);
        break;
        case "del":
        // Someone left the conference
        this._callArray[index]._onRoomDel(data);
        break;
      }
    } else if (/^conference-chat/.test(event.params.eventChannel)){
      // group chat message received
      this._callArray[index]._onRoomChatMessage(event.params.data);
    }

    return;
  }

  this._onError({
    type: "async",
    message: "Failed to find call object that matches with conf event",
    origin: "conference"
  });
}

/**
* Handle response from FreeSWITCH to our initial verto.subscribe request
*/
const handleSubscribeFromVerto = function(event, callID){
  var index = this._callArray.findIndex(function(callObj){
    return callObj.callID === callID;
  });

  if (index < 0){
    LOGGER.log("Cannot find a call object that matches with sessid " + event.sessid);
    throw {ok: false, message: "Failed to process reply to subscribe"}
  }

  /**
  * I hope FreeSWITCH dumps the channels in the same order :
  * - laChannel : LiveArray, all events from the conference
  * - chatChannel : chat messages
  * - infoChannel : info ?
  */
  this._callArray[index].subscribedChannels = {}
  this._callArray[index].subscribedChannels.laChannel = event.result.subscribedChannels[0];
  this._callArray[index].subscribedChannels.chatChannel = event.result.subscribedChannels[1];
  this._callArray[index].subscribedChannels.infoChannel = event.result.subscribedChannels[2];
  this._callArray[index].subscribedChannelsArray = event.result.subscribedChannels;
}

/**
* Handle response from FreeSWITCH to our 'conference_list_command'
*
* We just get the list of the participants in the conference room we're joining.
*/
const handleConferenceListResponse = function(event, callID){
  var index = this._callArray.findIndex(function(callObj){
    return callObj.callID === callID;
  });

  if (index < 0){
    LOGGER.log("Cannot find a call object that matches with sessid " + event.sessid);
    throw {ok: false, message: "Failed to process reply to conference_list_command"}
  }

  LOGGER.log("Got members " + JSON.stringify(event));
  var members = [];
  var lines = event.result.message.split('\n');
  for (var idx = 0; idx < lines.length - 1; idx++) {
    var elems = lines[idx].split(';');
    members.push({
      sessid: elems[2],
      nickname: elems[3],
      caller_id_number: elems[4],
      conferenceMemberID: elems[0],
      talking_flags: elems[5]
    });
  }

  this._callArray[index]._onRoomMembersInitialList(members);
}

/**
* Log connection event, update status, call CLIENT.onDisconnected()
*/
const handleWebSocketClose = function(err){
  LOGGER.log("handleWebSocketClose | WebSocket closed");
  this._status = STATUS_INIT;
  this._onDisconnected();
}

const handleEchoReply = function(event) {
  var now = Date.now();
  var rtt = now - parseInt(event.result.time);
  LOGGER.log("handleEchoReply RTT : " + rtt + "ms");

  if (typeof this._pingCallback === "function") {
    this._pingCallback(rtt);
    this._pingCallback = null;
  }
}

const shutdown = function() {
  this._websocket.close();
  this._websocket = null;
}

const speedTest = function (userCallback, bytes = 1024*256) {
  var socket = this._websocket;
  if (socket !== null) {
    this._speedCB = userCallback;
    this._speedBytes = bytes;
    socket.send("#SPU " + bytes);

    var loops = bytes / 1024;
    var rem = bytes % 1024;
    var i;
    var data = new Array(1024).join(".");
    for (i = 0; i < loops; i++) {
      socket.send("#SPB " + data);
    }

    if (rem) {
      socket.send("#SPB " + data);
    }

    socket.send("#SPE");
  }
}

const ping = function(userCallback) {
  var now = Date.now();
  var request = {};

  this._pingCallback = userCallback;

  request.wsp_version = "1";
  request.method = "echo";
  request.params = {
    type: "echo_request",
    time: now
  };

  this._sendMessage(JSON.stringify(request));
}

export default CLIENT
