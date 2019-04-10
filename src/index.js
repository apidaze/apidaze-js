import CLIENT from "./CLIENT.js";
import * as WebRTCAdapter from "webrtc-adapter";
import Logger from "./Logger.js";

var __VERSION__ = process.env.VERSIONSTR; // webpack defineplugin variable
var version = __VERSION__;

var LOG_PREFIX = "APIdaze-" + __VERSION__;

const isWebRTCSupported = function() {
  return (
    typeof WebRTCAdapter.browserDetails === "object" &&
    typeof WebRTCAdapter.browserShim === "object"
  );
};

const browserDetails = WebRTCAdapter.browserDetails;

export { version, isWebRTCSupported, browserDetails, CLIENT };
