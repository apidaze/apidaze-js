import * as WebRTCAdapter from "webrtc-adapter";

var __VERSION__ = "dev-" + process.env.__VERSION__ // webpack defineplugin variable

var LOG_PREFIX = 'APIdaze-' + __VERSION__ + ' | CLIENT | Call |' ;

var Call = function(clientObj, params, listeners){
  let { onError, onRinging, onAnswer, onHangup } = listeners;

  this.clientObj = clientObj;
  this.setRemoteDescription = setRemoteDescription; // called from clientObj
  this.remoteAudio = document.createElement("audio");
  this.remoteAudio.autoplay = "autoplay";
  this.remoteAudio.controls = "controls";
  this.localAudioStream = null;
  this.peerConnection = null;

  this.userParams = params;
  this.userRingingCallback = onRinging;
  this.userAnswerCallback = onAnswer;
  this.userHangupCallback = onHangup;

  this._onRinging = handleRinging;
  this._onAnswer = handleAnswer;
  this._onHangup = handleHangup;
  this._onError = function(message){
    typeof onError === "function" ? onError(message) : console.log(LOG_PREFIX, "Error :", message);
    throw {ok: false, message: message}
  };

  // Wise to call getUserMedia again
  let self = this;
  navigator.mediaDevices.getUserMedia({audio: true, video: false})
    .then(function(stream){
      handleGUMSuccess.call(self, stream);
      createPeerConnection.call(self);
      attachStreamToPeerConnection.call(self);
      createOffer.call(self);

    })
    .catch(function(error){
      handleGUMError.call(self, error);
    });
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
    offerToReceiveVideo: 0
  };

  var self = this;

  this.peerConnection.createOffer(
    offerOptions
  ).then(
    function(desc){
      console.log(LOG_PREFIX, "Local SDP : " + desc.sdp);
      console.log(LOG_PREFIX, "Setting description to local peerConnection");
      self.peerConnection.setLocalDescription(desc);
    },
    function(error){
      self._onError(error);
    }
  );
}

function attachStreamToPeerConnection(){
  let self = this;
  this.localAudioStream.getTracks().forEach(
    function(track) {
      self.peerConnection.addTrack(
        track,
        self.localAudioStream
      );
    }
  );
  console.log(LOG_PREFIX, "Added local stream to peerConnection");
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
    "optional": [{"DtlsSrtpKeyAgreement": true}, {"googIPv6": false}],
    "mandatory":  { 'OfferToReceiveAudio':true,  'OfferToReceiveVideo':false}
  };
  var self = this;

  console.log(LOG_PREFIX, "Creating RTCPeerConnection...")
  this.peerConnection = new RTCPeerConnection(pc_config, pc_constraints);
  this.peerConnection.ontrack = function(event){
    console.log(LOG_PREFIX, "Received remote stream");
    if (self.remoteAudio.srcObject !== event.streams[0]) {
      self.remoteAudio.srcObject = event.streams[0];
    }
  }
  this.peerConnection.onicecandidate = function(event){
    if (event.candidate){
      console.log(LOG_PREFIX, "ICE candidate received: " + event.candidate.candidate);
    } else if (!('onicegatheringstatechange' in RTCPeerConnection.prototype)) {
      // should not be done if its done in the icegatheringstatechange callback.
      console.log(LOG_PREFIX, "Got ICE candidates, start call...");
      startCall.call(self);
    }
  }
  this.peerConnection.oniceconnectionstatechange = function(event){
    if (self.peerConnection === null){
      console.log(LOG_PREFIX, "peerConnection is null, call has been hungup ?");
      return;
    }

    console.log(LOG_PREFIX, "ICE State : " + self.peerConnection.iceConnectionState);
    console.log(LOG_PREFIX, "ICE State : " + self.peerConnection.iceConnectionState);
    console.log(LOG_PREFIX, "ICE state change event: ", event);
  }
  this.peerConnection.onicegatheringstatechange = function(){
    if (self.peerConnection.iceGatheringState !== 'complete') {
      return;
    }
    console.log(LOG_PREFIX, "Got ICE candidates (from onicegatheringstatechange), start call...");
    startCall.call(self);
  }
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};

function startCall(){
  var callID = guid();
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
  this.clientObj.sendMessage(JSON.stringify(request));
}

/**
* Handle Hangup event received fro FreeSWITCH
*/
function handleHangup(){
  console.log(LOG_PREFIX, "Call hungup");
  let self = this;

  this.localAudioStream.getTracks().forEach(
    function(track) {
      track.stop();
    }
  );

  this.peerConnection.close();
  this.remoteAudio = null;
  this.peerConnection = null;
  this.localAudioStream = null;
  typeof this.userHangupCallback === "function" && this.userHangupCallback();
}

function handleRinging(userCallback){
 console.log(LOG_PREFIX, "Ringing");
 typeof userCallback === "function" && userCallback();
}

function handleAnswer(userCallback){
  console.log(LOG_PREFIX, "Answer");
  typeof userCallback === "function" && userCallback();
}

function handleGUMSuccess(stream){
  console.log(LOG_PREFIX, "WebRTC Ok");
  this.localAudioStream = stream;
}

function handleGUMError(error){
  this._onError(error)
}

export default Call;
