import * as WebRTCAdapter from "webrtc-adapter";
import Utils from './Utils.js';
import Logger from './Logger.js';

var __VERSION__ = "dev-" + process.env.__VERSION__ // webpack defineplugin variable

var LOG_PREFIX = 'APIdaze-' + __VERSION__ + ' | CLIENT | Call |' ;
var LOGGER = new Logger(false, LOG_PREFIX);

var Call = function(clientObj, params, listeners){
  var {
    activateAudio = true,
    activateVideo = false,
    videoParams,
    audioParams
  } = params;

  var {
    onError,
    onRinging,
    onAnswer,
    onHangup,
    onRoomMembersInitialList,
    onRoomTalking,
    onRoomAdd,
    onRoomDel
  } = listeners;

  if (clientObj.debug){
    LOGGER._debug = true;
  }

  this.clientObj = clientObj;
  this.setRemoteDescription = setRemoteDescription; // called from clientObj
  this.activateVideo = activateVideo;
  this.activateAudio = activateAudio;
  this.remoteAudioVideo = document.createElement("video");
  this.remoteAudioVideo.autoplay = "autoplay";
  this.remoteAudioVideo.controls = "controls";
  document.body.appendChild(this.remoteAudioVideo)
  this.localAudioVideoStream = null;
  this.peerConnection = null;
  this.callID = null;

  this.userParams = params;
  this.userRingingCallback = onRinging;
  this.userAnswerCallback = onAnswer;
  this.userHangupCallback = onHangup;
  this.userRoomMembersInitialListCallback = onRoomMembersInitialList;
  this.userRoomTalkingCallback = onRoomTalking;
  this.userRoomDelCallback = onRoomDel;
  this.userRoomAddCallback = onRoomAdd;


  this._onRinging = handleRinging;
  this._onAnswer = handleAnswer;
  this._onHangup = handleHangup;
  this._onRoomMembersInitialList = handleMembersInitialList;
  this._onRoomTalking = handleRoomTalking;
  this._onRoomAdd = handleRoomAdd;
  this._onRoomDel = handleRoomDel;
  this._onError = function(message){
    typeof onError === "function" ? onError(message) : LOGGER.log("Error : " + message);
    throw {ok: false, message: message}
  };

  // Functions that can be called by dev
  this.sendDTMF = sendDTMF;
  this.hangup = hangup;
  this.sendText = sendText;
  this.stopLocalAudio = stopLocalAudio;
  this.startLocalAudio = startLocalAudio;

  // Wise to call getUserMedia again
  let self = this;
  navigator.mediaDevices.getUserMedia({
    audio: self.activateAudio,
    video: self.activateVideo
  }).then(function(stream){
      handleGUMSuccess.call(self, stream);
      createPeerConnection.call(self);
      attachStreamToPeerConnection.call(self);
      createOffer.call(self);

    })
    .catch(function(error){
      handleGUMError.call(self, error);
    });
}

function stopLocalAudio(){
  this.localAudioVideoStream.getAudioTracks().forEach(
    function(track) {
      track.enabled = false;
    }
  );
}

function startLocalAudio(){
  this.localAudioVideoStream.getAudioTracks().forEach(
    function(track) {
      track.enabled = true;
    }
  );
}

function sendDTMF(digits){
  LOGGER.log( "sendDTMF called, digits : " + digits);
  LOGGER.log( "this.callID : " + this.callID);
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "sendDTMF",
    digits: digits
  };

  this.clientObj._sendMessage(JSON.stringify(request));
}

function hangup(){
  LOGGER.log("Hangup call with callID : " + this.callID);
  var request = {};

  // If this call is connected to a room, unsubscribe from events first
  if (this.callType === "conference"){
    request.wsp_version = "1";
    request.method = "verto.unsubscribe";
    request.id = "unsubscribe_message";
    request.params = {
      eventChannel: this.subscribedChannelsArray,
      subParams: {}
    };
    this.clientObj._sendMessage(JSON.stringify(request));
  }

  request.wsp_version = "1";
  request.method = "hangup";
  request.params = {
    callID: this.callID
  };

  this.clientObj._sendMessage(JSON.stringify(request));
}

function sendText(message){
  LOGGER.log("Sending text : " + message);
  var request = {};

  // If this call is connected to a room, unsubscribe from events first
  if (this.callType === "conference"){
    request.wsp_version = "1";
    request.method = "verto.broadcast";
    request.params = {
      eventChannel: this.subscribedChannels.chatChannel,
      fromID : this.conferenceMemberID.toString(),
      data: {
        action: "send",
        message: message
      }
    };
    this.clientObj._sendMessage(JSON.stringify(request));
  }
}

function setRemoteDescription(sdp){
  this.peerConnection.setRemoteDescription(
    new RTCSessionDescription({
      type: "answer",
      sdp: sdp
    },
    function(){
      console.log("ok");
    },
    function(error){
      console.log("err");
    })
  );
}

/**
* This function starts the ICE gathering process
*/
function createOffer(){
  var offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  };

  var self = this;

  this.peerConnection.createOffer(
    offerOptions
  ).then(
    function(desc){
      LOGGER.log("Local SDP : " + desc.sdp);
      LOGGER.log("Setting description to local peerConnection");
      self.peerConnection.setLocalDescription(desc);
    },
    function(error){
      self._onError(error);
    }
  );
}

function attachStreamToPeerConnection(){
  let self = this;
  this.localAudioVideoStream.getTracks().forEach(
    function(track) {
      self.peerConnection.addTrack(
        track,
        self.localAudioVideoStream
      );
    }
  );
  LOGGER.log("Added local stream to peerConnection");
}

/**
* Create RTCPeerConnection and get ready to start call
*
* We need to start the call to mod_verto only after we gathered our ICE
* candidates. The ICE gathering process is started in the createOffer()
* function.
*/
function createPeerConnection(){
  var pc_config = {"iceServers": []};
  var pc_constraints = {
    "optional": [
      {"DtlsSrtpKeyAgreement": true},
      {"googIPv6": false}
    ],
    "mandatory": {
      'OfferToReceiveAudio': this.activateAudio,
      'OfferToReceiveVideo': this.activateVideo
    }
  };
  var self = this;

  LOGGER.log("Creating RTCPeerConnection...")
  this.peerConnection = new RTCPeerConnection(pc_config, pc_constraints);
  this.peerConnection.ontrack = function(event){
    LOGGER.log("Received remote stream");
    if (self.remoteAudioVideo.srcObject !== event.streams[0]) {
      self.remoteAudioVideo.srcObject = event.streams[0];
    }
  }
  this.peerConnection.onicecandidate = function(event){
    if (event.candidate){
      LOGGER.log("ICE candidate received: " + event.candidate.candidate);
    } else if (!('onicegatheringstatechange' in RTCPeerConnection.prototype)) {
      // should not be done if its done in the icegatheringstatechange callback.
      LOGGER.log("Got ICE candidates, start call...");
      startCall.call(self);
    }
  }
  this.peerConnection.oniceconnectionstatechange = function(event){
    if (self.peerConnection === null){
      LOGGER.log("peerConnection is null, call has been hungup ?");
      return;
    }

    LOGGER.log("ICE State : " + self.peerConnection.iceConnectionState);
    LOGGER.log("ICE State : " + self.peerConnection.iceConnectionState);
    LOGGER.log("ICE state change event: " + event);
  }
  this.peerConnection.onicegatheringstatechange = function(){
    if (self.peerConnection.iceGatheringState !== 'complete') {
      return;
    }
    LOGGER.log("Got ICE candidates (from onicegatheringstatechange), start call...");
    startCall.call(self);
  }
}

function startCall(){
  var callID = Utils.generateGUID();
  var request = {};
  request.wsp_version = "1";
  request.method = "call";
  request.params = {
    apiKey : this.clientObj._apiKey,
    apiVersion : __VERSION__,
    userKeys : this.userParams,
    callID: callID
  };
  request.params.sdp = this.peerConnection.localDescription.sdp;
  this.callID = callID;
  this.clientObj._sendMessage(JSON.stringify(request));
}

/**
* Handle Hangup event received fro FreeSWITCH
*/
function handleHangup(){
  LOGGER.log("Call hungup");
  let self = this;

  this.localAudioVideoStream.getTracks().forEach(
    function(track) {
      track.stop();
    }
  );

  this.peerConnection.close();
  this.remoteAudioVideo = null;
  this.peerConnection = null;
  this.localAudioVideoStream = null;
  typeof this.userHangupCallback === "function" && this.userHangupCallback();
}

function handleMembersInitialList(members){
  LOGGER.log("Initial list of members");
  typeof this.userRoomMembersInitialListCallback === "function" && this.userRoomMembersInitialListCallback(members);
}

function handleRoomTalking(dataArray){
  LOGGER.log("Talk event : " + JSON.stringify(dataArray));
  var status = JSON.parse(dataArray[4]);
  var event = {
    type: "room.talking",
    conferenceMemberID: parseInt(dataArray[0]).toString(),
    nickname: dataArray[2],
    caller_id_number: dataArray[1],
    talking: status.audio.talking,
    muted: status.audio.muted,
    energyScore: status.audio.energyScore.toString()
  };

  typeof this.userRoomTalkingCallback === "function" && this.userRoomTalkingCallback(event);
}

function handleRoomAdd(dataArray){
  LOGGER.log("Add event : " + JSON.stringify(dataArray));
  var status = JSON.parse(dataArray[4]);
  var event = {
    type: "room.add",
    conferenceMemberID: parseInt(dataArray[0]).toString(),
    nickname: dataArray[2],
    caller_id_number: dataArray[1]
  };

  typeof this.userRoomAddCallback === "function" && this.userRoomAddCallback(event);
}

function handleRoomDel(dataArray){
  LOGGER.log("Add event : " + JSON.stringify(dataArray));
  var status = JSON.parse(dataArray[4]);
  var event = {
    type: "room.del",
    conferenceMemberID: parseInt(dataArray[0]).toString(),
    nickname: dataArray[2],
    caller_id_number: dataArray[1]
  };

  typeof this.userRoomDelCallback === "function" && this.userRoomDelCallback(event);
}

function handleRinging(userCallback){
 LOGGER.log("Ringing");
 typeof userCallback === "function" && userCallback();
}

function handleAnswer(userCallback){
  LOGGER.log("Answer");
  typeof userCallback === "function" && userCallback();
}

function handleGUMSuccess(stream){
  LOGGER.log("WebRTC Ok");
  this.localAudioVideoStream = stream;
}

function handleGUMError(error){
  this._onError(error)
}

export default Call;
