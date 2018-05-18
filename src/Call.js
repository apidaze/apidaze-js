import * as WebRTCAdapter from "webrtc-adapter";
import Utils from './Utils.js';
import Janus from './Janus.js';
import Logger from './Logger.js';

var __VERSION__ = process.env.VERSIONSTR // webpack defineplugin variable

var LOG_PREFIX = 'APIdaze-' + __VERSION__ + ' | CLIENT | Call |' ;
var LOGGER = new Logger(false, LOG_PREFIX);

var APIDAZE_SCREENSHARE_CHROME_EXTENSION_ID = "ecomagggebppeikobjchgmnoldifjnjj";

/**
* The callID parameter is expected to be null, except when clientObj is
* re-attaching to an existing call in FreeSWITCH
*/
var Call = function(clientObj, callID, params, listeners){
  let randomString = (function() {for(var c = ''; c.length < 12;) c += Math.random().toString(36).substr(2, 1); return c})();

  var {
    tagId = 'apidaze-audio-video-container-id-' + randomString,
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
  this.audioParams = audioParams;
  this.audioVideoTagId = tagId;

  /**
  * Video attributes for this call
  *
  * Janus handles video in conference rooms. That is, a user starts
  * a conference room in FreeSWITCH in audio, and may later 'upgrade' this
  * conference to video using Janus.
  * A second WebSocket that communicates with a Janus server is used and
  * a new RTCPeerConnection is created to manage video.
  *
  * - janusInitOk is set to 'true' after Janus has been initiated using the
  * 'initVideoInConferenceRoom' function.
  * - janusInstance is a instance of Janus, created after calling 'new Janus()'
  * - janusVideoPlugin is the object that results of a success callback of the
  *   janusInstance.attach() function (the pluginHandle parameter)
  * - janusVideoStream is user's local video stream
  */
  this.janusInitOk = false;
  this.janusInstance = null;
  this.janusVideoPlugin = null;
  this.janusVideoStream = null;
  this.janusFeeds = [];
  this.janusVideoRoomID = 0;

  var audioVideoDOMContainerObj = document.getElementById(tagId);

  this.remoteAudioVideo = document.createElement("video");
  this.remoteAudioVideo.autoplay = "autoplay";

  // Needed for Safari on iOS, see : https://github.com/webrtc/samples/issues/929
  this.remoteAudioVideo.setAttribute("playsinline", "");
  this.remoteAudioVideo.controls = false;
  this.remoteAudioVideo.style.display = 'none';

  if (audioVideoDOMContainerObj == null) {
    LOGGER.log("Inserting HTML5 <video/> element (audio only) to APIdaze tag " + tagId);
    var audioVideoDOMContainerObj = document.createElement("div");
    audioVideoDOMContainerObj.id = tagId;
    audioVideoDOMContainerObj.appendChild(this.remoteAudioVideo);

    document.body.appendChild(audioVideoDOMContainerObj);
  } else {
    LOGGER.log("Inserting HTML5 <video/> element (audio only) to user provided tag " + tagId);
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

  /**
  * The functions below can be called by the developer. The first group
  * sends commands to FreeSWITCH and manages audio + text functionalities, the
  * second group calls Janus and handles video
  */
  // FreeSWITCH Functions
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
  // Janus functions
  this.initVideoInConferenceRoom = initVideoInConferenceRoom;
  this.publishMyVideoInRoom = publishMyVideoInRoom;
  this.muteVideo = muteVideo;
  this.unmuteVideo = unmuteVideo;
  this.detachVideo = detachVideo;

  if (this.clientObj._websocket.readyState !== this.clientObj._websocket.OPEN){
    throw {message: "WebSocket is closed"}
  }

  var GUMConstraints = {
    audio: true
  };

  LOGGER.log("GUM constraints : " + JSON.stringify(GUMConstraints));

  let self = this;

  navigator.mediaDevices.enumerateDevices()
  .then(function (devices) {
    LOGGER.log("Found devices : ", devices);
    return navigator.mediaDevices.getUserMedia(GUMConstraints);
  })
  .then(function(stream){
    LOGGER.log("WebRTC Ok");
    self.localAudioVideoStream = stream;
  })
  .then(function (){
    createPeerConnection.call(self);
  })
  .then(function () {
    attachStreamToPeerConnection.call(self);

    var offerOptions = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
      };

    return self.peerConnection.createOffer(offerOptions);
  })
  .then(function(offer){
    LOGGER.log("Local SDP : " + offer.sdp);
    LOGGER.log("Setting description to local peerConnection");
    return self.peerConnection.setLocalDescription(offer);
  })
  .then(function(){
    /**
    * Regular WebRTC examples show that the right spot to send the SDP
    * to the server is here. We cannot do that because our WebRTC remote
    * peer (FreeSWITCH) does not handle Trickle ICE and needs to get
    * all the candidates in the first offer
    */
    LOGGER.log("WebRTC set up, ready to start call");
  })
  .catch(function(error){
    LOGGER.log("Error :", error);
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

function _publishOwnVideoFeed(useAudio) {
	// Publish our stream
  const self = this;

	this.janusVideoPlugin.createOffer(
		{
			// Add data:true here if you want to publish datachannels as well
			media: { audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: true },	// Publishers are sendonly
			// If you want to test simulcasting (Chrome and Firefox only), then
			// pass a ?simulcast=true when opening this demo page: it will turn
			// the following 'simulcast' property to pass to janus.js to true
			simulcast: false,
			success: function(jsep) {
				Janus.debug("Got publisher SDP!");
				Janus.debug(jsep);
				var publish = { "request": "configure", "audio": useAudio, "video": true };
				// You can force a specific codec to use when publishing by using the
				// audiocodec and videocodec properties, for instance:
				// 		publish["audiocodec"] = "opus"
				// to force Opus as the audio codec to use, or:
				// 		publish["videocodec"] = "vp9"
				// to force VP9 as the videocodec to use. In both case, though, forcing
				// a codec will only work if: (1) the codec is actually in the SDP (and
				// so the browser supports it), and (2) the codec is in the list of
				// allowed codecs in a room. With respect to the point (2) above,
				// refer to the text in janus.plugin.videoroom.cfg for more details
				self.janusVideoPlugin.send({"message": publish, "jsep": jsep});
			},
			error: function(error) {
				Janus.error("WebRTC error:", error);
			}
		});
}

function _attachJanusVideoPlugin(callbackSuccess, callbackError){
  var self = this;

  var opaqueId = "videoroomtest-123465464574746";
  this.janusInstance.attach(
    {
      plugin: "janus.plugin.videoroom",
      opaqueId: opaqueId,
      success: function(pluginHandle) {
        self.janusVideoPlugin = pluginHandle;
        Janus.log("Plugin attached! (" + self.janusVideoPlugin.getPlugin() + ", id=" + self.janusVideoPlugin.getId() + ")");
        Janus.log("  -- This is a publisher/manager");
        var create = { "request": "exists", "room": self.janusVideoRoomID };
        self.janusVideoPlugin.send(
          {
            "message": {
              "request": "exists",
              "room": self.janusVideoRoomID
            },
            success: function(result){
              if (result.exists == true){
                self.janusVideoPlugin.send(
                  {
                    "message": {
                      "request": "join",
                      "room": self.janusVideoRoomID,
                      "ptype": "publisher",
                      // FIXME : allow dev to add username here
                      //"display": 'phil'
                    },
                    success: function(result){
                      LOGGER.log('JOINED ROOM FOR VIDEO');
                      typeof callbackSuccess === 'function' && callbackSuccess();
                    }
                  }
                );
              } else {
                self.janusVideoPlugin.send(
                  {
                    "message": {
                      "request": "create",
                      "room": self.janusVideoRoomID,
                      "ptype": "publisher",
                      // FIXME : allow dev to add username here
                      // "display": 'phil'
                    },
                    success: function(result){
                      LOGGER.log('ROOM CREATED FOR VIDEO');
                      self.janusVideoPlugin.send(
                        {
                          "message": {
                            "request": "join",
                            "room": self.janusVideoRoomID,
                            "ptype": "publisher",
                            "display": 'phil'
                          },
                          success: function(result){
                            LOGGER.log('JOINED ROOM FOR VIDEO');
                            typeof callbackSuccess === 'function' && callbackSuccess();
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          });
      },
      error: function(error) {
        Janus.error("  -- Error attaching plugin...", error);
      },
      consentDialog: function(on) {
				Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
				if(on) {
          console.log('Ask consent');
					// Darken screen and show hint
          /*
					$.blockUI({
						message: '<div><img src="up_arrow.png"/></div>',
						css: {
							border: 'none',
							padding: '15px',
							backgroundColor: 'transparent',
							color: '#aaa',
							top: '10px',
							left: (navigator.mozGetUserMedia ? '-100px' : '300px')
						} });
            */
				} else {
          console.log('Ask consent');
					// Restore screen
					// $.unblockUI();
				}
			},
      mediaState: function(medium, on) {
        Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
      },
      webrtcState: function(on) {
        Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
      },
      onmessage: function(msg, jsep) {
        Janus.debug(" ::: Got a message (publisher) :::");
        Janus.debug(msg);
        var event = msg["videoroom"];
        Janus.debug("Event: " + event);
        if(event != undefined && event != null) {
          if(event === "joined") {
            // Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
            Janus.log("Successfully joined room " + msg["room"] + " with ID " + msg["id"]);
//            _publishOwnVideoFeed.call(self, false);
            // Any new feed to attach to?
            if(msg["publishers"] !== undefined && msg["publishers"] !== null) {
              var list = msg["publishers"];
              Janus.debug("Got a list of available publishers/feeds:");
              Janus.debug(list);
              for(var f in list) {
                var id = list[f]["id"];
                var display = list[f]["display"];
                var audio = list[f]["audio_codec"];
                var video = list[f]["video_codec"];
                Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                _newRemoteFeed.call(self, id, display, audio, video);
              }
            }
          } else if(event === "destroyed") {
            // The room has been destroyed
            Janus.warn("The room has been destroyed!");
          } else if(event === "event") {
            // Any new feed to attach to?
            if(msg["publishers"] !== undefined && msg["publishers"] !== null) {
              var list = msg["publishers"];
              Janus.debug("Got a list of available publishers/feeds:");
              Janus.debug(list);
              for(var f in list) {
                var id = list[f]["id"];
                var display = list[f]["display"];
                var audio = list[f]["audio_codec"];
                var video = list[f]["video_codec"];
                Janus.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                _newRemoteFeed.call(self, id, display, audio, video);
              }
            } else if(msg["leaving"] !== undefined && msg["leaving"] !== null) {
              // One of the publishers has gone away?
              var leaving = msg["leaving"];
              Janus.log("Publisher left: " + leaving);
              var remoteFeed = null;
              for(var i=1; i<6; i++) {
                if(self.janusFeeds[i] != null && self.janusFeeds[i] != undefined && self.janusFeeds[i].rfid == leaving) {
                  remoteFeed = self.janusFeeds[i];
                  break;
                }
              }
              if(remoteFeed != null) {
                Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                self.janusFeeds[remoteFeed.rfindex] = null;
                remoteFeed.detach();
              }
            } else if(msg["unpublished"] !== undefined && msg["unpublished"] !== null) {
              // One of the publishers has unpublished?
              var unpublished = msg["unpublished"];
              Janus.log("Publisher left: " + unpublished);
              if(unpublished === 'ok') {
                // That's us
                self.janusVideoPlugin.hangup();
                return;
              }
              var remoteFeed = null;
              for(var i=1; i<6; i++) {
                if(self.janusFeeds[i] != null && self.janusFeeds[i] != undefined && self.janusFeeds[i].rfid == unpublished) {
                  remoteFeed = self.janusFeeds[i];
                  break;
                }
              }
              if(remoteFeed != null) {
                Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                let target = document.querySelector(`#${self.janusVideoOptions.remoteVideosContainerId} div[remoteid='${remoteFeed.rfindex}']`);
                target.innerHTML = '';
//                $('#remote'+remoteFeed.rfindex).empty().hide();
//                $('#videoremote'+remoteFeed.rfindex).empty();
                self.janusFeeds[remoteFeed.rfindex] = null;
                remoteFeed.detach();
              }
            } else if(msg["error"] !== undefined && msg["error"] !== null) {
              if(msg["error_code"] === 426) {
                // This is a "no such room" error: give a more meaningful description
                Janus.debug("No such room...");
              }
            }
          }
        }

        if(jsep !== undefined && jsep !== null) {
          Janus.debug("Handling SDP as well...");
          Janus.debug(jsep);
          self.janusVideoPlugin.handleRemoteJsep({jsep: jsep});
          // Check if any of the media we wanted to publish has
          // been rejected (e.g., wrong or unsupported codec)
          var audio = msg["audio_codec"];
          if(self.janusVideoStream && self.janusVideoStream.getAudioTracks() && self.janusVideoStream.getAudioTracks().length > 0 && !audio) {
            // Audio has been rejected
            Janus.log("Our audio stream has been rejected, viewers won't hear us");
          }
          var video = msg["video_codec"];
          if(self.janusVideoStream && self.janusVideoStream.getVideoTracks() && self.janusVideoStream.getVideoTracks().length > 0 && !video) {
            // Video has been rejected
            Janus.log("Our video stream has been rejected, viewers won't see us");
          }
        }
      },
      onlocalstream: function(stream) {
        Janus.debug(" ::: Got a local stream :::");
        self.janusVideoStream = stream;
        Janus.debug(stream);

        let localVideoElement = document.querySelector(`#${self.janusVideoOptions.localVideoContainerId} video`);
        let remoteVideosContainerElement = document.querySelector(`#${self.janusVideoOptions.remoteVideosContainerId}`);

        if (localVideoElement === null || typeof localVideoElement === 'undefined') {
          localVideoElement = document.createElement('video');

          localVideoElement.style.height = '100%';
          localVideoElement.style.width = '100%';
          localVideoElement.autoplay = true;
          document.getElementById(self.janusVideoOptions.localVideoContainerId)
          .appendChild(localVideoElement);
        } else {
          localVideoElement.autoplay = true;
        }

        Janus.attachMediaStream(localVideoElement, stream);
        if(self.janusVideoPlugin.webrtcStuff.pc.iceConnectionState !== "completed" &&
        self.janusVideoPlugin.webrtcStuff.pc.iceConnectionState !== "connected") {
          console.log('Publishing video...');
        }
        var videoTracks = stream.getVideoTracks();
        if(videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
          // No webcam
          console.log('No webcam');
        } else {
          console.log('Need webcam');
        }
      },
      onremotestream: function(stream) {
        // The publisher stream is sendonly, we don't expect anything here
      },
      oncleanup: function() {
        Janus.log(" ::: Got a cleanup notification: we are unpublished now :::");
        self.janusVideoStream = null;
      }
    });
}

function _newRemoteFeed(id, display, audio, video) {
  const self = this;
	// A new feed has been published, create a new plugin handle and attach to it as a subscriber
	var remoteFeed = null;
	this.janusInstance.attach(
		{
			plugin: "janus.plugin.videoroom",
			opaqueId: "videoroomtest-123465464574746",
			success: function(pluginHandle) {
				remoteFeed = pluginHandle;
				remoteFeed.simulcastStarted = false;
				Janus.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
				Janus.log("  -- This is a subscriber");
				// We wait for the plugin to send us an offer
        //	var listen = { "request": "join", "room": myroom, "ptype": "subscriber", "feed": id, "private_id": mypvtid };
				var listen = { "request": "join", "room": self.janusVideoRoomID, "ptype": "subscriber", "feed": id };
				// In case you don't want to receive audio, video or data, even if the
				// publisher is sending them, set the 'offer_audio', 'offer_video' or
				// 'offer_data' properties to false (they're true by default), e.g.:
				// 		listen["offer_video"] = false;
				// For example, if the publisher is VP8 and this is Safari, let's avoid video
				if(video !== "h264" && Janus.webRTCAdapter.browserDetails.browser === "safari") {
					if(video)
						video = video.toUpperCase()
					console.log("Publisher is using " + video + ", but Safari doesn't support it: disabling video");
					listen["offer_video"] = false;
				}
				remoteFeed.send({"message": listen});
			},
			error: function(error) {
				Janus.error("  -- Error attaching plugin...", error);
				bootbox.alert("Error attaching plugin... " + error);
			},
			onmessage: function(msg, jsep) {
				Janus.debug(" ::: Got a message (subscriber) :::");
				Janus.debug(msg);
				var event = msg["videoroom"];
				Janus.debug("Event: " + event);
				if(msg["error"] !== undefined && msg["error"] !== null) {
					bootbox.alert(msg["error"]);
				} else if(event != undefined && event != null) {
					if(event === "attached") {
						// Subscriber created and attached
						for(var i=1;i<6;i++) {
							if(self.janusFeeds[i] === undefined || self.janusFeeds[i] === null) {
								self.janusFeeds[i] = remoteFeed;
								remoteFeed.rfindex = i;
								break;
							}
						}
						remoteFeed.rfid = msg["id"];
						remoteFeed.rfdisplay = msg["display"];

            var target = document.querySelector(`#${self.janusVideoOptions.remoteVideosContainerId} div[remoteid='${remoteFeed.rfindex}]'`);
            if (target === null || typeof target === 'undefined') {
              const remoteVideoElement = document.createElement('div');
              remoteVideoElement.setAttribute('remoteid', remoteFeed.rfindex);

              document
              .querySelector(`#${self.janusVideoOptions.remoteVideosContainerId}`)
              .appendChild(remoteVideoElement);
            }

						Janus.log("Successfully attached to feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") in room " + msg["room"]);
						//$('#remote'+remoteFeed.rfindex).removeClass('hide').html(remoteFeed.rfdisplay).show();
					} else if(event === "event") {
						// Check if we got an event on a simulcast-related event from this publisher
						var substream = msg["substream"];
						var temporal = msg["temporal"];
						if((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
							if(!remoteFeed.simulcastStarted) {
								remoteFeed.simulcastStarted = true;
								// Add some new buttons
								addSimulcastButtons(remoteFeed.rfindex);
							}
							// We just received notice that there's been a switch, update the buttons
							updateSimulcastButtons(remoteFeed.rfindex, substream, temporal);
						}
					} else {
						// What has just happened?
					}
				}
				if(jsep !== undefined && jsep !== null) {
					Janus.debug("Handling SDP as well...");
					Janus.debug(jsep);
					// Answer and attach
					remoteFeed.createAnswer(
						{
							jsep: jsep,
							// Add data:true here if you want to subscribe to datachannels as well
							// (obviously only works if the publisher offered them in the first place)
							media: { audioSend: false, videoSend: false },	// We want recvonly audio/video
							success: function(jsep) {
								Janus.debug("Got SDP!");
								Janus.debug(jsep);
								var body = { "request": "start", "room": self.janusVideoRoomID };
								remoteFeed.send({"message": body, "jsep": jsep});
							},
							error: function(error) {
								Janus.error("WebRTC error:", error);
								bootbox.alert("WebRTC error... " + JSON.stringify(error));
							}
						});
				}
			},
			webrtcState: function(on) {
				Janus.log("Janus says this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") is " + (on ? "up" : "down") + " now");
			},
			onlocalstream: function(stream) {
				// The subscriber stream is recvonly, we don't expect anything here
			},
			onremotestream: function(stream) {
				Janus.debug("Remote feed #" + remoteFeed.rfindex);
				var addButtons = false;
        const target = document.querySelector(`#${self.janusVideoOptions.remoteVideosContainerId} div[remoteid='${remoteFeed.rfindex}']`);
        //if($('#remotevideo'+remoteFeed.rfindex).length === 0) {
				if(target.length === 0 || typeof target.length === 'undefined') {
					addButtons = true;
					// No remote video yet
					let innerHTML = '<video id="remotevideo' + remoteFeed.rfindex + '" width="100%" height="100%" autoplay/>';

          target.innerHTML = innerHTML;
				}
				Janus.attachMediaStream(target.querySelector('video'), stream);
				var videoTracks = stream.getVideoTracks();
				if(videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
					// No remote video
          let innerHTML = '<div class="no-video-container">' +
            '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
            '<span class="no-video-text">No remote video available</span>' +
          '</div>';

          target.innerHTML = innerHTML;
				}
			},
			oncleanup: function() {
				Janus.log(" ::: Got a cleanup notification (remote feed " + id + ") :::");
        const target = document.querySelector(`#${self.janusVideoOptions.remoteVideosContainerId} div[remoteid='${remoteFeed.rfindex}']`);
        target.parentNode.removeChild(target);
			}
		});
}

function muteVideo() {
  return this.janusInitOk && this.janusVideoPlugin.muteVideo()
}

function unmuteVideo() {
  return this.janusInitOk && this.janusVideoPlugin.unmuteVideo()
}

/**
* Calls detach on our Janus video plugin, then destroy on our Janus instance
*/
function detachVideo() {
  const self = this;

  this.janusVideoPlugin && this.janusVideoPlugin.detach({
    success: function() {
      self.janusInstance.destroy();
    },
    error: function() {
      LOGGER.log(`Failed to properly detach our Video plugin from Janus, hoping for the best...`);
      self.janusInstance.destroy();
    }
  });
}

function publishMyVideoInRoom() {
  if (this.janusInitOk !== true) {
    LOGGER.log('Please call initVideoInConferenceRoom() first');
    return;
  }
  this.janusInitOk && _publishOwnVideoFeed.call(this, false);
}

function initVideoInConferenceRoom(options = {}, callbackSuccess, callbackError){
  const self = this;

  if (typeof options === 'function') {
    LOGGER.log(`Please provide a valid option object`);
    return;
  }

  if (this.callType !== 'conference') {
    LOGGER.log(`Not in a conference room, won't start video`);
    return;
  }

  if (this.janusInitOk === true) {
    LOGGER.log(`Video is already initialized in this room`);
    return;
  }

  this.janusVideoOptions = Object.assign({
    localVideoContainerId: 'apidaze-local-video-container-id',
    remoteVideosContainerId: 'apidaze-remote-videos-container-id'
  }, options);

  // Check whether DOM containers exist, create otherwise and append to <body/>
  if (document.getElementById(this.janusVideoOptions.localVideoContainerId) == null) {
    const localVideoContainer = document.createElement('div');
    localVideoContainer.id = self.janusVideoOptions.localVideoContainerId;
    document.body.appendChild(localVideoContainer);
  }

  if (document.getElementById(this.janusVideoOptions.remoteVideosContainerId) == null) {
    const remoteVideosContainer = document.createElement('div');
    remoteVideosContainer.id = this.janusVideoOptions.remoteVideosContainerId;
    document.body.appendChild(remoteVideosContainer);
  }

  LOGGER.log(`Starting video in room ${this.conferenceName}`);
  Janus.init({
    debug: "all",
    dependencies: {
      webRTCAdapter: WebRTCAdapter
    },
    callback: function() {
      self.janusInitOk = true;
      self.janusInstance = new Janus({
        server: 'wss://ws2-dev-us-nyc-1.apidaze.io:8989',
        success: function() {
          LOGGER.log('Janus Instance created');
          self.janusVideoRoomID = Utils.hashCode(self.conferenceName);
          _attachJanusVideoPlugin.call(self, callbackSuccess, callbackError);
        },
        error: function(error) {
          Janus.error(error);
          self.janusInitOk = false;
          self.janusInstance = null;
          self.janusVideoPlugin = null;
          self.janusVideoStream = null;
          self.janusFeeds = [];
          self.janusVideoRoomID = 0;

          typeof callbackError === 'function' && callbackError(error);
        },
        destroyed: function() {
          LOGGER.log('Janus Instance destroyed');
          self.janusInitOk = false;
          self.janusInstance = null;
          self.janusVideoPlugin = null;
          self.janusVideoStream = null;
          self.janusFeeds = [];
          self.janusVideoRoomID = 0;

          const localVideoContainerElement = document
          .getElementById(self.janusVideoOptions.localVideoContainerId);

          if (localVideoContainerElement !== null) {
            localVideoContainerElement.innerHTML = '';
          }

          const remoteVideosContainerElement = document.
          getElementById(self.janusVideoOptions.remoteVideosContainerId);

          if (remoteVideosContainerElement !== null) {
            remoteVideosContainerElement.innerHTML = '';
          }
        }
      });
    }
  });
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

function inviteToConference(number, caller_id_number){
  var roomName = this.conferenceName.substring(this.conferenceName.indexOf("-") + 1);
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
};

function unmuteAllInConference(){
  var roomName = this.conferenceName.substring(this.conferenceName.indexOf("-") + 1);
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
};

function muteAllInConference(){
  var roomName = this.conferenceName.substring(this.conferenceName.indexOf("-") + 1);
  LOGGER.log("Mute everybody in conference " + roomName);
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  request.params = {
    callID: this.callID,
    action: "muteAllInConference",
    destination: roomName,
  };

  this.clientObj._sendMessage(JSON.stringify(request));
};

function toggleMuteInConference(conferenceMemberID){
  var roomName = this.conferenceName.substring(this.conferenceName.indexOf("-") + 1);
  LOGGER.log("Toggling mute status for member (" + conferenceMemberID + ") in conference " + roomName);
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
};

function unmuteInConference(conferenceMemberID){
  var roomName = this.conferenceName.substring(this.conferenceName.indexOf("-") + 1);
  LOGGER.log("Unmuting member (" + conferenceMemberID + ") in conference " + roomName);
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
};

function muteInConference(conferenceMemberID){
  var roomName = this.conferenceName.substring(this.conferenceName.indexOf("-") + 1);
  LOGGER.log("Muting member (" + conferenceMemberID + ") in conference " + roomName);
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
};

function kickFromConference(conferenceMemberID){
  var roomName = this.conferenceName.substring(this.conferenceName.indexOf("-") + 1);
  LOGGER.log("Kicking member (" + conferenceMemberID + ") out of conference " + roomName);
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
};

function modify(action, destination) {
  LOGGER.log(LOG_PREFIX, "Modifying call (", action, ") with id :", this.callID);
  var request = {};
  request.wsp_version = "1";
  request.method = "modify";
  switch(action) {
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
};

function dualTransfer(aleg_exten, bleg_exten){
  LOGGER.log(LOG_PREFIX, "dualTransfer called, aleg_exten :", aleg_exten, "bleg_exten :", bleg_exten);
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
};

function transferBleg(exten){
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
      'OfferToReceiveAudio': true,
      'OfferToReceiveVideo': false
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
      LOGGER.log("Got all our ICE candidates, thanks!");
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
    LOGGER.log("Got all our ICE candidates (from onicegatheringstatechange), thanks!");
    startCall.call(self);
  }
}

/**
* Starts call by sending our SDP to FreeSWITCH in a call or reattach message
*/
function startCall(){
  LOGGER.log("Sending message");
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

  if (this.extraLocalAudioVideoStream && this.extraLocalAudioVideoStream.active === true) {
    LOGGER.log("We have an extra MediaStream, probably because we are sharing the screen, let's close it")
    this.extraLocalAudioVideoStream.getTracks().forEach(
      function(track) {
        track.stop();
      }
    );
  }

  this.localAudioVideoStream.getTracks().forEach(
    function(track) {
      track.stop();
    }
  );

  let audioVideoDOMContainerObj = document.getElementById(this.audioVideoTagId);
  if (audioVideoDOMContainerObj) {
    audioVideoDOMContainerObj.parentNode.removeChild(audioVideoDOMContainerObj);
  }

  this.janusInstance && this.janusInstance.destroy();

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
    energyScore: status.audio.energyScore.toString(),
    sessid: dataArray[7]
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
    caller_id_number: dataArray[1],
    sessid: dataArray[7]
  };

  typeof this.userRoomAddCallback === "function" && this.userRoomAddCallback(event);
}

function handleRoomDel(dataArray){
  LOGGER.log("Del event : " + JSON.stringify(dataArray));
  var status = JSON.parse(dataArray[4]);
  var event = {
    type: "room.del",
    conferenceMemberID: parseInt(dataArray[0]).toString(),
    nickname: dataArray[2],
    caller_id_number: dataArray[1],
    sessid: dataArray[7]
  };

  typeof this.userRoomDelCallback === "function" && this.userRoomDelCallback(event);
}

function handleRinging(userCallback){
 LOGGER.log("Ringing");
 typeof this.userRingingCallback === "function" && this.userRingingCallback();
}

function handleAnswer(userCallback){
  LOGGER.log("Answer");
  typeof this.userAnswerCallback === "function" && this.userAnswerCallback();
}

function handleGUMSuccess(stream){
  LOGGER.log("WebRTC Ok");
  this.localAudioVideoStream = stream;
}

function handleGUMError(error){
  LOGGER.log("Failed to get local media device (camera, mic, screen)");
  this.clientObj._onError({origin: "call", message: "Failed to get local media device (camera, mic, screen) : " + error.name});
}

export default Call;
