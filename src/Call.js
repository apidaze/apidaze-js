// eslint-disable-next-line no-unused-vars
import * as WebRTCAdapter from "webrtc-adapter";
import Utils from "./Utils.js";
import Logger from "./Logger.js";

var __VERSION__ = process.env.VERSIONSTR; // webpack defineplugin variable

var LOG_PREFIX = "APIdaze-" + __VERSION__ + " | CLIENT | Call |";
var LOGGER = new Logger(false, LOG_PREFIX);

var APIDAZE_SCREENSHARE_CHROME_EXTENSION_ID =
  "ecomagggebppeikobjchgmnoldifjnjj";

/**
 * The callID parameter is expected to be null, except when clientObj is
 * re-attaching to an existing call in FreeSWITCH
 */
var Call = function(clientObj, callID, params, listeners) {
  let randomString = (function() {
    for (var c = ""; c.length < 12; )
      c += Math.random()
        .toString(36)
        .substr(2, 1);
    return c;
  })();

  var {
    activateAudio = true,
    tagId = "apidaze-audio-video-container-id-" + randomString,
    audioParams = {}
  } = params;

  const videoParams = {
    activateScreenShare: false
  };

  if (videoParams.activateScreenShare === true) {
    if (typeof videoParams.screenShareParams === "undefined") {
      videoParams.screenShareParams = {};
    }
  }

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

  if (clientObj.debug) {
    LOGGER._debug = true;
  }

  this.clientObj = clientObj;
  this.setRemoteDescription = setRemoteDescription; // called from clientObj
  this.activateVideo = false;
  this.activateAudio = activateAudio;
  this.videoParams = videoParams;
  this.audioParams = audioParams;
  this.audioVideoTagId = tagId;

  var audioVideoDOMContainerObj = document.getElementById(tagId);

  this.remoteAudioVideo = document.createElement("video");
  this.remoteAudioVideo.autoplay = "autoplay";

  // Needed for Safari on iOS, see : https://github.com/webrtc/samples/issues/929
  this.remoteAudioVideo.setAttribute("playsinline", "");

  this.remoteAudioVideo.controls = false;
  if (this.activateVideo === false) {
    this.remoteAudioVideo.style.display = "none";
  }

  if (audioVideoDOMContainerObj == null) {
    LOGGER.log(
      "Inserting HTML5 <video/> element " +
        (this.activateVideo ? "(video on) " : "(video off) ") +
        "to APIdaze tag " +
        tagId
    );
    audioVideoDOMContainerObj = document.createElement("div");
    audioVideoDOMContainerObj.id = tagId;
    audioVideoDOMContainerObj.appendChild(this.remoteAudioVideo);

    document.body.appendChild(audioVideoDOMContainerObj);
  } else {
    LOGGER.log(
      "Inserting HTML5 <video/> element " +
        (this.activateVideo ? "(video on) " : "(video off) ") +
        "to user provided tag " +
        tagId
    );
    audioVideoDOMContainerObj.appendChild(this.remoteAudioVideo);
  }

  this.extraLocalAudioVideoStream = null;
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
  this.modify = modify;
  this.dualTransfer = dualTransfer;
  this.transferBleg = transferBleg;
  this.hangup = hangup;
  this.sendText = sendText;
  this.stopLocalAudio = stopLocalAudio;
  this.startLocalAudio = startLocalAudio;
  this.stopLocalVideo = stopLocalVideo;
  this.startLocalVideo = startLocalVideo;
  this.enumerateDevices = enumerateDevices;
  this.enumerateAudioDevices = enumerateAudioDevices;
  this.setAudioInputDevice = setAudioInputDevice;
  this.setAudioOutputDevice = setAudioOutputDevice;

  if (this.clientObj._websocket.readyState !== this.clientObj._websocket.OPEN) {
    throw { message: "WebSocket is closed" };
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
        max: this.videoParams.maxWidth || 640
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
    };
  }

  LOGGER.log("GUM constraints : " + JSON.stringify(GUMConstraints));

  let self = this;

  if (
    this.activateVideo === true &&
    this.videoParams.activateScreenShare === true
  ) {
    let request = { sources: ["window", "screen", "tab"] };
    var chrome_extension_id =
      this.videoParams.screenShareParams.extensionID ||
      APIDAZE_SCREENSHARE_CHROME_EXTENSION_ID;

    if (chrome_extension_id === APIDAZE_SCREENSHARE_CHROME_EXTENSION_ID) {
      LOGGER.log("Using APIdaze Chrome extension for screen sharing");
    } else {
      LOGGER.log(
        "Using custom Chrome extension for screen sharing :",
        chrome_extension_id
      );
    }

    /**
     * Send message to Chrome Extension and start WebRTC when we get an answer back
     */
    // eslint-disable-next-line no-undef
    chrome.runtime.sendMessage(chrome_extension_id, request, response => {
      if (response.type !== "success") {
        this.clientObj._onError({
          origin: "call",
          message: "Failed to get an answer from Chrome extension (ScreenShare)"
        });
        return;
      }

      var screenSchareConstraints = {
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: response.streamId
          }
        }
      };

      navigator.mediaDevices
        .getUserMedia(screenSchareConstraints)
        .then(screenShareStream => {
          self.localAudioVideoStream = screenShareStream;
          return navigator.mediaDevices.getUserMedia(GUMConstraints);
        })
        .then(audioStream => {
          // Now add the first audio track to our previously created
          // MediaStream for ScreenShare
          var audioTrack = audioStream.getAudioTracks()[0];

          self.localAudioVideoStream.addTrack(audioTrack);

          // We keep track of this extra local stream in order to close it
          // properly when the call ends
          self.extraLocalAudioVideoStream = audioStream;
        })
        .then(function() {
          createPeerConnection.call(self);
        })
        .then(function() {
          attachStreamToPeerConnection.call(self);

          var offerOptions = {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
          };

          return self.peerConnection.createOffer(offerOptions);
        })
        .then(function(offer) {
          LOGGER.log("Local SDP : " + offer.sdp);
          LOGGER.log("Setting description to local peerConnection");
          return self.peerConnection.setLocalDescription(offer);
        })
        .then(function() {
          /**
           * Regular WebRTC examples show that the right spot to send the SDP
           * to the server is here. We cannot do that because our WebRTC remote
           * peer (FreeSWITCH) does not handle Trickle ICE and needs to get
           * all the candidates in the first offer
           */
          LOGGER.log("WebRTC set up, ready to start call");
        })
        .catch(function(error) {
          LOGGER.log("Error :", error);
          handleGUMError.call(self, error);
        });
    });
  } else {
    navigator.mediaDevices
      .enumerateDevices()
      .then(function(devices) {
        LOGGER.log("Found devices : ", devices);
        return navigator.mediaDevices.getUserMedia(GUMConstraints);
      })
      .then(function(stream) {
        LOGGER.log("WebRTC Ok");
        self.localAudioVideoStream = stream;
      })
      .then(function() {
        createPeerConnection.call(self);
      })
      .then(function() {
        attachStreamToPeerConnection.call(self);

        var offerOptions = {
          offerToReceiveAudio: 1,
          offerToReceiveVideo: 1
        };

        return self.peerConnection.createOffer(offerOptions);
      })
      .then(function(offer) {
        LOGGER.log("Local SDP : " + offer.sdp);
        LOGGER.log("Setting description to local peerConnection");
        return self.peerConnection.setLocalDescription(offer);
      })
      .then(function() {
        /**
         * Regular WebRTC examples show that the right spot to send the SDP
         * to the server is here. We cannot do that because our WebRTC remote
         * peer (FreeSWITCH) does not handle Trickle ICE and needs to get
         * all the candidates in the first offer
         */
        LOGGER.log("WebRTC set up, ready to start call");
      })
      .catch(function(error) {
        LOGGER.log("Error :", error);
        handleGUMError.call(self, error);
      });
  }
};

/**
 * Get the media devices
 *
 * @param {Object} options - Options to indicate what kind of devices should be returned
 * @param {Boolean} [options.audio] - Indicates if audio devices should be included
 * @param {Boolean} [options.video] - Indicates if video devices should be included
 *
 * @return {Promise} Promise object to provide media devices
 */
function enumerateDevices({ audio = true, video = false }) {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices
      .enumerateDevices()
      .then(devices => {
        const filteredDevices = devices.reduce(
          (reducedDevices, currentDevice) => {
            const { kind } = currentDevice;

            if (audio && (kind === "audioinput" || kind === "audiooutput")) {
              return [...reducedDevices, currentDevice];
            }

            if (video && kind === "videoinput") {
              return [...reducedDevices, currentDevice];
            }

            return reducedDevices;
          },
          []
        );

        resolve(filteredDevices);
      })
      .catch(reject);
  });
}

/**
 * Get the audio devices
 *
 * @return {Promise} Promise object to provide audio media devices
 */
function enumerateAudioDevices() {
  return enumerateDevices({ audio: true });
}

/**
 * Sets the ID of the audio device to use for output on the given mediaElement
 *
 * @param {HTMLMediaElement} mediaElement - Media element to set an audio output device for
 * @param {string} sinkId - The MediaDeviceInfo.deviceId of the audio output device.
 *
 * @return {Promise}
 */
function attachSinkId(mediaElement, sinkId) {
  return new Promise((resolve, reject) => {
    if (typeof mediaElement.sinkId !== "undefined") {
      mediaElement
        .setSinkId(sinkId)
        .then(resolve)
        .catch(reject);
    } else {
      reject("The browser does not support output device selection.");
    }
  });
}

/**
 * Sets the ID of the audio device to use for input in the bounded call
 *
 * @param {string} deviceId - The MediaDeviceInfo.deviceId of the audio input device.
 *
 * @return {Promise}
 */
function setAudioInputDevice(deviceId) {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          deviceId: {
            exact: deviceId
          }
        }
      })
      .then(stream => {
        const audioTracks = stream.getAudioTracks();
        const newAudioTrack = audioTracks[0];

        const audioSender = this.peerConnection
          .getSenders()
          .find(sender => sender.track.kind === "audio");

        audioSender
          .replaceTrack(newAudioTrack)
          .then(resolve)
          .catch(reject);
      })
      .catch(reject);
  });
}

/**
 * Sets the ID of the video device to use for input in the bounded call
 *
 * @param {string} deviceId - The MediaDeviceInfo.deviceId of the video input device.
 *
 * @return {Promise}
 */
// eslint-disable-next-line no-unused-vars
function setVideoInputDevice(deviceId) {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          deviceId: {
            exact: deviceId
          }
        }
      })
      .then(stream => {
        const videoTracks = stream.getVideoTracks();
        const newVideoTrack = videoTracks[0];

        const videoSender = this.peerConnection
          .getSenders()
          .find(sender => sender.track.kind === "video");

        videoSender
          .replaceTrack(newVideoTrack)
          .then(resolve)
          .catch(reject);
      })
      .catch(reject);
  });
}

/**
 * Sets the ID of the audio device to use for output in the bounded call
 *
 * @param {string} device - The MediaDeviceInfo.deviceId of the audio output device.
 *
 * @return {Promise}
 */
function setAudioOutputDevice(deviceId) {
  return attachSinkId(this.remoteAudioVideo, deviceId);
}

function stopLocalAudio() {
  this.localAudioVideoStream.getAudioTracks().forEach(function(track) {
    track.enabled = false;
  });
}

function startLocalAudio() {
  this.localAudioVideoStream.getAudioTracks().forEach(function(track) {
    track.enabled = true;
  });
}

function stopLocalVideo() {
  this.localAudioVideoStream.getVideoTracks().forEach(function(track) {
    track.enabled = false;
  });
}

function startLocalVideo() {
  this.localAudioVideoStream.getVideoTracks().forEach(function(track) {
    track.enabled = true;
  });
}

function sendDTMF(digits) {
  LOGGER.log("sendDTMF called, digits : " + digits);
  LOGGER.log("this.callID : " + this.callID);
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

function inviteToConference(number, caller_id_number) {
  var roomName = this.conferenceName.substring(
    this.conferenceName.indexOf("-") + 1
  );
  LOGGER.log("Inviting number " + number + " to conference " + roomName);
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "inviteToConference",
    destination: roomName,
    number: number,
    caller_id_number: caller_id_number
  };

  this.clientObj._sendMessage(JSON.stringify(request));
}

function unmuteAllInConference() {
  var roomName = this.conferenceName.substring(
    this.conferenceName.indexOf("-") + 1
  );
  LOGGER.log("Unmute everybody in conference " + roomName);
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "unmuteAllInConference",
    destination: roomName
  };

  this.clientObj._sendMessage(JSON.stringify(request));
}

function muteAllInConference() {
  var roomName = this.conferenceName.substring(
    this.conferenceName.indexOf("-") + 1
  );
  LOGGER.log("Mute everybody in conference " + roomName);
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "muteAllInConference",
    destination: roomName
  };

  this.clientObj._sendMessage(JSON.stringify(request));
}

function toggleMuteInConference(conferenceMemberID) {
  var roomName = this.conferenceName.substring(
    this.conferenceName.indexOf("-") + 1
  );
  LOGGER.log(
    "Toggling mute status for member (" +
      conferenceMemberID +
      ") in conference " +
      roomName
  );
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "toggleMuteInConference",
    destination: roomName,
    conferenceMemberID: conferenceMemberID
  };

  this.clientObj._sendMessage(JSON.stringify(request));
}

function unmuteInConference(conferenceMemberID) {
  var roomName = this.conferenceName.substring(
    this.conferenceName.indexOf("-") + 1
  );
  LOGGER.log(
    "Unmuting member (" + conferenceMemberID + ") in conference " + roomName
  );
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "unmuteInConference",
    destination: roomName,
    conferenceMemberID: conferenceMemberID
  };

  this.clientObj._sendMessage(JSON.stringify(request));
}

function muteInConference(conferenceMemberID) {
  var roomName = this.conferenceName.substring(
    this.conferenceName.indexOf("-") + 1
  );
  LOGGER.log(
    "Muting member (" + conferenceMemberID + ") in conference " + roomName
  );
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "muteInConference",
    destination: roomName,
    conferenceMemberID: conferenceMemberID
  };

  this.clientObj._sendMessage(JSON.stringify(request));
}

function kickFromConference(conferenceMemberID) {
  var roomName = this.conferenceName.substring(
    this.conferenceName.indexOf("-") + 1
  );
  LOGGER.log(
    "Kicking member (" + conferenceMemberID + ") out of conference " + roomName
  );
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "kickFromConference",
    destination: roomName,
    conferenceMemberID: conferenceMemberID
  };

  this.clientObj._sendMessage(JSON.stringify(request));
}

function modify(action, destination) {
  LOGGER.log(
    LOG_PREFIX,
    "Modifying call (",
    action,
    ") with id :",
    this.callID
  );
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  switch (action) {
    case "hold":
      request.params = {
        callID: this.callID,
        action: action
      };
      break;
    case "unhold":
      request.params = {
        callID: this.callID,
        action: action
      };
      break;
    case "toggleHold":
      request.params = {
        callID: this.callID,
        action: action
      };
      break;
    case "conference":
      request.params = {
        callID: this.callID,
        action: action,
        destination: destination
      };
      break;
    default:
      LOGGER.log(LOG_PREFIX, "Unknown action", action, "Returning.");
      return;
  }

  this.clientObj._sendMessage(JSON.stringify(request));
}

function dualTransfer(aleg_exten, bleg_exten) {
  LOGGER.log(
    LOG_PREFIX,
    "dualTransfer called, aleg_exten :",
    aleg_exten,
    "bleg_exten :",
    bleg_exten
  );
  LOGGER.log(LOG_PREFIX, "this.callID :", this.callID);
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "dualTransfer",
    aleg_exten: aleg_exten,
    bleg_exten: bleg_exten
  };

  this.clientObj._sendMessage(JSON.stringify(request));
}

function transferBleg(exten) {
  LOGGER.log(LOG_PREFIX, "transferBleg called, exten : ", exten);
  LOGGER.log(LOG_PREFIX, "this.callID : ", this.callID);
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "transferBleg",
    exten: exten
  };

  this.clientObj._sendMessage(JSON.stringify(request));
}

function hangup() {
  LOGGER.log("Hangup call with callID : " + this.callID);
  var request = {};

  // If this call is connected to a room, unsubscribe from events first
  if (this.callType === "conference") {
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

function sendText(message, fromDisplay = null) {
  LOGGER.log("Sending text : " + message);
  var request = {};

  if (this.callType === "conference") {
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

function setRemoteDescription(sdp) {
  this.peerConnection.setRemoteDescription(
    new RTCSessionDescription(
      {
        type: "answer",
        sdp: sdp
      },
      function() {
        Logger.log("ok");
      },
      function(error) {
        Logger.log("err", error);
      }
    )
  );
}

function attachStreamToPeerConnection() {
  let self = this;
  this.localAudioVideoStream.getTracks().forEach(function(track) {
    self.peerConnection.addTrack(track, self.localAudioVideoStream);
  });
  LOGGER.log("Added local stream to peerConnection");
}

/**
 * Create RTCPeerConnection and get ready to start call
 *
 * We need to start the call to mod_verto only after we gathered our ICE
 * candidates. The ICE gathering process is started in the createOffer()
 * function.
 */
function createPeerConnection() {
  var pc_config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
  var pc_constraints = {
    optional: [{ DtlsSrtpKeyAgreement: true }, { googIPv6: false }],
    mandatory: {
      OfferToReceiveAudio: this.activateAudio,
      OfferToReceiveVideo: this.activateVideo
    }
  };
  var self = this;

  LOGGER.log("Creating RTCPeerConnection...");
  this.peerConnection = new RTCPeerConnection(pc_config, pc_constraints);

  this.peerConnection.ontrack = function(event) {
    LOGGER.log("Received remote stream");
    if (self.remoteAudioVideo.srcObject !== event.streams[0]) {
      self.remoteAudioVideo.srcObject = event.streams[0];
    }
  };
  this.peerConnection.onicecandidate = function(event) {
    if (event.candidate) {
      LOGGER.log("ICE candidate received: " + event.candidate.candidate);
    } else if (!("onicegatheringstatechange" in RTCPeerConnection.prototype)) {
      // should not be done if its done in the icegatheringstatechange callback.
      LOGGER.log("Got all our ICE candidates, thanks!");
      startCall.call(self);
    }
  };
  this.peerConnection.oniceconnectionstatechange = function(event) {
    if (self.peerConnection === null) {
      LOGGER.log("peerConnection is null, call has been hungup ?");
      return;
    }

    LOGGER.log("ICE State : " + self.peerConnection.iceConnectionState);
    LOGGER.log("ICE State : " + self.peerConnection.iceConnectionState);
    LOGGER.log("ICE state change event: " + event);
  };
  this.peerConnection.onicegatheringstatechange = function() {
    if (self.peerConnection.iceGatheringState !== "complete") {
      return;
    }
    LOGGER.log(
      "Got all our ICE candidates (from onicegatheringstatechange), thanks!"
    );
    startCall.call(self);
  };
}

/**
 * Starts call by sending our SDP to FreeSWITCH in a call or reattach message
 */
function startCall() {
  LOGGER.log("Sending message");
  var callID = this.reattach ? this.callID : Utils.generateGUID();
  var request = {};
  request.wsp_version = "1";
  request.method = this.reattach ? "verto.attach" : "call";
  request.params = {
    apiKey: this.clientObj._apiKey,
    apiVersion: __VERSION__,
    userKeys: this.userParams,
    callID: callID
  };
  request.params.sdp = this.peerConnection.localDescription.sdp;
  this.callID = callID;
  this.clientObj._sendMessage(JSON.stringify(request));
}

/**
 * Handle Hangup event received fro FreeSWITCH
 */
function handleHangup() {
  LOGGER.log("Call hungup");

  if (
    this.extraLocalAudioVideoStream &&
    this.extraLocalAudioVideoStream.active === true
  ) {
    LOGGER.log(
      "We have an extra MediaStream, probably because we are sharing the screen, let's close it"
    );
    this.extraLocalAudioVideoStream.getTracks().forEach(function(track) {
      track.stop();
    });
  }

  this.localAudioVideoStream.getTracks().forEach(function(track) {
    track.stop();
  });

  let audioVideoDOMContainerObj = document.getElementById(this.audioVideoTagId);
  if (audioVideoDOMContainerObj) {
    audioVideoDOMContainerObj.parentNode.removeChild(audioVideoDOMContainerObj);
  }

  this.peerConnection.close();
  this.remoteAudioVideo = null;
  this.peerConnection = null;
  this.localAudioVideoStream = null;
  typeof this.userHangupCallback === "function" && this.userHangupCallback();
}

function handleRoomChatMessage(message) {
  LOGGER.log("Received message : " + JSON.stringify(message));

  // remove type from message
  delete message.type;

  typeof this.userRoomChatMessageCallback === "function" &&
    this.userRoomChatMessageCallback(message);
}

function handleMembersInitialList(members) {
  LOGGER.log("Initial list of members");
  typeof this.userRoomMembersInitialListCallback === "function" &&
    this.userRoomMembersInitialListCallback(members);
}

function handleRoomTalking(dataArray) {
  LOGGER.log("Talk event : " + JSON.stringify(dataArray));
  var status = JSON.parse(dataArray[4]);
  var event = {
    type: "room.talking",
    conferenceMemberID: parseInt(dataArray[0]).toString(),
    nickname: dataArray[2],
    caller_id_number: dataArray[1],
    talking: status.audio.talking,
    muted: status.audio.muted,
    energyScore: status.audio.energyScore.toString(),
    sessid: dataArray[7]
  };

  typeof this.userRoomTalkingCallback === "function" &&
    this.userRoomTalkingCallback(event);
}

function handleRoomAdd(dataArray) {
  LOGGER.log("Add event : " + JSON.stringify(dataArray));
  var event = {
    type: "room.add",
    conferenceMemberID: parseInt(dataArray[0]).toString(),
    nickname: dataArray[2],
    caller_id_number: dataArray[1],
    sessid: dataArray[7]
  };

  typeof this.userRoomAddCallback === "function" &&
    this.userRoomAddCallback(event);
}

function handleRoomDel(dataArray) {
  LOGGER.log("Del event : " + JSON.stringify(dataArray));
  var event = {
    type: "room.del",
    conferenceMemberID: parseInt(dataArray[0]).toString(),
    nickname: dataArray[2],
    caller_id_number: dataArray[1],
    sessid: dataArray[7]
  };

  typeof this.userRoomDelCallback === "function" &&
    this.userRoomDelCallback(event);
}

function handleRinging() {
  LOGGER.log("Ringing");
  typeof this.userRingingCallback === "function" && this.userRingingCallback();
}

function handleAnswer() {
  LOGGER.log("Answer");
  typeof this.userAnswerCallback === "function" && this.userAnswerCallback();
}

function handleGUMError(error) {
  LOGGER.log("Failed to get local media device (camera, mic, screen)");
  this.clientObj._onError({
    origin: "call",
    message:
      "Failed to get local media device (camera, mic, screen) : " + error.name
  });
}

export default Call;
