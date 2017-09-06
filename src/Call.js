import * as WebRTCAdapter from "webrtc-adapter";
import Utils from './Utils.js';
import Logger from './Logger.js';

var __VERSION__ = process.env.VERSIONSTR // webpack defineplugin variable

var LOG_PREFIX = 'APIdaze-' + __VERSION__ + ' | CLIENT | Call |' ;
var LOGGER = new Logger(false, LOG_PREFIX);

/**
* The callID parameter is expected to be null, except when clientObj is
* re-attaching to an existing call in FreeSWITCH
*/
var Call = function(clientObj, callID, params, listeners){
  /**
  * videoParams example :
  *
  *  minWidth: 320,
  *  minHeight: 240,
  *  maxWidth: 640,
  *  maxHeight: 480,
  *  // The minimum frame rate of the client camera, Verto will fail if it's
  *  // less than this.
  *  minFrameRate: 15,
  *  // The maximum frame rate to send from the camera.
  *  bestFrameRate: 30,
  */

  var {
    activateAudio = true,
    activateVideo = false,
    videoParams = {},
    audioParams = {},
    userKeys
  } = params;

  var {
    onRinging,
    onAnswer,
    onHangup,
    onRoomChatMessage,
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
  this.videoParams = videoParams;
  this.audioParams = audioParams;

  this.remoteAudioVideo = document.createElement("video");
  this.remoteAudioVideo.autoplay = "autoplay";
  this.remoteAudioVideo.controls = "controls";
  if (activateVideo === false){
    this.remoteAudioVideo.style.display = "none";
  }

  document.body.appendChild(this.remoteAudioVideo);

  this.localAudioVideoStream = null;
  this.peerConnection = null;
  this.callID = callID;
  this.reattach = callID === null ? false : true;

  this.userParams = params;
  this.userRingingCallback = onRinging;
  this.userAnswerCallback = onAnswer;
  this.userHangupCallback = onHangup;
  this.userRoomMembersInitialListCallback = onRoomMembersInitialList;
  this.userRoomChatMessageCallback = onRoomChatMessage;
  this.userRoomTalkingCallback = onRoomTalking;
  this.userRoomDelCallback = onRoomDel;
  this.userRoomAddCallback = onRoomAdd;


  this._onRinging = handleRinging;
  this._onAnswer = handleAnswer;
  this._onHangup = handleHangup;
  this._onRoomChatMessage = handleRoomChatMessage;
  this._onRoomMembersInitialList = handleMembersInitialList;
  this._onRoomTalking = handleRoomTalking;
  this._onRoomAdd = handleRoomAdd;
  this._onRoomDel = handleRoomDel;

  // Functions that can be called by dev
  this.sendDTMF = sendDTMF;
  this.inviteToConference = inviteToConference;
  this.unmuteAllInConference = unmuteAllInConference;
  this.muteAllInConference = muteAllInConference;
  this.toggleMuteInConference = toggleMuteInConference;
  this.unmuteInConference = unmuteInConference;
  this.muteInConference = muteInConference;
  this.kickFromConference = kickFromConference;
  this.hangup = hangup;
  this.sendText = sendText;
  this.stopLocalAudio = stopLocalAudio;
  this.startLocalAudio = startLocalAudio;
  this.stopLocalVideo = stopLocalVideo;
  this.startLocalVideo = startLocalVideo;

  if (this.clientObj._websocket.readyState !== this.clientObj._websocket.OPEN){
    throw {message: "WebSocket is closed"}
  }

  var GUMConstraints = {
    audio: this.activateAudio
  };

  if (this.activateVideo === false) {
    GUMConstraints.video = false;
  } else {
    LOGGER.log("Need to set GUMConstraints.video");
    GUMConstraints.video = {
      width: {
        min: this.videoParams.minWidth || 320,
        max: this.videoParams.maxWidth || 640,
      },
      height: {
        min: this.videoParams.minHeight || 240,
        max: this.videoParams.maxHeight || 480
      },
      frameRate: {
        min: 15,
        ideal: this.videoParams.bestFrameRate || 30,
        max: 30
      }
    }
  }

  LOGGER.log("GUM constraints : " + JSON.stringify(GUMConstraints));

  let self = this;
  navigator.mediaDevices.getUserMedia(GUMConstraints).then(function(stream){
      handleGUMSuccess.call(self, stream);
      createPeerConnection.call(self);
      attachStreamToPeerConnection.call(self);
      if (self.callID === null){
        LOGGER.log("No callID, calling createOffer")
        createOffer.call(self);
      } else {
        LOGGER.log("We have a callID, setting remote desc on peerConnection")
        createAnswer.call(self);
      }
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

function stopLocalVideo(){
  this.localAudioVideoStream.getVideoTracks().forEach(
    function(track) {
      track.enabled = false;
    }
  );
}

function startLocalVideo(){
  this.localAudioVideoStream.getVideoTracks().forEach(
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

function inviteToConference(destination, number, caller_id_number){
  LOGGER.log("Inviting number " + number + " to conference " + destination);
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "inviteToConference",
    destination: destination,
    number: number,
    caller_id_number: caller_id_number
  };

  this.clientObj._sendMessage(JSON.stringify(request));
};

function unmuteAllInConference(destination){
  LOGGER.log("Unmute everybody in conference " + destination);
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "unmuteAllInConference",
    destination: destination
  };

  this.clientObj._sendMessage(JSON.stringify(request));
};

function muteAllInConference(destination){
  LOGGER.log("Mute everybody in conference " + destination);
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "muteAllInConference",
    destination: destination
  };

  this.clientObj._sendMessage(JSON.stringify(request));
};

function toggleMuteInConference(destination, conferenceMemberID){
  LOGGER.log("Toggling mute status for member (" + conferenceMemberID + ") in conference " + destination);
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "toggleMuteInConference",
    destination: destination,
    conferenceMemberID: conferenceMemberID
  };

  this.clientObj._sendMessage(JSON.stringify(request));
};

function unmuteInConference(destination, conferenceMemberID){
  LOGGER.log("Unmuting member (" + conferenceMemberID + ") in conference " + destination);
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "unmuteInConference",
    destination: destination,
    conferenceMemberID: conferenceMemberID
  };

  this.clientObj._sendMessage(JSON.stringify(request));
};

function muteInConference(destination, conferenceMemberID){
  LOGGER.log("Muting member (" + conferenceMemberID + ") in conference " + destination);
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "muteInConference",
    destination: destination,
    conferenceMemberID: conferenceMemberID
  };

  this.clientObj._sendMessage(JSON.stringify(request));
};

function kickFromConference(destination, uuid){
  LOGGER.log("Kicking member (" + uuid + ") out of conference " + destination);
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "kickFromConference",
    destination: destination,
    uuid: uuid
  };

  this.clientObj._sendMessage(JSON.stringify(request));
};

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

function sendText(message, fromDisplay = null){
  LOGGER.log("Sending text : " + message);
  var request = {};

  if (this.callType === "conference"){
    request.wsp_version = "1";
    request.method = "verto.broadcast";
    request.params = {
      eventChannel: this.subscribedChannels.chatChannel,
      conferenceMemberID: this.conferenceMemberID.toString(),
      fromDisplay: fromDisplay,
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
* Create and answer for FreeSWITCH
*
* This function is called when FeeSWICTH sent its SDP first. In the case
* where we need to re attach a verto session to an existing call, this
* function will be called.
*/
function createAnswer(){
  var offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  };

  var self = this;

  this.peerConnection.setRemoteDescription(
    new RTCSessionDescription({
      type: "offer",
      sdp: self.clientObj._reattachParams.sdp
    }))
    .then(function() {
      LOGGER.log("RTCSessionDescription created");
      return self.peerConnection.createAnswer();
    })
    .then(function(answer){
      LOGGER.log("createAnswer returned successfully");
      return self.peerConnection.setLocalDescription(answer);
    })
    .then(function(){
      LOGGER.log("setLocalDescription returned successfully")
    })
    .catch(function(err){
      LOGGER.log("Error : " + JSON.stringify(err))
    })
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
      throw JSON.stringify(error);
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
  var callID = this.reattach ? this.callID : Utils.generateGUID();
  var request = {};
  request.wsp_version = "1";
  request.method = this.reattach ? "verto.attach" : "call";
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

function handleRoomChatMessage(message){
  LOGGER.log("Received message : " + JSON.stringify(message));

  // remove type from message
  delete message.type;

  typeof this.userRoomChatMessageCallback === "function" && this.userRoomChatMessageCallback(msg);
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
  throw JSON.stringify(error);
}

export default Call;
