(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["APIdaze"] = factory();
	else
		root["APIdaze"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */


var logDisabled_ = true;
var deprecationWarnings_ = true;

/**
 * Extract browser version out of the provided user agent string.
 *
 * @param {!string} uastring userAgent string.
 * @param {!string} expr Regular expression used as match criteria.
 * @param {!number} pos position in the version string to be returned.
 * @return {!number} browser version.
 */
function extractVersion(uastring, expr, pos) {
  var match = uastring.match(expr);
  return match && match.length >= pos && parseInt(match[pos], 10);
}

// Utility methods.
module.exports = {
  extractVersion: extractVersion,
  disableLog: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    logDisabled_ = bool;
    return (bool) ? 'adapter.js logging disabled' :
        'adapter.js logging enabled';
  },

  /**
   * Disable or enable deprecation warnings
   * @param {!boolean} bool set to true to disable warnings.
   */
  disableWarnings: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    deprecationWarnings_ = !bool;
    return 'adapter.js deprecation warnings ' + (bool ? 'disabled' : 'enabled');
  },

  log: function() {
    if (typeof window === 'object') {
      if (logDisabled_) {
        return;
      }
      if (typeof console !== 'undefined' && typeof console.log === 'function') {
        console.log.apply(console, arguments);
      }
    }
  },

  /**
   * Shows a deprecation warning suggesting the modern and spec-compatible API.
   */
  deprecated: function(oldMethod, newMethod) {
    if (!deprecationWarnings_) {
      return;
    }
    console.warn(oldMethod + ' is deprecated, please use ' + newMethod +
        ' instead.');
  },

  /**
   * Browser detector.
   *
   * @return {object} result containing browser and version
   *     properties.
   */
  detectBrowser: function(window) {
    var navigator = window && window.navigator;

    // Returned result object.
    var result = {};
    result.browser = null;
    result.version = null;

    // Fail early if it's not a browser
    if (typeof window === 'undefined' || !window.navigator) {
      result.browser = 'Not a browser.';
      return result;
    }

    // Firefox.
    if (navigator.mozGetUserMedia) {
      result.browser = 'firefox';
      result.version = extractVersion(navigator.userAgent,
          /Firefox\/(\d+)\./, 1);
    } else if (navigator.webkitGetUserMedia) {
      // Chrome, Chromium, Webview, Opera, all use the chrome shim for now
      if (window.webkitRTCPeerConnection) {
        result.browser = 'chrome';
        result.version = extractVersion(navigator.userAgent,
          /Chrom(e|ium)\/(\d+)\./, 2);
      } else { // Safari (in an unpublished version) or unknown webkit-based.
        if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
          result.browser = 'safari';
          result.version = extractVersion(navigator.userAgent,
            /AppleWebKit\/(\d+)\./, 1);
        } else { // unknown webkit-based browser.
          result.browser = 'Unsupported webkit-based browser ' +
              'with GUM support but no WebRTC support.';
          return result;
        }
      }
    } else if (navigator.mediaDevices &&
        navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) { // Edge.
      result.browser = 'edge';
      result.version = extractVersion(navigator.userAgent,
          /Edge\/(\d+).(\d+)$/, 2);
    } else if (navigator.mediaDevices &&
        navigator.userAgent.match(/AppleWebKit\/(\d+)\./)) {
        // Safari, with webkitGetUserMedia removed.
      result.browser = 'safari';
      result.version = extractVersion(navigator.userAgent,
          /AppleWebKit\/(\d+)\./, 1);
    } else { // Default fallthrough: not supported.
      result.browser = 'Not a supported browser.';
      return result;
    }

    return result;
  }
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var Logger = function Logger(debug, prefix) {
  this._debug = debug;
  this._prefix = prefix;

  this.log = function () {
    if (this._debug) {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(prefix + " ");
      console.log.apply(console, args);
    }
  };
};

exports.default = Logger;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */



var adapterFactory = __webpack_require__(9);
module.exports = adapterFactory({window: global.window});

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(8)))

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
 /* eslint-env node */


// SDP helpers.
var SDPUtils = {};

// Generate an alphanumeric identifier for cname or mids.
// TODO: use UUIDs instead? https://gist.github.com/jed/982883
SDPUtils.generateIdentifier = function() {
  return Math.random().toString(36).substr(2, 10);
};

// The RTCP CNAME used by all peerconnections from the same JS.
SDPUtils.localCName = SDPUtils.generateIdentifier();

// Splits SDP into lines, dealing with both CRLF and LF.
SDPUtils.splitLines = function(blob) {
  return blob.trim().split('\n').map(function(line) {
    return line.trim();
  });
};
// Splits SDP into sessionpart and mediasections. Ensures CRLF.
SDPUtils.splitSections = function(blob) {
  var parts = blob.split('\nm=');
  return parts.map(function(part, index) {
    return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
  });
};

// Returns lines that start with a certain prefix.
SDPUtils.matchPrefix = function(blob, prefix) {
  return SDPUtils.splitLines(blob).filter(function(line) {
    return line.indexOf(prefix) === 0;
  });
};

// Parses an ICE candidate line. Sample input:
// candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
// rport 55996"
SDPUtils.parseCandidate = function(line) {
  var parts;
  // Parse both variants.
  if (line.indexOf('a=candidate:') === 0) {
    parts = line.substring(12).split(' ');
  } else {
    parts = line.substring(10).split(' ');
  }

  var candidate = {
    foundation: parts[0],
    component: parseInt(parts[1], 10),
    protocol: parts[2].toLowerCase(),
    priority: parseInt(parts[3], 10),
    ip: parts[4],
    port: parseInt(parts[5], 10),
    // skip parts[6] == 'typ'
    type: parts[7]
  };

  for (var i = 8; i < parts.length; i += 2) {
    switch (parts[i]) {
      case 'raddr':
        candidate.relatedAddress = parts[i + 1];
        break;
      case 'rport':
        candidate.relatedPort = parseInt(parts[i + 1], 10);
        break;
      case 'tcptype':
        candidate.tcpType = parts[i + 1];
        break;
      case 'ufrag':
        candidate.ufrag = parts[i + 1]; // for backward compability.
        candidate.usernameFragment = parts[i + 1];
        break;
      default: // extension handling, in particular ufrag
        candidate[parts[i]] = parts[i + 1];
        break;
    }
  }
  return candidate;
};

// Translates a candidate object into SDP candidate attribute.
SDPUtils.writeCandidate = function(candidate) {
  var sdp = [];
  sdp.push(candidate.foundation);
  sdp.push(candidate.component);
  sdp.push(candidate.protocol.toUpperCase());
  sdp.push(candidate.priority);
  sdp.push(candidate.ip);
  sdp.push(candidate.port);

  var type = candidate.type;
  sdp.push('typ');
  sdp.push(type);
  if (type !== 'host' && candidate.relatedAddress &&
      candidate.relatedPort) {
    sdp.push('raddr');
    sdp.push(candidate.relatedAddress); // was: relAddr
    sdp.push('rport');
    sdp.push(candidate.relatedPort); // was: relPort
  }
  if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
    sdp.push('tcptype');
    sdp.push(candidate.tcpType);
  }
  if (candidate.ufrag) {
    sdp.push('ufrag');
    sdp.push(candidate.ufrag);
  }
  return 'candidate:' + sdp.join(' ');
};

// Parses an ice-options line, returns an array of option tags.
// a=ice-options:foo bar
SDPUtils.parseIceOptions = function(line) {
  return line.substr(14).split(' ');
}

// Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
// a=rtpmap:111 opus/48000/2
SDPUtils.parseRtpMap = function(line) {
  var parts = line.substr(9).split(' ');
  var parsed = {
    payloadType: parseInt(parts.shift(), 10) // was: id
  };

  parts = parts[0].split('/');

  parsed.name = parts[0];
  parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
  // was: channels
  parsed.numChannels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
  return parsed;
};

// Generate an a=rtpmap line from RTCRtpCodecCapability or
// RTCRtpCodecParameters.
SDPUtils.writeRtpMap = function(codec) {
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
      (codec.numChannels !== 1 ? '/' + codec.numChannels : '') + '\r\n';
};

// Parses an a=extmap line (headerextension from RFC 5285). Sample input:
// a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
// a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
SDPUtils.parseExtmap = function(line) {
  var parts = line.substr(9).split(' ');
  return {
    id: parseInt(parts[0], 10),
    direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
    uri: parts[1]
  };
};

// Generates a=extmap line from RTCRtpHeaderExtensionParameters or
// RTCRtpHeaderExtension.
SDPUtils.writeExtmap = function(headerExtension) {
  return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
      (headerExtension.direction && headerExtension.direction !== 'sendrecv'
          ? '/' + headerExtension.direction
          : '') +
      ' ' + headerExtension.uri + '\r\n';
};

// Parses an ftmp line, returns dictionary. Sample input:
// a=fmtp:96 vbr=on;cng=on
// Also deals with vbr=on; cng=on
SDPUtils.parseFmtp = function(line) {
  var parsed = {};
  var kv;
  var parts = line.substr(line.indexOf(' ') + 1).split(';');
  for (var j = 0; j < parts.length; j++) {
    kv = parts[j].trim().split('=');
    parsed[kv[0].trim()] = kv[1];
  }
  return parsed;
};

// Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeFmtp = function(codec) {
  var line = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.parameters && Object.keys(codec.parameters).length) {
    var params = [];
    Object.keys(codec.parameters).forEach(function(param) {
      params.push(param + '=' + codec.parameters[param]);
    });
    line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
  }
  return line;
};

// Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
// a=rtcp-fb:98 nack rpsi
SDPUtils.parseRtcpFb = function(line) {
  var parts = line.substr(line.indexOf(' ') + 1).split(' ');
  return {
    type: parts.shift(),
    parameter: parts.join(' ')
  };
};
// Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeRtcpFb = function(codec) {
  var lines = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
    // FIXME: special handling for trr-int?
    codec.rtcpFeedback.forEach(function(fb) {
      lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
      (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
          '\r\n';
    });
  }
  return lines;
};

// Parses an RFC 5576 ssrc media attribute. Sample input:
// a=ssrc:3735928559 cname:something
SDPUtils.parseSsrcMedia = function(line) {
  var sp = line.indexOf(' ');
  var parts = {
    ssrc: parseInt(line.substr(7, sp - 7), 10)
  };
  var colon = line.indexOf(':', sp);
  if (colon > -1) {
    parts.attribute = line.substr(sp + 1, colon - sp - 1);
    parts.value = line.substr(colon + 1);
  } else {
    parts.attribute = line.substr(sp + 1);
  }
  return parts;
};

// Extracts the MID (RFC 5888) from a media section.
// returns the MID or undefined if no mid line was found.
SDPUtils.getMid = function(mediaSection) {
  var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
  if (mid) {
    return mid.substr(6);
  }
}

SDPUtils.parseFingerprint = function(line) {
  var parts = line.substr(14).split(' ');
  return {
    algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
    value: parts[1]
  };
};

// Extracts DTLS parameters from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the fingerprint line as input. See also getIceParameters.
SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
      'a=fingerprint:');
  // Note: a=setup line is ignored since we use the 'auto' role.
  // Note2: 'algorithm' is not case sensitive except in Edge.
  return {
    role: 'auto',
    fingerprints: lines.map(SDPUtils.parseFingerprint)
  };
};

// Serializes DTLS parameters to SDP.
SDPUtils.writeDtlsParameters = function(params, setupType) {
  var sdp = 'a=setup:' + setupType + '\r\n';
  params.fingerprints.forEach(function(fp) {
    sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
  });
  return sdp;
};
// Parses ICE information from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the ice-ufrag and ice-pwd lines as input.
SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.splitLines(mediaSection);
  // Search in session part, too.
  lines = lines.concat(SDPUtils.splitLines(sessionpart));
  var iceParameters = {
    usernameFragment: lines.filter(function(line) {
      return line.indexOf('a=ice-ufrag:') === 0;
    })[0].substr(12),
    password: lines.filter(function(line) {
      return line.indexOf('a=ice-pwd:') === 0;
    })[0].substr(10)
  };
  return iceParameters;
};

// Serializes ICE parameters to SDP.
SDPUtils.writeIceParameters = function(params) {
  return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
      'a=ice-pwd:' + params.password + '\r\n';
};

// Parses the SDP media section and returns RTCRtpParameters.
SDPUtils.parseRtpParameters = function(mediaSection) {
  var description = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: [],
    rtcp: []
  };
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
    var pt = mline[i];
    var rtpmapline = SDPUtils.matchPrefix(
        mediaSection, 'a=rtpmap:' + pt + ' ')[0];
    if (rtpmapline) {
      var codec = SDPUtils.parseRtpMap(rtpmapline);
      var fmtps = SDPUtils.matchPrefix(
          mediaSection, 'a=fmtp:' + pt + ' ');
      // Only the first a=fmtp:<pt> is considered.
      codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
      codec.rtcpFeedback = SDPUtils.matchPrefix(
          mediaSection, 'a=rtcp-fb:' + pt + ' ')
        .map(SDPUtils.parseRtcpFb);
      description.codecs.push(codec);
      // parse FEC mechanisms from rtpmap lines.
      switch (codec.name.toUpperCase()) {
        case 'RED':
        case 'ULPFEC':
          description.fecMechanisms.push(codec.name.toUpperCase());
          break;
        default: // only RED and ULPFEC are recognized as FEC mechanisms.
          break;
      }
    }
  }
  SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
    description.headerExtensions.push(SDPUtils.parseExtmap(line));
  });
  // FIXME: parse rtcp.
  return description;
};

// Generates parts of the SDP media section describing the capabilities /
// parameters.
SDPUtils.writeRtpDescription = function(kind, caps) {
  var sdp = '';

  // Build the mline.
  sdp += 'm=' + kind + ' ';
  sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
  sdp += ' UDP/TLS/RTP/SAVPF ';
  sdp += caps.codecs.map(function(codec) {
    if (codec.preferredPayloadType !== undefined) {
      return codec.preferredPayloadType;
    }
    return codec.payloadType;
  }).join(' ') + '\r\n';

  sdp += 'c=IN IP4 0.0.0.0\r\n';
  sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

  // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
  caps.codecs.forEach(function(codec) {
    sdp += SDPUtils.writeRtpMap(codec);
    sdp += SDPUtils.writeFmtp(codec);
    sdp += SDPUtils.writeRtcpFb(codec);
  });
  var maxptime = 0;
  caps.codecs.forEach(function(codec) {
    if (codec.maxptime > maxptime) {
      maxptime = codec.maxptime;
    }
  });
  if (maxptime > 0) {
    sdp += 'a=maxptime:' + maxptime + '\r\n';
  }
  sdp += 'a=rtcp-mux\r\n';

  caps.headerExtensions.forEach(function(extension) {
    sdp += SDPUtils.writeExtmap(extension);
  });
  // FIXME: write fecMechanisms.
  return sdp;
};

// Parses the SDP media section and returns an array of
// RTCRtpEncodingParameters.
SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
  var encodingParameters = [];
  var description = SDPUtils.parseRtpParameters(mediaSection);
  var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
  var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

  // filter a=ssrc:... cname:, ignore PlanB-msid
  var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
    return parts.attribute === 'cname';
  });
  var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
  var secondarySsrc;

  var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
  .map(function(line) {
    var parts = line.split(' ');
    parts.shift();
    return parts.map(function(part) {
      return parseInt(part, 10);
    });
  });
  if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
    secondarySsrc = flows[0][1];
  }

  description.codecs.forEach(function(codec) {
    if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
      var encParam = {
        ssrc: primarySsrc,
        codecPayloadType: parseInt(codec.parameters.apt, 10),
        rtx: {
          ssrc: secondarySsrc
        }
      };
      encodingParameters.push(encParam);
      if (hasRed) {
        encParam = JSON.parse(JSON.stringify(encParam));
        encParam.fec = {
          ssrc: secondarySsrc,
          mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
        };
        encodingParameters.push(encParam);
      }
    }
  });
  if (encodingParameters.length === 0 && primarySsrc) {
    encodingParameters.push({
      ssrc: primarySsrc
    });
  }

  // we support both b=AS and b=TIAS but interpret AS as TIAS.
  var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
  if (bandwidth.length) {
    if (bandwidth[0].indexOf('b=TIAS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(7), 10);
    } else if (bandwidth[0].indexOf('b=AS:') === 0) {
      // use formula from JSEP to convert b=AS to TIAS value.
      bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95
          - (50 * 40 * 8);
    } else {
      bandwidth = undefined;
    }
    encodingParameters.forEach(function(params) {
      params.maxBitrate = bandwidth;
    });
  }
  return encodingParameters;
};

// parses http://draft.ortc.org/#rtcrtcpparameters*
SDPUtils.parseRtcpParameters = function(mediaSection) {
  var rtcpParameters = {};

  var cname;
  // Gets the first SSRC. Note that with RTX there might be multiple
  // SSRCs.
  var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
      .map(function(line) {
        return SDPUtils.parseSsrcMedia(line);
      })
      .filter(function(obj) {
        return obj.attribute === 'cname';
      })[0];
  if (remoteSsrc) {
    rtcpParameters.cname = remoteSsrc.value;
    rtcpParameters.ssrc = remoteSsrc.ssrc;
  }

  // Edge uses the compound attribute instead of reducedSize
  // compound is !reducedSize
  var rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
  rtcpParameters.reducedSize = rsize.length > 0;
  rtcpParameters.compound = rsize.length === 0;

  // parses the rtcp-mux attrіbute.
  // Note that Edge does not support unmuxed RTCP.
  var mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
  rtcpParameters.mux = mux.length > 0;

  return rtcpParameters;
};

// parses either a=msid: or a=ssrc:... msid lines and returns
// the id of the MediaStream and MediaStreamTrack.
SDPUtils.parseMsid = function(mediaSection) {
  var parts;
  var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
  if (spec.length === 1) {
    parts = spec[0].substr(7).split(' ');
    return {stream: parts[0], track: parts[1]};
  }
  var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
    return parts.attribute === 'msid';
  });
  if (planB.length > 0) {
    parts = planB[0].value.split(' ');
    return {stream: parts[0], track: parts[1]};
  }
};

// Generate a session ID for SDP.
// https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
// recommends using a cryptographically random +ve 64-bit value
// but right now this should be acceptable and within the right range
SDPUtils.generateSessionId = function() {
  return Math.random().toString().substr(2, 21);
};

// Write boilder plate for start of SDP
// sessId argument is optional - if not supplied it will
// be generated randomly
// sessVersion is optional and defaults to 2
SDPUtils.writeSessionBoilerplate = function(sessId, sessVer) {
  var sessionId;
  var version = sessVer !== undefined ? sessVer : 2;
  if (sessId) {
    sessionId = sessId;
  } else {
    sessionId = SDPUtils.generateSessionId();
  }
  // FIXME: sess-id should be an NTP timestamp.
  return 'v=0\r\n' +
      'o=thisisadapterortc ' + sessionId + ' ' + version + ' IN IP4 127.0.0.1\r\n' +
      's=-\r\n' +
      't=0 0\r\n';
};

SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
      transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
      transceiver.dtlsTransport.getLocalParameters(),
      type === 'offer' ? 'actpass' : 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.direction) {
    sdp += 'a=' + transceiver.direction + '\r\n';
  } else if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
    sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
    sdp += 'a=recvonly\r\n';
  } else {
    sdp += 'a=inactive\r\n';
  }

  if (transceiver.rtpSender) {
    // spec.
    var msid = 'msid:' + stream.id + ' ' +
        transceiver.rtpSender.track.id + '\r\n';
    sdp += 'a=' + msid;

    // for Chrome.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
        ' ' + msid;
    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
          ' ' + msid;
      sdp += 'a=ssrc-group:FID ' +
          transceiver.sendEncodingParameters[0].ssrc + ' ' +
          transceiver.sendEncodingParameters[0].rtx.ssrc +
          '\r\n';
    }
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
      ' cname:' + SDPUtils.localCName + '\r\n';
  if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
        ' cname:' + SDPUtils.localCName + '\r\n';
  }
  return sdp;
};

// Gets the direction from the mediaSection or the sessionpart.
SDPUtils.getDirection = function(mediaSection, sessionpart) {
  // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
  var lines = SDPUtils.splitLines(mediaSection);
  for (var i = 0; i < lines.length; i++) {
    switch (lines[i]) {
      case 'a=sendrecv':
      case 'a=sendonly':
      case 'a=recvonly':
      case 'a=inactive':
        return lines[i].substr(2);
      default:
        // FIXME: What should happen here?
    }
  }
  if (sessionpart) {
    return SDPUtils.getDirection(sessionpart);
  }
  return 'sendrecv';
};

SDPUtils.getKind = function(mediaSection) {
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  return mline[0].substr(2);
};

SDPUtils.isRejected = function(mediaSection) {
  return mediaSection.split(' ', 2)[1] === '0';
};

SDPUtils.parseMLine = function(mediaSection) {
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  return {
    kind: mline[0].substr(2),
    port: parseInt(mline[1], 10),
    protocol: mline[2],
    fmt: mline.slice(3).join(' ')
  };
};

// Expose public methods.
if (true) {
  module.exports = SDPUtils;
}


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Utils = {};

Utils.generateGUID = (typeof window === "undefined" ? "undefined" : _typeof(window)) === "object" && typeof window.crypto !== "undefined" && typeof window.crypto.getRandomValues !== "undefined" ? function () {
  // If we have a cryptographically secure PRNG, use that
  // http://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
  var buf = new Uint16Array(8);
  window.crypto.getRandomValues(buf);
  var S4 = function S4(num) {
    var ret = num.toString(16);
    while (ret.length < 4) {
      ret = "0" + ret;
    }
    return ret;
  };
  return S4(buf[0]) + S4(buf[1]) + "-" + S4(buf[2]) + "-" + S4(buf[3]) + "-" + S4(buf[4]) + "-" + S4(buf[5]) + S4(buf[6]) + S4(buf[7]);
} : function () {
  // Otherwise, just use Math.random
  // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == "x" ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
};

/**
 * Generates an unsigned 32 bits integer out of a string.
 *
 * Needed to map FreeSWITCH room name to Janus as Janus only accepts
 * positive integers as room identifiers
 */
Utils.hashCode = function (s) {
  return s.split("").reduce(function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
};

exports.default = Utils;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CLIENT = exports.browserDetails = exports.isWebRTCSupported = exports.version = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _CLIENT = __webpack_require__(6);

var _CLIENT2 = _interopRequireDefault(_CLIENT);

var _webrtcAdapter = __webpack_require__(2);

var WebRTCAdapter = _interopRequireWildcard(_webrtcAdapter);

var _Logger = __webpack_require__(1);

var _Logger2 = _interopRequireDefault(_Logger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __VERSION__ = "3.0.0"; // webpack defineplugin variable
var version = __VERSION__;

var LOG_PREFIX = "APIdaze-" + __VERSION__;

var isWebRTCSupported = function isWebRTCSupported() {
  return _typeof(WebRTCAdapter.browserDetails) === "object" && _typeof(WebRTCAdapter.browserShim) === "object";
};

var browserDetails = WebRTCAdapter.browserDetails;

exports.version = version;
exports.isWebRTCSupported = isWebRTCSupported;
exports.browserDetails = browserDetails;
exports.CLIENT = _CLIENT2.default;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Call = __webpack_require__(7);

var _Call2 = _interopRequireDefault(_Call);

var _Utils = __webpack_require__(4);

var _Utils2 = _interopRequireDefault(_Utils);

var _Logger = __webpack_require__(1);

var _Logger2 = _interopRequireDefault(_Logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __VERSION__ = "3.0.0"; // webpack defineplugin variable

var STATUS_INIT = 1;
var STATUS_READY = 2;
var LOG_PREFIX = "APIdaze-" + __VERSION__ + " | CLIENT |";
var LOGGER = new _Logger2.default(false, LOG_PREFIX);

var CLIENT = function CLIENT() {
  var configuration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var apiKey = configuration.apiKey,
      wsurl = configuration.wsurl,
      forcewsurl = configuration.forcewsurl,
      _configuration$sessid = configuration.sessid,
      sessid = _configuration$sessid === undefined ? null : _configuration$sessid,
      onReady = configuration.onReady,
      onDisconnected = configuration.onDisconnected,
      onError = configuration.onError,
      onExternalMessageReceived = configuration.onExternalMessageReceived,
      debug = configuration.debug,
      _configuration$userKe = configuration.userKeys,
      userKeys = _configuration$userKe === undefined ? {} : _configuration$userKe;

  /**
   * Functions exposed to user
   */

  this.speedTest = speedTest.bind(this);
  this.ping = ping.bind(this);
  this.shutdown = shutdown.bind(this);
  this.freeAll = shutdown.bind(this); // freeAll is kept for compatibility reasons
  this.disconnect = shutdown.bind(this); // disconnect is kept for compatibility reasons
  this.sendText = sendText.bind(this);
  this.getWebsocketServer = getWebsocketServer.bind(this);

  // User defined handlers
  this._onDisconnected = function () {
    typeof onDisconnected === "function" && onDisconnected();
    LOGGER.log("Disconnected");
  };
  this._onReady = function (sessionObj) {
    this._status += STATUS_READY;
    LOGGER.log("Ready");
    typeof onReady === "function" && onReady(sessionObj);
  };
  this._onError = function (errorObj) {
    /**
     * We may receive errors from FreeSWITCH over the WebSocket channel, in
     * this case, any exception thrown would be un-catchable. Such errors
     * are marcked with a type === "async". For more details, see :
     * https://stackoverflow.com/questions/16316815/catch-statement-does-not-catch-thrown-error
     */
    typeof onError === "function" ? onError(errorObj.message) : LOGGER.log("Error : " + errorObj.message);

    if (errorObj.type !== "async") {
      throw { ok: false, message: errorObj.message, origin: errorObj.origin };
    }
  };
  this._onExternalMessageReceived = function (messageObject) {
    // messageObject : {from, to, body}
    typeof onExternalMessageReceived === "function" && onExternalMessageReceived(messageObject);
  };

  if (debug) {
    this.debug = true;
    LOGGER._debug = true;
  } else {
    this.debug = false;
  }

  if (!apiKey) {
    this._onError({ origin: "CLIENT", message: "Please provide an apiKey" });
  }

  if (!"WebSocket" in window) {
    this._onError({ origin: "CLIENT", message: "WebSocket not supported" });
  }

  if (/wss:\/\//.test(forcewsurl)) {
    wsurl = forcewsurl;
  }

  // WebSocket URLs must start with wss:// or ws://localhost (the latter
  // for testing purpose)
  if (!/wss:\/\//.test(wsurl) && !/ws:\/\/localhost/.test(wsurl)) {
    this._onError({
      origin: "CLIENT",
      message: "Wrong WebSocket URL, must start with wss://"
    });
  }

  this._callArray = [];
  this._apiKey = apiKey.toString();
  this._status = STATUS_INIT;
  this._sessid = sessid;
  this._userKeys = userKeys;
  this._wsUrl = wsurl;

  this._websocket = new WebSocket(wsurl);
  this._websocket.onopen = handleWebSocketOpen.bind(this);
  this._websocket.onerror = handleWebSocketError.bind(this);
  this._websocket.onmessage = handleWebSocketMessage.bind(this);
  this._websocket.onclose = handleWebSocketClose.bind(this);
};

CLIENT.prototype.version = __VERSION__;

CLIENT.prototype._sendMessage = function (json) {
  if (this._websocket.readyState !== WebSocket.OPEN) {
    this._onError({
      origin: "CLIENT",
      message: "Client is not ready (WebSocket not open)"
    });
    return;
  }

  if ((this._status & STATUS_READY) === 0 && JSON.parse(json).method !== "ping") {
    this._onError({
      origin: "CLIENT",
      message: "Client is not ready (hello not received from server)"
    });
    return;
  }

  LOGGER.log("handleWebSocketMessage | C->S : " + json);
  this._websocket.send(json);
};

CLIENT.prototype.call = function (params) {
  var listeners = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  try {
    var callObj = new _Call2.default(this, null, params, listeners);
    this._callArray.push(callObj);
    return callObj;
  } catch (error) {
    error.origin = "call";
    error.type = "async";
    this._onError(error);
  }
};

CLIENT.prototype.reattach = function (callID) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var listeners = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  try {
    var callObj = new _Call2.default(this, callID, params, listeners);
    this._callArray.push(callObj);
    return callObj;
  } catch (error) {
    error.origin = "reattach";
    error.type = "async";
    this._onError(error);
  }
};
/**
 * Log connection event and update status
 */
var handleWebSocketOpen = function handleWebSocketOpen() {
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
};

/**
 * Call CLIENT.onError() and throw error
 */
var handleWebSocketError = function handleWebSocketError() {
  LOGGER.log("handleWebSocketError | Error ");
  this._onError({
    type: "async",
    origin: "CLIENT",
    message: "WebSocket error"
  });
};

/**
 * Handle messages from mod_verto
 */
var handleWebSocketMessage = function handleWebSocketMessage(event) {
  LOGGER.log("handleWebSocketMessage | S->C : " + event.data);

  // Special sub proto
  if (event.data[0] == "#" && event.data[1] == "S" && event.data[2] == "P") {
    if (event.data[3] == "U") {
      this.up_dur = parseInt(event.data.substring(4));
    } else if (event.data[3] == "D") {
      this.down_dur = parseInt(event.data.substring(4));

      var up_kps = (this._speedBytes * 8 / (this.up_dur / 1000) / 1000).toFixed(0);
      var down_kps = (this._speedBytes * 8 / (this.down_dur / 1000) / 1000).toFixed(0);

      console.info("Speed Test: Up: " + up_kps + "kbit/s Down: " + down_kps + "kbits/s");

      if (typeof this._speedCB === "function") {
        this._speedCB({
          upDur: this.up_dur,
          downDur: this.down_dur,
          upKPS: up_kps,
          downKPS: down_kps
        });
        this._speedCB = null;
      }
    }

    return;
  }

  var json = JSON.parse(event.data);

  if (json.error) {
    if (json.error.code === -32602) {
      LOGGER.log("Not allowed to login");
      this._onError({
        type: "async",
        origin: "CLIENT",
        message: "Not allowed to login"
      });
      return;
    }

    if (json.error.code === -32002) {
      LOGGER.log("Session error");
      this._onError({
        type: "async",
        origin: "CLIENT",
        message: json.error.message
      });
      return;
    }
  }

  // Handle echo reply to our echo request
  if (json.result && json.result.type === "echo_request") {
    handleEchoReply.call(this, json);
    return;
  }

  // Handle replies from our sendText function
  if (json.result && json.result.type === "sendtext_request") {
    handleSendTextReply.call(this, json);
    return;
  }

  // Handle response to our initial 'subscribe_message' request
  if (/^subscribe_message/.test(json.id)) {
    var _callID = json.id.split("|")[1];
    handleSubscribeFromVerto.call(this, json, _callID);
    return;
  }

  // Handle response to our initial 'conference blabla list' request
  if (/^conference_list_command/.test(json.id)) {
    var _callID2 = json.id.split("|")[1];
    handleConferenceListResponse.call(this, json, _callID2);
    return;
  }

  if (json.result) {
    // Process reponse after request from gateway
    if (json.result.message) {
      var _callID3 = null; // generated by APIdaze
      var sessid = null; // gotten back from FreeSWITCH, identifies the WebSocket
      var _index = -1;
      switch (json.result.message) {
        case "pong":
          //        this._status *= STATUS_RECVD_PONG;
          return;

        case "CALL CREATED":
          LOGGER.log("Got CALL CREATED event");
          _callID3 = json.result.callID;
          sessid = json.result.sessid;
          _index = this._callArray.findIndex(function (callObj) {
            return callObj.callID === _callID3;
          });
          if (_index < 0) {
            LOGGER.log("Cannot find call with callID " + _callID3);
          } else {
            LOGGER.log("Call created with callID " + _callID3 + " and sessid " + sessid);
            this._callArray[_index].sessid = sessid;
            this._sessid = sessid;
          }
          return;

        case "CALL ENDED":
          LOGGER.log("Got CALL ENDED event");
          _callID3 = json.result.callID;
          _index = this._callArray.findIndex(function (callObj) {
            return callObj.callID === _callID3;
          });
          if (_index < 0) {
            LOGGER.log("Cannot find call with callID " + _callID3);
          } else {
            LOGGER.log("Call ended with callID " + _callID3);
          }
          this._callArray[_index]._onHangup();
          this._callArray[_index] = null;
          this._callArray.splice(_index, 1);
          return;

        default:
          break;
      }
    }

    if (json.result.action) {
      switch (json.result.action) {
        case "sendDTMF":
          LOGGER.log("DTMF sent");
          return;
        default:
          return;
      }
    }
  }

  if (json.method === "event") {
    handleVertoEvent.call(this, json);
    return;
  }

  if (json.method === "verto.clientReady") {
    this._onReady({ id: json.params.id, sessid: json.params.sessid });
    return;
  }

  if (json.method === "verto.info") {
    // Handle unsollicited text messages, received even when we're not in a call
    LOGGER.log("Received message from server", JSON.stringify(json.params.msg));
    this._onExternalMessageReceived(json.params.msg);
    return;
  }

  var callID = json.params.callID;
  var index = this._callArray.findIndex(function (callObj) {
    return callObj.callID === callID;
  });

  if (index < 0) {
    LOGGER.log("Cannot find call with callID " + callID);
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
  switch (json.method) {
    case "ringing":
      LOGGER.log("Ringing on call with callID " + this._callArray[index].callID);
      // FS may send SDP along with ringing event
      if (json.params.sdp) {
        this._callArray[index].setRemoteDescription(json.params.sdp);
      }
      this._callArray[index]._onRinging();
      break;

    case "media":
      // In this case, we consider the call is ringing
      LOGGER.log("Found call index : " + index);
      if (json.params.sdp) {
        this._callArray[index].setRemoteDescription(json.params.sdp);
      }
      this._callArray[index]._onRinging();
      break;

    case "answer":
      LOGGER.log("Found call index : " + index);
      if (json.params.sdp) {
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
      LOGGER.log( true ? "OK" : "Not OK");
      this._reattachParams = json.params;
      break;

    default:
      LOGGER.log("No action for this message");
  }
};

/**
 * Handle events from mod_verto here
 *
 * The main purpose is to handle conference events, but one may expect to
 * get other events here.
 */
var handleVertoEvent = function handleVertoEvent(event) {
  var params = event.params;

  LOGGER.log("Received event of type " + params.eventType);
  LOGGER.log("Event channel UUID : " + params.eventChannelUUID);
  LOGGER.log("Event channel : " + params.eventChannel);
  var index = this._callArray.findIndex(function (callObj) {
    return callObj.callID === params.eventChannelUUID;
  });

  if (index >= 0) {
    // This is an event generated by one of our sessions (not a conference)
    LOGGER.log("Need to handle simple event");
    if (params.pvtData.action === "conference-liveArray-join") {
      /**
       * We receive this message the first time we join the conference.
       * Two actions performed :
       * - Send a subscribe message to FreeSWITCH in order to get all the
       *   conference events from this conference
       * - Retrieve list of current participants in the room
       */
      var request = {};
      request.wsp_version = "1";
      request.method = "verto.subscribe";
      request.id = "subscribe_message|" + this._callArray[index].callID;
      request.params = {
        eventChannel: [event.params.pvtData.laChannel, event.params.pvtData.chatChannel, event.params.pvtData.infoChannel],
        subParams: {}
      };
      this._sendMessage(JSON.stringify(request));

      request.wsp_version = "1";
      request.method = "jsapi";
      request.id = "conference_list_command|" + this._callArray[index].callID;
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

  if (index < 0) {
    /**
     * Could not find call that matches with eventChannelUUID, try to find
     * a match using eventChannel. This occurs in the following cases :
     * - a liveArray event indicating who's talking, entering, leaving the room
     *   has been received
     * - a group chat message is the room has been received
     */
    index = this._callArray.findIndex(function (callObj) {
      return callObj.subscribedChannelsArray.indexOf(params.eventChannel) >= 0;
    });
  }

  if (index >= 0) {
    if (/^conference-liveArray/.test(event.params.eventChannel)) {
      console.log("event.params.data : ", JSON.stringify(event.params.data));

      var data = event.params.data.data;
      Array.isArray(data) && data.push(event.params.data.hashKey);

      switch (event.params.data.action) {
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
    } else if (/^conference-chat/.test(event.params.eventChannel)) {
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
};

/**
 * Handle response from FreeSWITCH to our initial verto.subscribe request
 */
var handleSubscribeFromVerto = function handleSubscribeFromVerto(event, callID) {
  var index = this._callArray.findIndex(function (callObj) {
    return callObj.callID === callID;
  });

  if (index < 0) {
    LOGGER.log("Cannot find a call object that matches with sessid " + event.sessid);
    throw { ok: false, message: "Failed to process reply to subscribe" };
  }

  /**
   * I hope FreeSWITCH dumps the channels in the same order :
   * - laChannel : LiveArray, all events from the conference
   * - chatChannel : chat messages
   * - infoChannel : info ?
   */
  this._callArray[index].subscribedChannels = {};
  var channelsArray = [];

  if (event.result.subscribedChannels.length === 3) {
    LOGGER.log("Found valid subscribedChannels[] array");
    channelsArray = event.result.subscribedChannels;
  } else if (event.result.alreadySubscribedChannels.length === 3) {
    LOGGER.log("Found valid alreadySubscribedChannels[] array");
    channelsArray = event.result.alreadySubscribedChannels;
  }

  this._callArray[index].subscribedChannels.laChannel = channelsArray[0];
  this._callArray[index].subscribedChannels.chatChannel = channelsArray[1];
  this._callArray[index].subscribedChannels.infoChannel = channelsArray[2];
  this._callArray[index].subscribedChannelsArray = channelsArray;
};

/**
 * Handle response from FreeSWITCH to our 'conference_list_command'
 *
 * We just get the list of the participants in the conference room we're joining.
 */
var handleConferenceListResponse = function handleConferenceListResponse(event, callID) {
  var index = this._callArray.findIndex(function (callObj) {
    return callObj.callID === callID;
  });

  if (index < 0) {
    LOGGER.log("Cannot find a call object that matches with sessid " + event.sessid);
    throw {
      ok: false,
      message: "Failed to process reply to conference_list_command"
    };
  }

  LOGGER.log("Got members " + JSON.stringify(event));
  var members = [];
  var lines = event.result.message.split("\n");
  for (var idx = 0; idx < lines.length - 1; idx++) {
    var elems = lines[idx].split(";");
    members.push({
      sessid: elems[2],
      nickname: elems[3],
      caller_id_number: elems[4],
      conferenceMemberID: elems[0],
      talking_flags: elems[5]
    });
  }

  this._callArray[index]._onRoomMembersInitialList(members);
};

/**
 * Log connection event, update status, call CLIENT.onDisconnected()
 */
var handleWebSocketClose = function handleWebSocketClose(err) {
  LOGGER.log("handleWebSocketClose | WebSocket closed");
  this._status = STATUS_INIT;
  this._onDisconnected();
};

var handleEchoReply = function handleEchoReply(event) {
  var now = Date.now();
  var rtt = now - parseInt(event.result.time);
  LOGGER.log("handleEchoReply RTT : " + rtt + "ms");

  if (typeof this._pingCallback === "function") {
    this._pingCallback(rtt);
    this._pingCallback = null;
  }
};

var handleSendTextReply = function handleSendTextReply(event) {
  LOGGER.log("handleSendTextReply", JSON.stringify(event));

  if (typeof this._sendTextCallback === "function") {
    this._sendTextCallback({
      httpCode: event.result.httpCode || null,
      ok: event.result.ok,
      message: event.result.message,
      data: event.result.data || null
    });
    this._sendTextCallback = null;
  }
};

var shutdown = function shutdown() {
  if (this._websocket === null) {
    return;
  }

  this._websocket.close();
  this._websocket = null;
};

var sendText = function sendText(_ref, userCallback) {
  var text = _ref.text,
      _ref$userKeys = _ref.userKeys,
      userKeys = _ref$userKeys === undefined ? {} : _ref$userKeys;

  var text = text;
  var userKeys = (typeof userKeys === "undefined" ? "undefined" : _typeof(userKeys)) !== "object" ? {} : userKeys;

  this._sendTextCallback = userCallback;

  var request = {};

  request.wsp_version = "1";
  request.method = "verto.info";
  request.params = {
    type: "sendtext_request",
    text: text,
    userKeys: userKeys
  };

  this._sendMessage(JSON.stringify(request));
};

var getWebsocketServer = function getWebsocketServer() {
  try {
    var matches = this._wsUrl.match(/^wss?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i);
    var host = matches && matches[1];

    return host;
  } catch (error) {
    return false;
  }
};

var speedTest = function speedTest(userCallback) {
  var bytes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1024 * 256;

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
};

var ping = function ping(userCallback) {
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
};

exports.default = CLIENT;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _webrtcAdapter = __webpack_require__(2);

var WebRTCAdapter = _interopRequireWildcard(_webrtcAdapter);

var _Utils = __webpack_require__(4);

var _Utils2 = _interopRequireDefault(_Utils);

var _Janus = __webpack_require__(19);

var _Janus2 = _interopRequireDefault(_Janus);

var _Logger = __webpack_require__(1);

var _Logger2 = _interopRequireDefault(_Logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var __VERSION__ = "3.0.0"; // webpack defineplugin variable

var LOG_PREFIX = "APIdaze-" + __VERSION__ + " | CLIENT | Call |";
var LOGGER = new _Logger2.default(false, LOG_PREFIX);

var APIDAZE_SCREENSHARE_CHROME_EXTENSION_ID = "ecomagggebppeikobjchgmnoldifjnjj";

/**
 * The callID parameter is expected to be null, except when clientObj is
 * re-attaching to an existing call in FreeSWITCH
 */
var Call = function Call(clientObj, callID, params, listeners) {
  var randomString = function () {
    for (var c = ""; c.length < 12;) {
      c += Math.random().toString(36).substr(2, 1);
    }return c;
  }();

  var _params$tagId = params.tagId,
      tagId = _params$tagId === undefined ? "apidaze-audio-video-container-id-" + randomString : _params$tagId,
      _params$audioParams = params.audioParams,
      audioParams = _params$audioParams === undefined ? {} : _params$audioParams,
      userKeys = params.userKeys;
  var onRinging = listeners.onRinging,
      onAnswer = listeners.onAnswer,
      onHangup = listeners.onHangup,
      onRoomChatMessage = listeners.onRoomChatMessage,
      onRoomMembersInitialList = listeners.onRoomMembersInitialList,
      onRoomTalking = listeners.onRoomTalking,
      onRoomAdd = listeners.onRoomAdd,
      onRoomDel = listeners.onRoomDel;


  if (clientObj.debug) {
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
  this.remoteAudioVideo.style.display = "none";

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

  if (this.clientObj._websocket.readyState !== this.clientObj._websocket.OPEN) {
    throw { message: "WebSocket is closed" };
  }

  var GUMConstraints = {
    audio: true
  };

  LOGGER.log("GUM constraints : " + JSON.stringify(GUMConstraints));

  var self = this;

  navigator.mediaDevices.enumerateDevices().then(function (devices) {
    LOGGER.log("Found devices : ", devices);
    return navigator.mediaDevices.getUserMedia(GUMConstraints);
  }).then(function (stream) {
    LOGGER.log("WebRTC Ok");
    self.localAudioVideoStream = stream;
  }).then(function () {
    createPeerConnection.call(self);
  }).then(function () {
    attachStreamToPeerConnection.call(self);

    var offerOptions = {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    };

    return self.peerConnection.createOffer(offerOptions);
  }).then(function (offer) {
    LOGGER.log("Local SDP : " + offer.sdp);
    LOGGER.log("Setting description to local peerConnection");
    return self.peerConnection.setLocalDescription(offer);
  }).then(function () {
    /**
     * Regular WebRTC examples show that the right spot to send the SDP
     * to the server is here. We cannot do that because our WebRTC remote
     * peer (FreeSWITCH) does not handle Trickle ICE and needs to get
     * all the candidates in the first offer
     */
    LOGGER.log("WebRTC set up, ready to start call");
  }).catch(function (error) {
    LOGGER.log("Error :", error);
    handleGUMError.call(self, error);
  });
};

function stopLocalAudio() {
  this.localAudioVideoStream.getAudioTracks().forEach(function (track) {
    track.enabled = false;
  });
}

function startLocalAudio() {
  this.localAudioVideoStream.getAudioTracks().forEach(function (track) {
    track.enabled = true;
  });
}

function _publishOwnVideoFeed(useAudio) {
  // Publish our stream
  var self = this;

  this.janusVideoPlugin.createOffer({
    // Add data:true here if you want to publish datachannels as well
    media: {
      audioRecv: false,
      videoRecv: false,
      audioSend: useAudio,
      videoSend: true
    }, // Publishers are sendonly
    // If you want to test simulcasting (Chrome and Firefox only), then
    // pass a ?simulcast=true when opening this demo page: it will turn
    // the following 'simulcast' property to pass to janus.js to true
    simulcast: false,
    success: function success(jsep) {
      _Janus2.default.debug("Got publisher SDP!");
      _Janus2.default.debug(jsep);
      var publish = { request: "configure", audio: useAudio, video: true };
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
      self.janusVideoPlugin.send({ message: publish, jsep: jsep });
    },
    error: function error(_error) {
      _Janus2.default.error("WebRTC error:", _error);
    }
  });
}

function _attachJanusVideoPlugin(callbackSuccess, callbackError) {
  var self = this;

  // FIXME: need to figure out how to set opaqueId
  var opaqueId = "videoroomtest-123465464574746";
  this.janusInstance.attach({
    plugin: "janus.plugin.videoroom",
    opaqueId: opaqueId,
    success: function success(pluginHandle) {
      self.janusVideoPlugin = pluginHandle;
      _Janus2.default.log("Plugin attached! (" + self.janusVideoPlugin.getPlugin() + ", id=" + self.janusVideoPlugin.getId() + ")");
      _Janus2.default.log("  -- This is a publisher/manager");
      var create = { request: "exists", room: self.janusVideoRoomID };
      self.janusVideoPlugin.send({
        message: {
          request: "exists",
          room: self.janusVideoRoomID
        },
        success: function success(result) {
          if (result.exists == true) {
            self.janusVideoPlugin.send({
              message: {
                request: "join",
                room: self.janusVideoRoomID,
                ptype: "publisher"
                // FIXME : allow dev to add username here
                //"display": 'phil'
              },
              success: function success(result) {
                LOGGER.log("JOINED ROOM FOR VIDEO");
                typeof callbackSuccess === "function" && callbackSuccess();
              }
            });
          } else {
            self.janusVideoPlugin.send({
              message: {
                request: "create",
                room: self.janusVideoRoomID,
                ptype: "publisher"
                // FIXME : allow dev to add username here
                // "display": 'phil'
              },
              success: function success(result) {
                LOGGER.log("ROOM CREATED FOR VIDEO");
                self.janusVideoPlugin.send({
                  message: {
                    request: "join",
                    room: self.janusVideoRoomID,
                    ptype: "publisher",
                    display: "phil"
                  },
                  success: function success(result) {
                    LOGGER.log("JOINED ROOM FOR VIDEO");
                    typeof callbackSuccess === "function" && callbackSuccess();
                  }
                });
              }
            });
          }
        }
      });
    },
    error: function error(_error2) {
      _Janus2.default.error("  -- Error attaching plugin...", _error2);
    },
    consentDialog: function consentDialog(on) {
      _Janus2.default.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
      if (on) {
        console.log("Ask consent");
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
        console.log("Ask consent");
        // Restore screen
        // $.unblockUI();
      }
    },
    mediaState: function mediaState(medium, on) {
      _Janus2.default.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
    },
    webrtcState: function webrtcState(on) {
      _Janus2.default.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
    },
    onmessage: function onmessage(msg, jsep) {
      _Janus2.default.debug(" ::: Got a message (publisher) :::");
      _Janus2.default.debug(msg);
      var event = msg["videoroom"];
      _Janus2.default.debug("Event: " + event);
      if (event != undefined && event != null) {
        if (event === "joined") {
          // Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
          _Janus2.default.log("Successfully joined room " + msg["room"] + " with ID " + msg["id"]);
          //            _publishOwnVideoFeed.call(self, false);
          // Any new feed to attach to?
          if (msg["publishers"] !== undefined && msg["publishers"] !== null) {
            var list = msg["publishers"];
            _Janus2.default.debug("Got a list of available publishers/feeds:");
            _Janus2.default.debug(list);
            for (var f in list) {
              var id = list[f]["id"];
              var display = list[f]["display"];
              var audio = list[f]["audio_codec"];
              var video = list[f]["video_codec"];
              _Janus2.default.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
              _newRemoteFeed.call(self, id, display, audio, video);
            }
          }
        } else if (event === "destroyed") {
          // The room has been destroyed
          _Janus2.default.warn("The room has been destroyed!");
        } else if (event === "event") {
          // Any new feed to attach to?
          if (msg["publishers"] !== undefined && msg["publishers"] !== null) {
            var list = msg["publishers"];
            _Janus2.default.debug("Got a list of available publishers/feeds:");
            _Janus2.default.debug(list);
            for (var f in list) {
              var id = list[f]["id"];
              var display = list[f]["display"];
              var audio = list[f]["audio_codec"];
              var video = list[f]["video_codec"];
              _Janus2.default.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
              _newRemoteFeed.call(self, id, display, audio, video);
            }
          } else if (msg["leaving"] !== undefined && msg["leaving"] !== null) {
            // One of the publishers has gone away?
            var leaving = msg["leaving"];
            _Janus2.default.log("Publisher left: " + leaving);
            var remoteFeed = null;
            for (var i = 1; i < 6; i++) {
              if (self.janusFeeds[i] != null && self.janusFeeds[i] != undefined && self.janusFeeds[i].rfid == leaving) {
                remoteFeed = self.janusFeeds[i];
                break;
              }
            }
            if (remoteFeed != null) {
              _Janus2.default.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
              self.janusFeeds[remoteFeed.rfindex] = null;
              remoteFeed.detach();
            }
          } else if (msg["unpublished"] !== undefined && msg["unpublished"] !== null) {
            // One of the publishers has unpublished?
            var unpublished = msg["unpublished"];
            _Janus2.default.log("Publisher left: " + unpublished);
            if (unpublished === "ok") {
              // That's us
              self.janusVideoPlugin.hangup();
              return;
            }
            var remoteFeed = null;
            for (var i = 1; i < 6; i++) {
              if (self.janusFeeds[i] != null && self.janusFeeds[i] != undefined && self.janusFeeds[i].rfid == unpublished) {
                remoteFeed = self.janusFeeds[i];
                break;
              }
            }
            if (remoteFeed != null) {
              _Janus2.default.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
              var target = document.querySelector("#" + self.janusVideoOptions.remoteVideosContainerId + " div[remoteid='" + remoteFeed.rfindex + "']");
              target.innerHTML = "";
              //                $('#remote'+remoteFeed.rfindex).empty().hide();
              //                $('#videoremote'+remoteFeed.rfindex).empty();
              self.janusFeeds[remoteFeed.rfindex] = null;
              remoteFeed.detach();
            }
          } else if (msg["error"] !== undefined && msg["error"] !== null) {
            if (msg["error_code"] === 426) {
              // This is a "no such room" error: give a more meaningful description
              _Janus2.default.debug("No such room...");
            }
          }
        }
      }

      if (jsep !== undefined && jsep !== null) {
        _Janus2.default.debug("Handling SDP as well...");
        _Janus2.default.debug(jsep);
        self.janusVideoPlugin.handleRemoteJsep({ jsep: jsep });
        // Check if any of the media we wanted to publish has
        // been rejected (e.g., wrong or unsupported codec)
        var audio = msg["audio_codec"];
        if (self.janusVideoStream && self.janusVideoStream.getAudioTracks() && self.janusVideoStream.getAudioTracks().length > 0 && !audio) {
          // Audio has been rejected
          _Janus2.default.log("Our audio stream has been rejected, viewers won't hear us");
        }
        var video = msg["video_codec"];
        if (self.janusVideoStream && self.janusVideoStream.getVideoTracks() && self.janusVideoStream.getVideoTracks().length > 0 && !video) {
          // Video has been rejected
          _Janus2.default.log("Our video stream has been rejected, viewers won't see us");
        }
      }
    },
    onlocalstream: function onlocalstream(stream) {
      _Janus2.default.debug(" ::: Got a local stream :::");
      self.janusVideoStream = stream;
      _Janus2.default.debug(stream);

      var localVideoElement = document.querySelector("#" + self.janusVideoOptions.localVideoContainerId + " video");
      var remoteVideosContainerElement = document.querySelector("#" + self.janusVideoOptions.remoteVideosContainerId);

      if (localVideoElement === null || typeof localVideoElement === "undefined") {
        localVideoElement = document.createElement("video");

        localVideoElement.style.height = "100%";
        localVideoElement.style.width = "100%";
        localVideoElement.autoplay = true;
        document.getElementById(self.janusVideoOptions.localVideoContainerId).appendChild(localVideoElement);
      } else {
        localVideoElement.autoplay = true;
      }

      _Janus2.default.attachMediaStream(localVideoElement, stream);
      if (self.janusVideoPlugin.webrtcStuff.pc.iceConnectionState !== "completed" && self.janusVideoPlugin.webrtcStuff.pc.iceConnectionState !== "connected") {
        console.log("Publishing video...");
      }
      var videoTracks = stream.getVideoTracks();
      if (videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
        // No webcam
        console.log("No webcam");
      } else {
        console.log("Need webcam");
      }
    },
    onremotestream: function onremotestream(stream) {
      // The publisher stream is sendonly, we don't expect anything here
    },
    oncleanup: function oncleanup() {
      _Janus2.default.log(" ::: Got a cleanup notification: we are unpublished now :::");
      self.janusVideoStream = null;
    }
  });
}

function _newRemoteFeed(id, display, audio, video) {
  var self = this;
  // A new feed has been published, create a new plugin handle and attach to it as a subscriber
  var remoteFeed = null;
  this.janusInstance.attach({
    plugin: "janus.plugin.videoroom",
    opaqueId: "videoroomtest-123465464574746", // FIXME: need to figure out how to set opaqueId
    success: function success(pluginHandle) {
      remoteFeed = pluginHandle;
      remoteFeed.simulcastStarted = false;
      _Janus2.default.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id=" + remoteFeed.getId() + ")");
      _Janus2.default.log("  -- This is a subscriber");
      // We wait for the plugin to send us an offer
      //	var listen = { "request": "join", "room": myroom, "ptype": "subscriber", "feed": id, "private_id": mypvtid };
      var listen = {
        request: "join",
        room: self.janusVideoRoomID,
        ptype: "subscriber",
        feed: id
      };
      // In case you don't want to receive audio, video or data, even if the
      // publisher is sending them, set the 'offer_audio', 'offer_video' or
      // 'offer_data' properties to false (they're true by default), e.g.:
      // 		listen["offer_video"] = false;
      // For example, if the publisher is VP8 and this is Safari, let's avoid video
      if (video !== "h264" && _Janus2.default.webRTCAdapter.browserDetails.browser === "safari") {
        if (video) video = video.toUpperCase();
        console.log("Publisher is using " + video + ", but Safari doesn't support it: disabling video");
        listen["offer_video"] = false;
      }
      remoteFeed.send({ message: listen });
    },
    error: function error(_error3) {
      _Janus2.default.error("  -- Error attaching plugin...", _error3);
      bootbox.alert("Error attaching plugin... " + _error3);
    },
    onmessage: function onmessage(msg, jsep) {
      _Janus2.default.debug(" ::: Got a message (subscriber) :::");
      _Janus2.default.debug(msg);
      var event = msg["videoroom"];
      _Janus2.default.debug("Event: " + event);
      if (msg["error"] !== undefined && msg["error"] !== null) {
        bootbox.alert(msg["error"]);
      } else if (event != undefined && event != null) {
        if (event === "attached") {
          // Subscriber created and attached
          for (var i = 1; i < 6; i++) {
            if (self.janusFeeds[i] === undefined || self.janusFeeds[i] === null) {
              self.janusFeeds[i] = remoteFeed;
              remoteFeed.rfindex = i;
              break;
            }
          }
          remoteFeed.rfid = msg["id"];
          remoteFeed.rfdisplay = msg["display"];

          var target = document.querySelector("#" + self.janusVideoOptions.remoteVideosContainerId + " div[remoteid='" + remoteFeed.rfindex + "]'");
          if (target === null || typeof target === "undefined") {
            var remoteVideoElement = document.createElement("div");
            remoteVideoElement.setAttribute("remoteid", remoteFeed.rfindex);

            document.querySelector("#" + self.janusVideoOptions.remoteVideosContainerId).appendChild(remoteVideoElement);
          }

          _Janus2.default.log("Successfully attached to feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") in room " + msg["room"]);
          //$('#remote'+remoteFeed.rfindex).removeClass('hide').html(remoteFeed.rfdisplay).show();
        } else if (event === "event") {
          // Check if we got an event on a simulcast-related event from this publisher
          var substream = msg["substream"];
          var temporal = msg["temporal"];
          if (substream !== null && substream !== undefined || temporal !== null && temporal !== undefined) {
            if (!remoteFeed.simulcastStarted) {
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
      if (jsep !== undefined && jsep !== null) {
        _Janus2.default.debug("Handling SDP as well...");
        _Janus2.default.debug(jsep);
        // Answer and attach
        remoteFeed.createAnswer({
          jsep: jsep,
          // Add data:true here if you want to subscribe to datachannels as well
          // (obviously only works if the publisher offered them in the first place)
          media: { audioSend: false, videoSend: false }, // We want recvonly audio/video
          success: function success(jsep) {
            _Janus2.default.debug("Got SDP!");
            _Janus2.default.debug(jsep);
            var body = { request: "start", room: self.janusVideoRoomID };
            remoteFeed.send({ message: body, jsep: jsep });
          },
          error: function error(_error4) {
            _Janus2.default.error("WebRTC error:", _error4);
            bootbox.alert("WebRTC error... " + JSON.stringify(_error4));
          }
        });
      }
    },
    webrtcState: function webrtcState(on) {
      _Janus2.default.log("Janus says this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") is " + (on ? "up" : "down") + " now");
    },
    onlocalstream: function onlocalstream(stream) {
      // The subscriber stream is recvonly, we don't expect anything here
    },
    onremotestream: function onremotestream(stream) {
      _Janus2.default.debug("Remote feed #" + remoteFeed.rfindex);
      var addButtons = false;
      var target = document.querySelector("#" + self.janusVideoOptions.remoteVideosContainerId + " div[remoteid='" + remoteFeed.rfindex + "']");
      //if($('#remotevideo'+remoteFeed.rfindex).length === 0) {
      if (target.length === 0 || typeof target.length === "undefined") {
        addButtons = true;
        // No remote video yet
        var innerHTML = '<video id="remotevideo' + remoteFeed.rfindex + '" width="100%" height="100%" autoplay/>';

        target.innerHTML = innerHTML;
      }
      _Janus2.default.attachMediaStream(target.querySelector("video"), stream);
      var videoTracks = stream.getVideoTracks();
      if (videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
        // No remote video
        var _innerHTML = '<div class="no-video-container">' + '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' + '<span class="no-video-text">No remote video available</span>' + "</div>";

        target.innerHTML = _innerHTML;
      }
    },
    oncleanup: function oncleanup() {
      _Janus2.default.log(" ::: Got a cleanup notification (remote feed " + id + ") :::");
      var target = document.querySelector("#" + self.janusVideoOptions.remoteVideosContainerId + " div[remoteid='" + remoteFeed.rfindex + "']");
      target.parentNode.removeChild(target);
    }
  });
}

function muteVideo() {
  return this.janusInitOk && this.janusVideoPlugin.muteVideo();
}

function unmuteVideo() {
  return this.janusInitOk && this.janusVideoPlugin.unmuteVideo();
}

/**
 * Calls detach on our Janus video plugin, then destroy on our Janus instance
 */
function detachVideo() {
  var self = this;

  this.janusVideoPlugin && this.janusVideoPlugin.detach({
    success: function success() {
      self.janusInstance.destroy();
    },
    error: function error() {
      LOGGER.log("Failed to properly detach our Video plugin from Janus, hoping for the best...");
      self.janusInstance.destroy();
    }
  });
}

function publishMyVideoInRoom() {
  if (this.janusInitOk !== true) {
    LOGGER.log("Please call initVideoInConferenceRoom() first");
    return;
  }
  this.janusInitOk && _publishOwnVideoFeed.call(this, false);
}

function initVideoInConferenceRoom() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var callbackSuccess = arguments[1];
  var callbackError = arguments[2];

  var self = this;

  if (typeof options === "function") {
    LOGGER.log("Please provide a valid option object");
    return;
  }

  if (this.callType !== "conference") {
    LOGGER.log("Not in a conference room, won't start video");
    return;
  }

  if (this.janusInitOk === true) {
    LOGGER.log("Video is already initialized in this room");
    return;
  }

  this.janusVideoOptions = Object.assign({
    localVideoContainerId: "apidaze-local-video-container-id",
    remoteVideosContainerId: "apidaze-remote-videos-container-id"
  }, options);

  // Check whether DOM containers exist, create otherwise and append to <body/>
  if (document.getElementById(this.janusVideoOptions.localVideoContainerId) == null) {
    var localVideoContainer = document.createElement("div");
    localVideoContainer.id = self.janusVideoOptions.localVideoContainerId;
    document.body.appendChild(localVideoContainer);
  }

  if (document.getElementById(this.janusVideoOptions.remoteVideosContainerId) == null) {
    var remoteVideosContainer = document.createElement("div");
    remoteVideosContainer.id = this.janusVideoOptions.remoteVideosContainerId;
    document.body.appendChild(remoteVideosContainer);
  }

  LOGGER.log("Starting video in room " + this.conferenceName);
  _Janus2.default.init({
    debug: "all",
    dependencies: _Janus2.default.useDefaultDependencies({ adapter: WebRTCAdapter }),
    callback: function callback() {
      self.janusInitOk = true;
      self.janusInstance = new _Janus2.default({
        server: "wss://" + self.clientObj.getWebsocketServer() + ":8989",
        success: function success() {
          LOGGER.log("Janus Instance created");
          self.janusVideoRoomID = _Utils2.default.hashCode(self.conferenceName);
          _attachJanusVideoPlugin.call(self, callbackSuccess, callbackError);
        },
        error: function error(_error5) {
          _Janus2.default.error(_error5);
          self.janusInitOk = false;
          self.janusInstance = null;
          self.janusVideoPlugin = null;
          self.janusVideoStream = null;
          self.janusFeeds = [];
          self.janusVideoRoomID = 0;

          typeof callbackError === "function" && callbackError(_error5);
        },
        destroyed: function destroyed() {
          LOGGER.log("Janus Instance destroyed");
          self.janusInitOk = false;
          self.janusInstance = null;
          self.janusVideoPlugin = null;
          self.janusVideoStream = null;
          self.janusFeeds = [];
          self.janusVideoRoomID = 0;

          var localVideoContainerElement = document.getElementById(self.janusVideoOptions.localVideoContainerId);

          if (localVideoContainerElement !== null) {
            localVideoContainerElement.innerHTML = "";
          }

          var remoteVideosContainerElement = document.getElementById(self.janusVideoOptions.remoteVideosContainerId);

          if (remoteVideosContainerElement !== null) {
            remoteVideosContainerElement.innerHTML = "";
          }
        }
      });
    }
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
}

function unmuteAllInConference() {
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
}

function muteAllInConference() {
  var roomName = this.conferenceName.substring(this.conferenceName.indexOf("-") + 1);
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
}

function unmuteInConference(conferenceMemberID) {
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
}

function muteInConference(conferenceMemberID) {
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
}

function kickFromConference(conferenceMemberID) {
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
}

function modify(action, destination) {
  LOGGER.log(LOG_PREFIX, "Modifying call (", action, ") with id :", this.callID);
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

function sendText(message) {
  var fromDisplay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

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
  this.peerConnection.setRemoteDescription(new RTCSessionDescription({
    type: "answer",
    sdp: sdp
  }, function () {
    console.log("ok");
  }, function (error) {
    console.log("err");
  }));
}

/**
 * Create and answer for FreeSWITCH
 *
 * This function is called when FeeSWICTH sent its SDP first. In the case
 * where we need to re attach a verto session to an existing call, this
 * function will be called.
 */
function createAnswer() {
  var offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  };

  var self = this;

  this.peerConnection.setRemoteDescription(new RTCSessionDescription({
    type: "offer",
    sdp: self.clientObj._reattachParams.sdp
  })).then(function () {
    LOGGER.log("RTCSessionDescription created");
    return self.peerConnection.createAnswer();
  }).then(function (answer) {
    LOGGER.log("createAnswer returned successfully");
    return self.peerConnection.setLocalDescription(answer);
  }).then(function () {
    LOGGER.log("setLocalDescription returned successfully");
  }).catch(function (err) {
    LOGGER.log("Error : " + JSON.stringify(err));
  });
}

function attachStreamToPeerConnection() {
  var self = this;
  this.localAudioVideoStream.getTracks().forEach(function (track) {
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
  var pc_config = { iceServers: [] };
  var pc_constraints = {
    optional: [{ DtlsSrtpKeyAgreement: true }, { googIPv6: false }],
    mandatory: {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: false
    }
  };
  var self = this;

  LOGGER.log("Creating RTCPeerConnection...");
  this.peerConnection = new RTCPeerConnection(pc_config, pc_constraints);
  this.peerConnection.ontrack = function (event) {
    LOGGER.log("Received remote stream");
    if (self.remoteAudioVideo.srcObject !== event.streams[0]) {
      self.remoteAudioVideo.srcObject = event.streams[0];
    }
  };
  this.peerConnection.onicecandidate = function (event) {
    if (event.candidate) {
      LOGGER.log("ICE candidate received: " + event.candidate.candidate);
    } else if (!("onicegatheringstatechange" in RTCPeerConnection.prototype)) {
      // should not be done if its done in the icegatheringstatechange callback.
      LOGGER.log("Got all our ICE candidates, thanks!");
      startCall.call(self);
    }
  };
  this.peerConnection.oniceconnectionstatechange = function (event) {
    if (self.peerConnection === null) {
      LOGGER.log("peerConnection is null, call has been hungup ?");
      return;
    }

    LOGGER.log("ICE State : " + self.peerConnection.iceConnectionState);
    LOGGER.log("ICE State : " + self.peerConnection.iceConnectionState);
    LOGGER.log("ICE state change event: " + event);
  };
  this.peerConnection.onicegatheringstatechange = function () {
    if (self.peerConnection.iceGatheringState !== "complete") {
      return;
    }
    LOGGER.log("Got all our ICE candidates (from onicegatheringstatechange), thanks!");
    startCall.call(self);
  };
}

/**
 * Starts call by sending our SDP to FreeSWITCH in a call or reattach message
 */
function startCall() {
  LOGGER.log("Sending message");
  var callID = this.reattach ? this.callID : _Utils2.default.generateGUID();
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
  var self = this;

  if (this.extraLocalAudioVideoStream && this.extraLocalAudioVideoStream.active === true) {
    LOGGER.log("We have an extra MediaStream, probably because we are sharing the screen, let's close it");
    this.extraLocalAudioVideoStream.getTracks().forEach(function (track) {
      track.stop();
    });
  }

  this.localAudioVideoStream.getTracks().forEach(function (track) {
    track.stop();
  });

  var audioVideoDOMContainerObj = document.getElementById(this.audioVideoTagId);
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

function handleRoomChatMessage(message) {
  LOGGER.log("Received message : " + JSON.stringify(message));

  // remove type from message
  delete message.type;

  typeof this.userRoomChatMessageCallback === "function" && this.userRoomChatMessageCallback(msg);
}

function handleMembersInitialList(members) {
  LOGGER.log("Initial list of members");
  typeof this.userRoomMembersInitialListCallback === "function" && this.userRoomMembersInitialListCallback(members);
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

  typeof this.userRoomTalkingCallback === "function" && this.userRoomTalkingCallback(event);
}

function handleRoomAdd(dataArray) {
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

function handleRoomDel(dataArray) {
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

function handleRinging(userCallback) {
  LOGGER.log("Ringing");
  typeof this.userRingingCallback === "function" && this.userRingingCallback();
}

function handleAnswer(userCallback) {
  LOGGER.log("Answer");
  typeof this.userAnswerCallback === "function" && this.userAnswerCallback();
}

function handleGUMSuccess(stream) {
  LOGGER.log("WebRTC Ok");
  this.localAudioVideoStream = stream;
}

function handleGUMError(error) {
  LOGGER.log("Failed to get local media device (camera, mic, screen)");
  this.clientObj._onError({
    origin: "call",
    message: "Failed to get local media device (camera, mic, screen) : " + error.name
  });
}

exports.default = Call;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */



var utils = __webpack_require__(0);
// Shimming starts here.
module.exports = function(dependencies, opts) {
  var window = dependencies && dependencies.window;

  var options = {
    shimChrome: true,
    shimFirefox: true,
    shimEdge: true,
    shimSafari: true,
  };

  for (var key in opts) {
    if (hasOwnProperty.call(opts, key)) {
      options[key] = opts[key];
    }
  }

  // Utils.
  var logging = utils.log;
  var browserDetails = utils.detectBrowser(window);

  // Export to the adapter global object visible in the browser.
  var adapter = {
    browserDetails: browserDetails,
    extractVersion: utils.extractVersion,
    disableLog: utils.disableLog,
    disableWarnings: utils.disableWarnings
  };

  // Uncomment the line below if you want logging to occur, including logging
  // for the switch statement below. Can also be turned on in the browser via
  // adapter.disableLog(false), but then logging from the switch statement below
  // will not appear.
  // require('./utils').disableLog(false);

  // Browser shims.
  var chromeShim = __webpack_require__(10) || null;
  var edgeShim = __webpack_require__(12) || null;
  var firefoxShim = __webpack_require__(15) || null;
  var safariShim = __webpack_require__(17) || null;
  var commonShim = __webpack_require__(18) || null;

  // Shim browser if found.
  switch (browserDetails.browser) {
    case 'chrome':
      if (!chromeShim || !chromeShim.shimPeerConnection ||
          !options.shimChrome) {
        logging('Chrome shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming chrome.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = chromeShim;
      commonShim.shimCreateObjectURL(window);

      chromeShim.shimGetUserMedia(window);
      chromeShim.shimMediaStream(window);
      chromeShim.shimSourceObject(window);
      chromeShim.shimPeerConnection(window);
      chromeShim.shimOnTrack(window);
      chromeShim.shimAddTrackRemoveTrack(window);
      chromeShim.shimGetSendersWithDtmf(window);

      commonShim.shimRTCIceCandidate(window);
      break;
    case 'firefox':
      if (!firefoxShim || !firefoxShim.shimPeerConnection ||
          !options.shimFirefox) {
        logging('Firefox shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming firefox.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = firefoxShim;
      commonShim.shimCreateObjectURL(window);

      firefoxShim.shimGetUserMedia(window);
      firefoxShim.shimSourceObject(window);
      firefoxShim.shimPeerConnection(window);
      firefoxShim.shimOnTrack(window);
      firefoxShim.shimRemoveStream(window);

      commonShim.shimRTCIceCandidate(window);
      break;
    case 'edge':
      if (!edgeShim || !edgeShim.shimPeerConnection || !options.shimEdge) {
        logging('MS edge shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming edge.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = edgeShim;
      commonShim.shimCreateObjectURL(window);

      edgeShim.shimGetUserMedia(window);
      edgeShim.shimPeerConnection(window);
      edgeShim.shimReplaceTrack(window);

      // the edge shim implements the full RTCIceCandidate object.
      break;
    case 'safari':
      if (!safariShim || !options.shimSafari) {
        logging('Safari shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming safari.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = safariShim;
      commonShim.shimCreateObjectURL(window);

      safariShim.shimRTCIceServerUrls(window);
      safariShim.shimCallbacksAPI(window);
      safariShim.shimLocalStreamsAPI(window);
      safariShim.shimRemoteStreamsAPI(window);
      safariShim.shimTrackEventTransceiver(window);
      safariShim.shimGetUserMedia(window);
      safariShim.shimCreateOfferLegacy(window);

      commonShim.shimRTCIceCandidate(window);
      break;
    default:
      logging('Unsupported browser!');
      break;
  }

  return adapter;
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

var utils = __webpack_require__(0);
var logging = utils.log;

module.exports = {
  shimGetUserMedia: __webpack_require__(11),
  shimMediaStream: function(window) {
    window.MediaStream = window.MediaStream || window.webkitMediaStream;
  },

  shimOnTrack: function(window) {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
          }
          this.addEventListener('track', this._ontrack = f);
        }
      });
      var origSetRemoteDescription =
          window.RTCPeerConnection.prototype.setRemoteDescription;
      window.RTCPeerConnection.prototype.setRemoteDescription = function() {
        var pc = this;
        if (!pc._ontrackpoly) {
          pc._ontrackpoly = function(e) {
            // onaddstream does not fire when a track is added to an existing
            // stream. But stream.onaddtrack is implemented so we use that.
            e.stream.addEventListener('addtrack', function(te) {
              var receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = pc.getReceivers().find(function(r) {
                  return r.track && r.track.id === te.track.id;
                });
              } else {
                receiver = {track: te.track};
              }

              var event = new Event('track');
              event.track = te.track;
              event.receiver = receiver;
              event.transceiver = {receiver: receiver};
              event.streams = [e.stream];
              pc.dispatchEvent(event);
            });
            e.stream.getTracks().forEach(function(track) {
              var receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = pc.getReceivers().find(function(r) {
                  return r.track && r.track.id === track.id;
                });
              } else {
                receiver = {track: track};
              }
              var event = new Event('track');
              event.track = track;
              event.receiver = receiver;
              event.transceiver = {receiver: receiver};
              event.streams = [e.stream];
              pc.dispatchEvent(event);
            });
          };
          pc.addEventListener('addstream', pc._ontrackpoly);
        }
        return origSetRemoteDescription.apply(pc, arguments);
      };
    }
  },

  shimGetSendersWithDtmf: function(window) {
    // Overrides addTrack/removeTrack, depends on shimAddTrackRemoveTrack.
    if (typeof window === 'object' && window.RTCPeerConnection &&
        !('getSenders' in window.RTCPeerConnection.prototype) &&
        'createDTMFSender' in window.RTCPeerConnection.prototype) {
      var shimSenderWithDtmf = function(pc, track) {
        return {
          track: track,
          get dtmf() {
            if (this._dtmf === undefined) {
              if (track.kind === 'audio') {
                this._dtmf = pc.createDTMFSender(track);
              } else {
                this._dtmf = null;
              }
            }
            return this._dtmf;
          },
          _pc: pc
        };
      };

      // augment addTrack when getSenders is not available.
      if (!window.RTCPeerConnection.prototype.getSenders) {
        window.RTCPeerConnection.prototype.getSenders = function() {
          this._senders = this._senders || [];
          return this._senders.slice(); // return a copy of the internal state.
        };
        var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
        window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
          var pc = this;
          var sender = origAddTrack.apply(pc, arguments);
          if (!sender) {
            sender = shimSenderWithDtmf(pc, track);
            pc._senders.push(sender);
          }
          return sender;
        };

        var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
        window.RTCPeerConnection.prototype.removeTrack = function(sender) {
          var pc = this;
          origRemoveTrack.apply(pc, arguments);
          var idx = pc._senders.indexOf(sender);
          if (idx !== -1) {
            pc._senders.splice(idx, 1);
          }
        };
      }
      var origAddStream = window.RTCPeerConnection.prototype.addStream;
      window.RTCPeerConnection.prototype.addStream = function(stream) {
        var pc = this;
        pc._senders = pc._senders || [];
        origAddStream.apply(pc, [stream]);
        stream.getTracks().forEach(function(track) {
          pc._senders.push(shimSenderWithDtmf(pc, track));
        });
      };

      var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
      window.RTCPeerConnection.prototype.removeStream = function(stream) {
        var pc = this;
        pc._senders = pc._senders || [];
        origRemoveStream.apply(pc, [stream]);

        stream.getTracks().forEach(function(track) {
          var sender = pc._senders.find(function(s) {
            return s.track === track;
          });
          if (sender) {
            pc._senders.splice(pc._senders.indexOf(sender), 1); // remove sender
          }
        });
      };
    } else if (typeof window === 'object' && window.RTCPeerConnection &&
               'getSenders' in window.RTCPeerConnection.prototype &&
               'createDTMFSender' in window.RTCPeerConnection.prototype &&
               window.RTCRtpSender &&
               !('dtmf' in window.RTCRtpSender.prototype)) {
      var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
      window.RTCPeerConnection.prototype.getSenders = function() {
        var pc = this;
        var senders = origGetSenders.apply(pc, []);
        senders.forEach(function(sender) {
          sender._pc = pc;
        });
        return senders;
      };

      Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
        get: function() {
          if (this._dtmf === undefined) {
            if (this.track.kind === 'audio') {
              this._dtmf = this._pc.createDTMFSender(this.track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        }
      });
    }
  },

  shimSourceObject: function(window) {
    var URL = window && window.URL;

    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this._srcObject;
          },
          set: function(stream) {
            var self = this;
            // Use _srcObject as a private property for this shim
            this._srcObject = stream;
            if (this.src) {
              URL.revokeObjectURL(this.src);
            }

            if (!stream) {
              this.src = '';
              return undefined;
            }
            this.src = URL.createObjectURL(stream);
            // We need to recreate the blob url when a track is added or
            // removed. Doing it manually since we want to avoid a recursion.
            stream.addEventListener('addtrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
            stream.addEventListener('removetrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
          }
        });
      }
    }
  },

  shimAddTrackRemoveTrackWithNative: function(window) {
    // shim addTrack/removeTrack with native variants in order to make
    // the interactions with legacy getLocalStreams behave as in other browsers.
    // Keeps a mapping stream.id => [stream, rtpsenders...]
    window.RTCPeerConnection.prototype.getLocalStreams = function() {
      var pc = this;
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      return Object.keys(this._shimmedLocalStreams).map(function(streamId) {
        return pc._shimmedLocalStreams[streamId][0];
      });
    };

    var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
    window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
      if (!stream) {
        return origAddTrack.apply(this, arguments);
      }
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};

      var sender = origAddTrack.apply(this, arguments);
      if (!this._shimmedLocalStreams[stream.id]) {
        this._shimmedLocalStreams[stream.id] = [stream, sender];
      } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
        this._shimmedLocalStreams[stream.id].push(sender);
      }
      return sender;
    };

    var origAddStream = window.RTCPeerConnection.prototype.addStream;
    window.RTCPeerConnection.prototype.addStream = function(stream) {
      var pc = this;
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};

      stream.getTracks().forEach(function(track) {
        var alreadyExists = pc.getSenders().find(function(s) {
          return s.track === track;
        });
        if (alreadyExists) {
          throw new DOMException('Track already exists.',
              'InvalidAccessError');
        }
      });
      var existingSenders = pc.getSenders();
      origAddStream.apply(this, arguments);
      var newSenders = pc.getSenders().filter(function(newSender) {
        return existingSenders.indexOf(newSender) === -1;
      });
      this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
    };

    var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      delete this._shimmedLocalStreams[stream.id];
      return origRemoveStream.apply(this, arguments);
    };

    var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
    window.RTCPeerConnection.prototype.removeTrack = function(sender) {
      var pc = this;
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      if (sender) {
        Object.keys(this._shimmedLocalStreams).forEach(function(streamId) {
          var idx = pc._shimmedLocalStreams[streamId].indexOf(sender);
          if (idx !== -1) {
            pc._shimmedLocalStreams[streamId].splice(idx, 1);
          }
          if (pc._shimmedLocalStreams[streamId].length === 1) {
            delete pc._shimmedLocalStreams[streamId];
          }
        });
      }
      return origRemoveTrack.apply(this, arguments);
    };
  },

  shimAddTrackRemoveTrack: function(window) {
    var browserDetails = utils.detectBrowser(window);
    // shim addTrack and removeTrack.
    if (window.RTCPeerConnection.prototype.addTrack &&
        browserDetails.version >= 65) {
      return this.shimAddTrackRemoveTrackWithNative(window);
    }

    // also shim pc.getLocalStreams when addTrack is shimmed
    // to return the original streams.
    var origGetLocalStreams = window.RTCPeerConnection.prototype
        .getLocalStreams;
    window.RTCPeerConnection.prototype.getLocalStreams = function() {
      var pc = this;
      var nativeStreams = origGetLocalStreams.apply(this);
      pc._reverseStreams = pc._reverseStreams || {};
      return nativeStreams.map(function(stream) {
        return pc._reverseStreams[stream.id];
      });
    };

    var origAddStream = window.RTCPeerConnection.prototype.addStream;
    window.RTCPeerConnection.prototype.addStream = function(stream) {
      var pc = this;
      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};

      stream.getTracks().forEach(function(track) {
        var alreadyExists = pc.getSenders().find(function(s) {
          return s.track === track;
        });
        if (alreadyExists) {
          throw new DOMException('Track already exists.',
              'InvalidAccessError');
        }
      });
      // Add identity mapping for consistency with addTrack.
      // Unless this is being used with a stream from addTrack.
      if (!pc._reverseStreams[stream.id]) {
        var newStream = new window.MediaStream(stream.getTracks());
        pc._streams[stream.id] = newStream;
        pc._reverseStreams[newStream.id] = stream;
        stream = newStream;
      }
      origAddStream.apply(pc, [stream]);
    };

    var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      var pc = this;
      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};

      origRemoveStream.apply(pc, [(pc._streams[stream.id] || stream)]);
      delete pc._reverseStreams[(pc._streams[stream.id] ?
          pc._streams[stream.id].id : stream.id)];
      delete pc._streams[stream.id];
    };

    window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
      var pc = this;
      if (pc.signalingState === 'closed') {
        throw new DOMException(
          'The RTCPeerConnection\'s signalingState is \'closed\'.',
          'InvalidStateError');
      }
      var streams = [].slice.call(arguments, 1);
      if (streams.length !== 1 ||
          !streams[0].getTracks().find(function(t) {
            return t === track;
          })) {
        // this is not fully correct but all we can manage without
        // [[associated MediaStreams]] internal slot.
        throw new DOMException(
          'The adapter.js addTrack polyfill only supports a single ' +
          ' stream which is associated with the specified track.',
          'NotSupportedError');
      }

      var alreadyExists = pc.getSenders().find(function(s) {
        return s.track === track;
      });
      if (alreadyExists) {
        throw new DOMException('Track already exists.',
            'InvalidAccessError');
      }

      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};
      var oldStream = pc._streams[stream.id];
      if (oldStream) {
        // this is using odd Chrome behaviour, use with caution:
        // https://bugs.chromium.org/p/webrtc/issues/detail?id=7815
        // Note: we rely on the high-level addTrack/dtmf shim to
        // create the sender with a dtmf sender.
        oldStream.addTrack(track);

        // Trigger ONN async.
        Promise.resolve().then(function() {
          pc.dispatchEvent(new Event('negotiationneeded'));
        });
      } else {
        var newStream = new window.MediaStream([track]);
        pc._streams[stream.id] = newStream;
        pc._reverseStreams[newStream.id] = stream;
        pc.addStream(newStream);
      }
      return pc.getSenders().find(function(s) {
        return s.track === track;
      });
    };

    // replace the internal stream id with the external one and
    // vice versa.
    function replaceInternalStreamId(pc, description) {
      var sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach(function(internalId) {
        var externalStream = pc._reverseStreams[internalId];
        var internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(new RegExp(internalStream.id, 'g'),
            externalStream.id);
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp: sdp
      });
    }
    function replaceExternalStreamId(pc, description) {
      var sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach(function(internalId) {
        var externalStream = pc._reverseStreams[internalId];
        var internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(new RegExp(externalStream.id, 'g'),
            internalStream.id);
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp: sdp
      });
    }
    ['createOffer', 'createAnswer'].forEach(function(method) {
      var nativeMethod = window.RTCPeerConnection.prototype[method];
      window.RTCPeerConnection.prototype[method] = function() {
        var pc = this;
        var args = arguments;
        var isLegacyCall = arguments.length &&
            typeof arguments[0] === 'function';
        if (isLegacyCall) {
          return nativeMethod.apply(pc, [
            function(description) {
              var desc = replaceInternalStreamId(pc, description);
              args[0].apply(null, [desc]);
            },
            function(err) {
              if (args[1]) {
                args[1].apply(null, err);
              }
            }, arguments[2]
          ]);
        }
        return nativeMethod.apply(pc, arguments)
        .then(function(description) {
          return replaceInternalStreamId(pc, description);
        });
      };
    });

    var origSetLocalDescription =
        window.RTCPeerConnection.prototype.setLocalDescription;
    window.RTCPeerConnection.prototype.setLocalDescription = function() {
      var pc = this;
      if (!arguments.length || !arguments[0].type) {
        return origSetLocalDescription.apply(pc, arguments);
      }
      arguments[0] = replaceExternalStreamId(pc, arguments[0]);
      return origSetLocalDescription.apply(pc, arguments);
    };

    // TODO: mangle getStats: https://w3c.github.io/webrtc-stats/#dom-rtcmediastreamstats-streamidentifier

    var origLocalDescription = Object.getOwnPropertyDescriptor(
        window.RTCPeerConnection.prototype, 'localDescription');
    Object.defineProperty(window.RTCPeerConnection.prototype,
        'localDescription', {
          get: function() {
            var pc = this;
            var description = origLocalDescription.get.apply(this);
            if (description.type === '') {
              return description;
            }
            return replaceInternalStreamId(pc, description);
          }
        });

    window.RTCPeerConnection.prototype.removeTrack = function(sender) {
      var pc = this;
      if (pc.signalingState === 'closed') {
        throw new DOMException(
          'The RTCPeerConnection\'s signalingState is \'closed\'.',
          'InvalidStateError');
      }
      // We can not yet check for sender instanceof RTCRtpSender
      // since we shim RTPSender. So we check if sender._pc is set.
      if (!sender._pc) {
        throw new DOMException('Argument 1 of RTCPeerConnection.removeTrack ' +
            'does not implement interface RTCRtpSender.', 'TypeError');
      }
      var isLocal = sender._pc === pc;
      if (!isLocal) {
        throw new DOMException('Sender was not created by this connection.',
            'InvalidAccessError');
      }

      // Search for the native stream the senders track belongs to.
      pc._streams = pc._streams || {};
      var stream;
      Object.keys(pc._streams).forEach(function(streamid) {
        var hasTrack = pc._streams[streamid].getTracks().find(function(track) {
          return sender.track === track;
        });
        if (hasTrack) {
          stream = pc._streams[streamid];
        }
      });

      if (stream) {
        if (stream.getTracks().length === 1) {
          // if this is the last track of the stream, remove the stream. This
          // takes care of any shimmed _senders.
          pc.removeStream(pc._reverseStreams[stream.id]);
        } else {
          // relying on the same odd chrome behaviour as above.
          stream.removeTrack(sender.track);
        }
        pc.dispatchEvent(new Event('negotiationneeded'));
      }
    };
  },

  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        // Translate iceTransportPolicy to iceTransports,
        // see https://code.google.com/p/webrtc/issues/detail?id=4869
        // this was fixed in M56 along with unprefixing RTCPeerConnection.
        logging('PeerConnection');
        if (pcConfig && pcConfig.iceTransportPolicy) {
          pcConfig.iceTransports = pcConfig.iceTransportPolicy;
        }

        return new window.webkitRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype =
          window.webkitRTCPeerConnection.prototype;
      // wrap static methods. Currently just generateCertificate.
      if (window.webkitRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return window.webkitRTCPeerConnection.generateCertificate;
          }
        });
      }
    } else {
      // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
      var OrigPeerConnection = window.RTCPeerConnection;
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (pcConfig && pcConfig.iceServers) {
          var newIceServers = [];
          for (var i = 0; i < pcConfig.iceServers.length; i++) {
            var server = pcConfig.iceServers[i];
            if (!server.hasOwnProperty('urls') &&
                server.hasOwnProperty('url')) {
              utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
              server = JSON.parse(JSON.stringify(server));
              server.urls = server.url;
              newIceServers.push(server);
            } else {
              newIceServers.push(pcConfig.iceServers[i]);
            }
          }
          pcConfig.iceServers = newIceServers;
        }
        return new OrigPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
      // wrap static methods. Currently just generateCertificate.
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function() {
          return OrigPeerConnection.generateCertificate;
        }
      });
    }

    var origGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function(selector,
        successCallback, errorCallback) {
      var pc = this;
      var args = arguments;

      // If selector is a function then we are in the old style stats so just
      // pass back the original getStats format to avoid breaking old users.
      if (arguments.length > 0 && typeof selector === 'function') {
        return origGetStats.apply(this, arguments);
      }

      // When spec-style getStats is supported, return those when called with
      // either no arguments or the selector argument is null.
      if (origGetStats.length === 0 && (arguments.length === 0 ||
          typeof arguments[0] !== 'function')) {
        return origGetStats.apply(this, []);
      }

      var fixChromeStats_ = function(response) {
        var standardReport = {};
        var reports = response.result();
        reports.forEach(function(report) {
          var standardStats = {
            id: report.id,
            timestamp: report.timestamp,
            type: {
              localcandidate: 'local-candidate',
              remotecandidate: 'remote-candidate'
            }[report.type] || report.type
          };
          report.names().forEach(function(name) {
            standardStats[name] = report.stat(name);
          });
          standardReport[standardStats.id] = standardStats;
        });

        return standardReport;
      };

      // shim getStats with maplike support
      var makeMapStats = function(stats) {
        return new Map(Object.keys(stats).map(function(key) {
          return [key, stats[key]];
        }));
      };

      if (arguments.length >= 2) {
        var successCallbackWrapper_ = function(response) {
          args[1](makeMapStats(fixChromeStats_(response)));
        };

        return origGetStats.apply(this, [successCallbackWrapper_,
          arguments[0]]);
      }

      // promise-support
      return new Promise(function(resolve, reject) {
        origGetStats.apply(pc, [
          function(response) {
            resolve(makeMapStats(fixChromeStats_(response)));
          }, reject]);
      }).then(successCallback, errorCallback);
    };

    // add promise support -- natively available in Chrome 51
    if (browserDetails.version < 51) {
      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
          .forEach(function(method) {
            var nativeMethod = window.RTCPeerConnection.prototype[method];
            window.RTCPeerConnection.prototype[method] = function() {
              var args = arguments;
              var pc = this;
              var promise = new Promise(function(resolve, reject) {
                nativeMethod.apply(pc, [args[0], resolve, reject]);
              });
              if (args.length < 2) {
                return promise;
              }
              return promise.then(function() {
                args[1].apply(null, []);
              },
              function(err) {
                if (args.length >= 3) {
                  args[2].apply(null, [err]);
                }
              });
            };
          });
    }

    // promise support for createOffer and createAnswer. Available (without
    // bugs) since M52: crbug/619289
    if (browserDetails.version < 52) {
      ['createOffer', 'createAnswer'].forEach(function(method) {
        var nativeMethod = window.RTCPeerConnection.prototype[method];
        window.RTCPeerConnection.prototype[method] = function() {
          var pc = this;
          if (arguments.length < 1 || (arguments.length === 1 &&
              typeof arguments[0] === 'object')) {
            var opts = arguments.length === 1 ? arguments[0] : undefined;
            return new Promise(function(resolve, reject) {
              nativeMethod.apply(pc, [resolve, reject, opts]);
            });
          }
          return nativeMethod.apply(this, arguments);
        };
      });
    }

    // shim implicit creation of RTCSessionDescription/RTCIceCandidate
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = window.RTCPeerConnection.prototype[method];
          window.RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null or undefined)
    var nativeAddIceCandidate =
        window.RTCPeerConnection.prototype.addIceCandidate;
    window.RTCPeerConnection.prototype.addIceCandidate = function() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };
  }
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

var utils = __webpack_require__(0);
var logging = utils.log;

// Expose public methods.
module.exports = function(window) {
  var browserDetails = utils.detectBrowser(window);
  var navigator = window && window.navigator;

  var constraintsToChrome_ = function(c) {
    if (typeof c !== 'object' || c.mandatory || c.optional) {
      return c;
    }
    var cc = {};
    Object.keys(c).forEach(function(key) {
      if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
        return;
      }
      var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
      if (r.exact !== undefined && typeof r.exact === 'number') {
        r.min = r.max = r.exact;
      }
      var oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return (name === 'deviceId') ? 'sourceId' : name;
      };
      if (r.ideal !== undefined) {
        cc.optional = cc.optional || [];
        var oc = {};
        if (typeof r.ideal === 'number') {
          oc[oldname_('min', key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_('max', key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_('', key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== undefined && typeof r.exact !== 'number') {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_('', key)] = r.exact;
      } else {
        ['min', 'max'].forEach(function(mix) {
          if (r[mix] !== undefined) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };

  var shimConstraints_ = function(constraints, func) {
    if (browserDetails.version >= 61) {
      return func(constraints);
    }
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && typeof constraints.audio === 'object') {
      var remap = function(obj, a, b) {
        if (a in obj && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      remap(constraints.audio, 'autoGainControl', 'googAutoGainControl');
      remap(constraints.audio, 'noiseSuppression', 'googNoiseSuppression');
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === 'object') {
      // Shim facingMode for mobile & surface pro.
      var face = constraints.video.facingMode;
      face = face && ((typeof face === 'object') ? face : {ideal: face});
      var getSupportedFacingModeLies = browserDetails.version < 66;

      if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                    face.ideal === 'user' || face.ideal === 'environment')) &&
          !(navigator.mediaDevices.getSupportedConstraints &&
            navigator.mediaDevices.getSupportedConstraints().facingMode &&
            !getSupportedFacingModeLies)) {
        delete constraints.video.facingMode;
        var matches;
        if (face.exact === 'environment' || face.ideal === 'environment') {
          matches = ['back', 'rear'];
        } else if (face.exact === 'user' || face.ideal === 'user') {
          matches = ['front'];
        }
        if (matches) {
          // Look for matches in label, or use last cam for back (typical).
          return navigator.mediaDevices.enumerateDevices()
          .then(function(devices) {
            devices = devices.filter(function(d) {
              return d.kind === 'videoinput';
            });
            var dev = devices.find(function(d) {
              return matches.some(function(match) {
                return d.label.toLowerCase().indexOf(match) !== -1;
              });
            });
            if (!dev && devices.length && matches.indexOf('back') !== -1) {
              dev = devices[devices.length - 1]; // more likely the back cam
            }
            if (dev) {
              constraints.video.deviceId = face.exact ? {exact: dev.deviceId} :
                                                        {ideal: dev.deviceId};
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging('chrome: ' + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging('chrome: ' + JSON.stringify(constraints));
    return func(constraints);
  };

  var shimError_ = function(e) {
    return {
      name: {
        PermissionDeniedError: 'NotAllowedError',
        InvalidStateError: 'NotReadableError',
        DevicesNotFoundError: 'NotFoundError',
        ConstraintNotSatisfiedError: 'OverconstrainedError',
        TrackStartError: 'NotReadableError',
        MediaDeviceFailedDueToShutdown: 'NotReadableError',
        MediaDeviceKillSwitchOn: 'NotReadableError'
      }[e.name] || e.name,
      message: e.message,
      constraint: e.constraintName,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  var getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, function(c) {
      navigator.webkitGetUserMedia(c, onSuccess, function(e) {
        if (onError) {
          onError(shimError_(e));
        }
      });
    });
  };

  navigator.getUserMedia = getUserMedia_;

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      navigator.getUserMedia(constraints, resolve, reject);
    });
  };

  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {
      getUserMedia: getUserMediaPromise_,
      enumerateDevices: function() {
        return new Promise(function(resolve) {
          var kinds = {audio: 'audioinput', video: 'videoinput'};
          return window.MediaStreamTrack.getSources(function(devices) {
            resolve(devices.map(function(device) {
              return {label: device.label,
                kind: kinds[device.kind],
                deviceId: device.id,
                groupId: ''};
            }));
          });
        });
      },
      getSupportedConstraints: function() {
        return {
          deviceId: true, echoCancellation: true, facingMode: true,
          frameRate: true, height: true, width: true
        };
      }
    };
  }

  // A shim for getUserMedia method on the mediaDevices object.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (!navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      return getUserMediaPromise_(constraints);
    };
  } else {
    // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
    // function which returns a Promise, it does not accept spec-style
    // constraints.
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, function(c) {
        return origGetUserMedia(c).then(function(stream) {
          if (c.audio && !stream.getAudioTracks().length ||
              c.video && !stream.getVideoTracks().length) {
            stream.getTracks().forEach(function(track) {
              track.stop();
            });
            throw new DOMException('', 'NotFoundError');
          }
          return stream;
        }, function(e) {
          return Promise.reject(shimError_(e));
        });
      });
    };
  }

  // Dummy devicechange event methods.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
    navigator.mediaDevices.addEventListener = function() {
      logging('Dummy mediaDevices.addEventListener called.');
    };
  }
  if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
    navigator.mediaDevices.removeEventListener = function() {
      logging('Dummy mediaDevices.removeEventListener called.');
    };
  }
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */


var utils = __webpack_require__(0);
var shimRTCPeerConnection = __webpack_require__(13);

module.exports = {
  shimGetUserMedia: __webpack_require__(14),
  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    if (window.RTCIceGatherer) {
      // ORTC defines an RTCIceCandidate object but no constructor.
      // Not implemented in Edge.
      if (!window.RTCIceCandidate) {
        window.RTCIceCandidate = function(args) {
          return args;
        };
      }
      // ORTC does not have a session description object but
      // other browsers (i.e. Chrome) that will support both PC and ORTC
      // in the future might have this defined already.
      if (!window.RTCSessionDescription) {
        window.RTCSessionDescription = function(args) {
          return args;
        };
      }
      // this adds an additional event listener to MediaStrackTrack that signals
      // when a tracks enabled property was changed. Workaround for a bug in
      // addStream, see below. No longer required in 15025+
      if (browserDetails.version < 15025) {
        var origMSTEnabled = Object.getOwnPropertyDescriptor(
            window.MediaStreamTrack.prototype, 'enabled');
        Object.defineProperty(window.MediaStreamTrack.prototype, 'enabled', {
          set: function(value) {
            origMSTEnabled.set.call(this, value);
            var ev = new Event('enabled');
            ev.enabled = value;
            this.dispatchEvent(ev);
          }
        });
      }
    }

    // ORTC defines the DTMF sender a bit different.
    // https://github.com/w3c/ortc/issues/714
    if (window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
      Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
        get: function() {
          if (this._dtmf === undefined) {
            if (this.track.kind === 'audio') {
              this._dtmf = new window.RTCDtmfSender(this);
            } else if (this.track.kind === 'video') {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        }
      });
    }

    window.RTCPeerConnection =
        shimRTCPeerConnection(window, browserDetails.version);
  },
  shimReplaceTrack: function(window) {
    // ORTC has replaceTrack -- https://github.com/w3c/ortc/issues/614
    if (window.RTCRtpSender &&
        !('replaceTrack' in window.RTCRtpSender.prototype)) {
      window.RTCRtpSender.prototype.replaceTrack =
          window.RTCRtpSender.prototype.setTrack;
    }
  }
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */


var SDPUtils = __webpack_require__(3);

function writeMediaSection(transceiver, caps, type, stream, dtlsRole) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
      transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
      transceiver.dtlsTransport.getLocalParameters(),
      type === 'offer' ? 'actpass' : dtlsRole || 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
    sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
    sdp += 'a=recvonly\r\n';
  } else {
    sdp += 'a=inactive\r\n';
  }

  if (transceiver.rtpSender) {
    // spec.
    var msid = 'msid:' + stream.id + ' ' +
        transceiver.rtpSender.track.id + '\r\n';
    sdp += 'a=' + msid;

    // for Chrome.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
        ' ' + msid;
    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
          ' ' + msid;
      sdp += 'a=ssrc-group:FID ' +
          transceiver.sendEncodingParameters[0].ssrc + ' ' +
          transceiver.sendEncodingParameters[0].rtx.ssrc +
          '\r\n';
    }
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
      ' cname:' + SDPUtils.localCName + '\r\n';
  if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
        ' cname:' + SDPUtils.localCName + '\r\n';
  }
  return sdp;
}

// Edge does not like
// 1) stun: filtered after 14393 unless ?transport=udp is present
// 2) turn: that does not have all of turn:host:port?transport=udp
// 3) turn: with ipv6 addresses
// 4) turn: occurring muliple times
function filterIceServers(iceServers, edgeVersion) {
  var hasTurn = false;
  iceServers = JSON.parse(JSON.stringify(iceServers));
  return iceServers.filter(function(server) {
    if (server && (server.urls || server.url)) {
      var urls = server.urls || server.url;
      if (server.url && !server.urls) {
        console.warn('RTCIceServer.url is deprecated! Use urls instead.');
      }
      var isString = typeof urls === 'string';
      if (isString) {
        urls = [urls];
      }
      urls = urls.filter(function(url) {
        var validTurn = url.indexOf('turn:') === 0 &&
            url.indexOf('transport=udp') !== -1 &&
            url.indexOf('turn:[') === -1 &&
            !hasTurn;

        if (validTurn) {
          hasTurn = true;
          return true;
        }
        return url.indexOf('stun:') === 0 && edgeVersion >= 14393 &&
            url.indexOf('?transport=udp') === -1;
      });

      delete server.url;
      server.urls = isString ? urls[0] : urls;
      return !!urls.length;
    }
  });
}

// Determines the intersection of local and remote capabilities.
function getCommonCapabilities(localCapabilities, remoteCapabilities) {
  var commonCapabilities = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: []
  };

  var findCodecByPayloadType = function(pt, codecs) {
    pt = parseInt(pt, 10);
    for (var i = 0; i < codecs.length; i++) {
      if (codecs[i].payloadType === pt ||
          codecs[i].preferredPayloadType === pt) {
        return codecs[i];
      }
    }
  };

  var rtxCapabilityMatches = function(lRtx, rRtx, lCodecs, rCodecs) {
    var lCodec = findCodecByPayloadType(lRtx.parameters.apt, lCodecs);
    var rCodec = findCodecByPayloadType(rRtx.parameters.apt, rCodecs);
    return lCodec && rCodec &&
        lCodec.name.toLowerCase() === rCodec.name.toLowerCase();
  };

  localCapabilities.codecs.forEach(function(lCodec) {
    for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
      var rCodec = remoteCapabilities.codecs[i];
      if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
          lCodec.clockRate === rCodec.clockRate) {
        if (lCodec.name.toLowerCase() === 'rtx' &&
            lCodec.parameters && rCodec.parameters.apt) {
          // for RTX we need to find the local rtx that has a apt
          // which points to the same local codec as the remote one.
          if (!rtxCapabilityMatches(lCodec, rCodec,
              localCapabilities.codecs, remoteCapabilities.codecs)) {
            continue;
          }
        }
        rCodec = JSON.parse(JSON.stringify(rCodec)); // deepcopy
        // number of channels is the highest common number of channels
        rCodec.numChannels = Math.min(lCodec.numChannels,
            rCodec.numChannels);
        // push rCodec so we reply with offerer payload type
        commonCapabilities.codecs.push(rCodec);

        // determine common feedback mechanisms
        rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function(fb) {
          for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
            if (lCodec.rtcpFeedback[j].type === fb.type &&
                lCodec.rtcpFeedback[j].parameter === fb.parameter) {
              return true;
            }
          }
          return false;
        });
        // FIXME: also need to determine .parameters
        //  see https://github.com/openpeer/ortc/issues/569
        break;
      }
    }
  });

  localCapabilities.headerExtensions.forEach(function(lHeaderExtension) {
    for (var i = 0; i < remoteCapabilities.headerExtensions.length;
         i++) {
      var rHeaderExtension = remoteCapabilities.headerExtensions[i];
      if (lHeaderExtension.uri === rHeaderExtension.uri) {
        commonCapabilities.headerExtensions.push(rHeaderExtension);
        break;
      }
    }
  });

  // FIXME: fecMechanisms
  return commonCapabilities;
}

// is action=setLocalDescription with type allowed in signalingState
function isActionAllowedInSignalingState(action, type, signalingState) {
  return {
    offer: {
      setLocalDescription: ['stable', 'have-local-offer'],
      setRemoteDescription: ['stable', 'have-remote-offer']
    },
    answer: {
      setLocalDescription: ['have-remote-offer', 'have-local-pranswer'],
      setRemoteDescription: ['have-local-offer', 'have-remote-pranswer']
    }
  }[type][action].indexOf(signalingState) !== -1;
}

function maybeAddCandidate(iceTransport, candidate) {
  // Edge's internal representation adds some fields therefore
  // not all fieldѕ are taken into account.
  var alreadyAdded = iceTransport.getRemoteCandidates()
      .find(function(remoteCandidate) {
        return candidate.foundation === remoteCandidate.foundation &&
            candidate.ip === remoteCandidate.ip &&
            candidate.port === remoteCandidate.port &&
            candidate.priority === remoteCandidate.priority &&
            candidate.protocol === remoteCandidate.protocol &&
            candidate.type === remoteCandidate.type;
      });
  if (!alreadyAdded) {
    iceTransport.addRemoteCandidate(candidate);
  }
  return !alreadyAdded;
}


// https://w3c.github.io/mediacapture-main/#mediastream
// Helper function to add the track to the stream and
// dispatch the event ourselves.
function addTrackToStreamAndFireEvent(track, stream) {
  stream.addTrack(track);
  var e = new Event('addtrack'); // TODO: MediaStreamTrackEvent
  e.track = track;
  stream.dispatchEvent(e);
}

function removeTrackFromStreamAndFireEvent(track, stream) {
  stream.removeTrack(track);
  var e = new Event('removetrack'); // TODO: MediaStreamTrackEvent
  e.track = track;
  stream.dispatchEvent(e);
}

function fireAddTrack(pc, track, receiver, streams) {
  var trackEvent = new Event('track');
  trackEvent.track = track;
  trackEvent.receiver = receiver;
  trackEvent.transceiver = {receiver: receiver};
  trackEvent.streams = streams;
  window.setTimeout(function() {
    pc._dispatchEvent('track', trackEvent);
  });
}

function makeError(name, description) {
  var e = new Error(description);
  e.name = name;
  return e;
}

module.exports = function(window, edgeVersion) {
  var RTCPeerConnection = function(config) {
    var pc = this;

    var _eventTarget = document.createDocumentFragment();
    ['addEventListener', 'removeEventListener', 'dispatchEvent']
        .forEach(function(method) {
          pc[method] = _eventTarget[method].bind(_eventTarget);
        });

    this.canTrickleIceCandidates = null;

    this.needNegotiation = false;

    this.localStreams = [];
    this.remoteStreams = [];

    this.localDescription = null;
    this.remoteDescription = null;

    this.signalingState = 'stable';
    this.iceConnectionState = 'new';
    this.iceGatheringState = 'new';

    config = JSON.parse(JSON.stringify(config || {}));

    this.usingBundle = config.bundlePolicy === 'max-bundle';
    if (config.rtcpMuxPolicy === 'negotiate') {
      throw(makeError('NotSupportedError',
          'rtcpMuxPolicy \'negotiate\' is not supported'));
    } else if (!config.rtcpMuxPolicy) {
      config.rtcpMuxPolicy = 'require';
    }

    switch (config.iceTransportPolicy) {
      case 'all':
      case 'relay':
        break;
      default:
        config.iceTransportPolicy = 'all';
        break;
    }

    switch (config.bundlePolicy) {
      case 'balanced':
      case 'max-compat':
      case 'max-bundle':
        break;
      default:
        config.bundlePolicy = 'balanced';
        break;
    }

    config.iceServers = filterIceServers(config.iceServers || [], edgeVersion);

    this._iceGatherers = [];
    if (config.iceCandidatePoolSize) {
      for (var i = config.iceCandidatePoolSize; i > 0; i--) {
        this._iceGatherers = new window.RTCIceGatherer({
          iceServers: config.iceServers,
          gatherPolicy: config.iceTransportPolicy
        });
      }
    } else {
      config.iceCandidatePoolSize = 0;
    }

    this._config = config;

    // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
    // everything that is needed to describe a SDP m-line.
    this.transceivers = [];

    this._sdpSessionId = SDPUtils.generateSessionId();
    this._sdpSessionVersion = 0;

    this._dtlsRole = undefined; // role for a=setup to use in answers.

    this._isClosed = false;
  };

  // set up event handlers on prototype
  RTCPeerConnection.prototype.onicecandidate = null;
  RTCPeerConnection.prototype.onaddstream = null;
  RTCPeerConnection.prototype.ontrack = null;
  RTCPeerConnection.prototype.onremovestream = null;
  RTCPeerConnection.prototype.onsignalingstatechange = null;
  RTCPeerConnection.prototype.oniceconnectionstatechange = null;
  RTCPeerConnection.prototype.onicegatheringstatechange = null;
  RTCPeerConnection.prototype.onnegotiationneeded = null;
  RTCPeerConnection.prototype.ondatachannel = null;

  RTCPeerConnection.prototype._dispatchEvent = function(name, event) {
    if (this._isClosed) {
      return;
    }
    this.dispatchEvent(event);
    if (typeof this['on' + name] === 'function') {
      this['on' + name](event);
    }
  };

  RTCPeerConnection.prototype._emitGatheringStateChange = function() {
    var event = new Event('icegatheringstatechange');
    this._dispatchEvent('icegatheringstatechange', event);
  };

  RTCPeerConnection.prototype.getConfiguration = function() {
    return this._config;
  };

  RTCPeerConnection.prototype.getLocalStreams = function() {
    return this.localStreams;
  };

  RTCPeerConnection.prototype.getRemoteStreams = function() {
    return this.remoteStreams;
  };

  // internal helper to create a transceiver object.
  // (whih is not yet the same as the WebRTC 1.0 transceiver)
  RTCPeerConnection.prototype._createTransceiver = function(kind) {
    var hasBundleTransport = this.transceivers.length > 0;
    var transceiver = {
      track: null,
      iceGatherer: null,
      iceTransport: null,
      dtlsTransport: null,
      localCapabilities: null,
      remoteCapabilities: null,
      rtpSender: null,
      rtpReceiver: null,
      kind: kind,
      mid: null,
      sendEncodingParameters: null,
      recvEncodingParameters: null,
      stream: null,
      associatedRemoteMediaStreams: [],
      wantReceive: true
    };
    if (this.usingBundle && hasBundleTransport) {
      transceiver.iceTransport = this.transceivers[0].iceTransport;
      transceiver.dtlsTransport = this.transceivers[0].dtlsTransport;
    } else {
      var transports = this._createIceAndDtlsTransports();
      transceiver.iceTransport = transports.iceTransport;
      transceiver.dtlsTransport = transports.dtlsTransport;
    }
    this.transceivers.push(transceiver);
    return transceiver;
  };

  RTCPeerConnection.prototype.addTrack = function(track, stream) {
    var alreadyExists = this.transceivers.find(function(s) {
      return s.track === track;
    });

    if (alreadyExists) {
      throw makeError('InvalidAccessError', 'Track already exists.');
    }

    if (this.signalingState === 'closed') {
      throw makeError('InvalidStateError',
          'Attempted to call addTrack on a closed peerconnection.');
    }

    var transceiver;
    for (var i = 0; i < this.transceivers.length; i++) {
      if (!this.transceivers[i].track &&
          this.transceivers[i].kind === track.kind) {
        transceiver = this.transceivers[i];
      }
    }
    if (!transceiver) {
      transceiver = this._createTransceiver(track.kind);
    }

    this._maybeFireNegotiationNeeded();

    if (this.localStreams.indexOf(stream) === -1) {
      this.localStreams.push(stream);
    }

    transceiver.track = track;
    transceiver.stream = stream;
    transceiver.rtpSender = new window.RTCRtpSender(track,
        transceiver.dtlsTransport);
    return transceiver.rtpSender;
  };

  RTCPeerConnection.prototype.addStream = function(stream) {
    var pc = this;
    if (edgeVersion >= 15025) {
      stream.getTracks().forEach(function(track) {
        pc.addTrack(track, stream);
      });
    } else {
      // Clone is necessary for local demos mostly, attaching directly
      // to two different senders does not work (build 10547).
      // Fixed in 15025 (or earlier)
      var clonedStream = stream.clone();
      stream.getTracks().forEach(function(track, idx) {
        var clonedTrack = clonedStream.getTracks()[idx];
        track.addEventListener('enabled', function(event) {
          clonedTrack.enabled = event.enabled;
        });
      });
      clonedStream.getTracks().forEach(function(track) {
        pc.addTrack(track, clonedStream);
      });
    }
  };

  RTCPeerConnection.prototype.removeTrack = function(sender) {
    if (!(sender instanceof window.RTCRtpSender)) {
      throw new TypeError('Argument 1 of RTCPeerConnection.removeTrack ' +
          'does not implement interface RTCRtpSender.');
    }

    var transceiver = this.transceivers.find(function(t) {
      return t.rtpSender === sender;
    });

    if (!transceiver) {
      throw makeError('InvalidAccessError',
          'Sender was not created by this connection.');
    }
    var stream = transceiver.stream;

    transceiver.rtpSender.stop();
    transceiver.rtpSender = null;
    transceiver.track = null;
    transceiver.stream = null;

    // remove the stream from the set of local streams
    var localStreams = this.transceivers.map(function(t) {
      return t.stream;
    });
    if (localStreams.indexOf(stream) === -1 &&
        this.localStreams.indexOf(stream) > -1) {
      this.localStreams.splice(this.localStreams.indexOf(stream), 1);
    }

    this._maybeFireNegotiationNeeded();
  };

  RTCPeerConnection.prototype.removeStream = function(stream) {
    var pc = this;
    stream.getTracks().forEach(function(track) {
      var sender = pc.getSenders().find(function(s) {
        return s.track === track;
      });
      if (sender) {
        pc.removeTrack(sender);
      }
    });
  };

  RTCPeerConnection.prototype.getSenders = function() {
    return this.transceivers.filter(function(transceiver) {
      return !!transceiver.rtpSender;
    })
    .map(function(transceiver) {
      return transceiver.rtpSender;
    });
  };

  RTCPeerConnection.prototype.getReceivers = function() {
    return this.transceivers.filter(function(transceiver) {
      return !!transceiver.rtpReceiver;
    })
    .map(function(transceiver) {
      return transceiver.rtpReceiver;
    });
  };


  RTCPeerConnection.prototype._createIceGatherer = function(sdpMLineIndex,
      usingBundle) {
    var pc = this;
    if (usingBundle && sdpMLineIndex > 0) {
      return this.transceivers[0].iceGatherer;
    } else if (this._iceGatherers.length) {
      return this._iceGatherers.shift();
    }
    var iceGatherer = new window.RTCIceGatherer({
      iceServers: this._config.iceServers,
      gatherPolicy: this._config.iceTransportPolicy
    });
    Object.defineProperty(iceGatherer, 'state',
        {value: 'new', writable: true}
    );

    this.transceivers[sdpMLineIndex].candidates = [];
    this.transceivers[sdpMLineIndex].bufferCandidates = function(event) {
      var end = !event.candidate || Object.keys(event.candidate).length === 0;
      // polyfill since RTCIceGatherer.state is not implemented in
      // Edge 10547 yet.
      iceGatherer.state = end ? 'completed' : 'gathering';
      if (pc.transceivers[sdpMLineIndex].candidates !== null) {
        pc.transceivers[sdpMLineIndex].candidates.push(event.candidate);
      }
    };
    iceGatherer.addEventListener('localcandidate',
      this.transceivers[sdpMLineIndex].bufferCandidates);
    return iceGatherer;
  };

  // start gathering from an RTCIceGatherer.
  RTCPeerConnection.prototype._gather = function(mid, sdpMLineIndex) {
    var pc = this;
    var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
    if (iceGatherer.onlocalcandidate) {
      return;
    }
    var candidates = this.transceivers[sdpMLineIndex].candidates;
    this.transceivers[sdpMLineIndex].candidates = null;
    iceGatherer.removeEventListener('localcandidate',
      this.transceivers[sdpMLineIndex].bufferCandidates);
    iceGatherer.onlocalcandidate = function(evt) {
      if (pc.usingBundle && sdpMLineIndex > 0) {
        // if we know that we use bundle we can drop candidates with
        // ѕdpMLineIndex > 0. If we don't do this then our state gets
        // confused since we dispose the extra ice gatherer.
        return;
      }
      var event = new Event('icecandidate');
      event.candidate = {sdpMid: mid, sdpMLineIndex: sdpMLineIndex};

      var cand = evt.candidate;
      // Edge emits an empty object for RTCIceCandidateComplete‥
      var end = !cand || Object.keys(cand).length === 0;
      if (end) {
        // polyfill since RTCIceGatherer.state is not implemented in
        // Edge 10547 yet.
        if (iceGatherer.state === 'new' || iceGatherer.state === 'gathering') {
          iceGatherer.state = 'completed';
        }
      } else {
        if (iceGatherer.state === 'new') {
          iceGatherer.state = 'gathering';
        }
        // RTCIceCandidate doesn't have a component, needs to be added
        cand.component = 1;
        event.candidate.candidate = SDPUtils.writeCandidate(cand);
      }

      // update local description.
      var sections = SDPUtils.splitSections(pc.localDescription.sdp);
      if (!end) {
        sections[event.candidate.sdpMLineIndex + 1] +=
            'a=' + event.candidate.candidate + '\r\n';
      } else {
        sections[event.candidate.sdpMLineIndex + 1] +=
            'a=end-of-candidates\r\n';
      }
      pc.localDescription.sdp = sections.join('');
      var complete = pc.transceivers.every(function(transceiver) {
        return transceiver.iceGatherer &&
            transceiver.iceGatherer.state === 'completed';
      });

      if (pc.iceGatheringState !== 'gathering') {
        pc.iceGatheringState = 'gathering';
        pc._emitGatheringStateChange();
      }

      // Emit candidate. Also emit null candidate when all gatherers are
      // complete.
      if (!end) {
        pc._dispatchEvent('icecandidate', event);
      }
      if (complete) {
        pc._dispatchEvent('icecandidate', new Event('icecandidate'));
        pc.iceGatheringState = 'complete';
        pc._emitGatheringStateChange();
      }
    };

    // emit already gathered candidates.
    window.setTimeout(function() {
      candidates.forEach(function(candidate) {
        var e = new Event('RTCIceGatherEvent');
        e.candidate = candidate;
        iceGatherer.onlocalcandidate(e);
      });
    }, 0);
  };

  // Create ICE transport and DTLS transport.
  RTCPeerConnection.prototype._createIceAndDtlsTransports = function() {
    var pc = this;
    var iceTransport = new window.RTCIceTransport(null);
    iceTransport.onicestatechange = function() {
      pc._updateConnectionState();
    };

    var dtlsTransport = new window.RTCDtlsTransport(iceTransport);
    dtlsTransport.ondtlsstatechange = function() {
      pc._updateConnectionState();
    };
    dtlsTransport.onerror = function() {
      // onerror does not set state to failed by itpc.
      Object.defineProperty(dtlsTransport, 'state',
          {value: 'failed', writable: true});
      pc._updateConnectionState();
    };

    return {
      iceTransport: iceTransport,
      dtlsTransport: dtlsTransport
    };
  };

  // Destroy ICE gatherer, ICE transport and DTLS transport.
  // Without triggering the callbacks.
  RTCPeerConnection.prototype._disposeIceAndDtlsTransports = function(
      sdpMLineIndex) {
    var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
    if (iceGatherer) {
      delete iceGatherer.onlocalcandidate;
      delete this.transceivers[sdpMLineIndex].iceGatherer;
    }
    var iceTransport = this.transceivers[sdpMLineIndex].iceTransport;
    if (iceTransport) {
      delete iceTransport.onicestatechange;
      delete this.transceivers[sdpMLineIndex].iceTransport;
    }
    var dtlsTransport = this.transceivers[sdpMLineIndex].dtlsTransport;
    if (dtlsTransport) {
      delete dtlsTransport.ondtlsstatechange;
      delete dtlsTransport.onerror;
      delete this.transceivers[sdpMLineIndex].dtlsTransport;
    }
  };

  // Start the RTP Sender and Receiver for a transceiver.
  RTCPeerConnection.prototype._transceive = function(transceiver,
      send, recv) {
    var params = getCommonCapabilities(transceiver.localCapabilities,
        transceiver.remoteCapabilities);
    if (send && transceiver.rtpSender) {
      params.encodings = transceiver.sendEncodingParameters;
      params.rtcp = {
        cname: SDPUtils.localCName,
        compound: transceiver.rtcpParameters.compound
      };
      if (transceiver.recvEncodingParameters.length) {
        params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
      }
      transceiver.rtpSender.send(params);
    }
    if (recv && transceiver.rtpReceiver && params.codecs.length > 0) {
      // remove RTX field in Edge 14942
      if (transceiver.kind === 'video'
          && transceiver.recvEncodingParameters
          && edgeVersion < 15019) {
        transceiver.recvEncodingParameters.forEach(function(p) {
          delete p.rtx;
        });
      }
      if (transceiver.recvEncodingParameters.length) {
        params.encodings = transceiver.recvEncodingParameters;
      }
      params.rtcp = {
        compound: transceiver.rtcpParameters.compound
      };
      if (transceiver.rtcpParameters.cname) {
        params.rtcp.cname = transceiver.rtcpParameters.cname;
      }
      if (transceiver.sendEncodingParameters.length) {
        params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
      }
      transceiver.rtpReceiver.receive(params);
    }
  };

  RTCPeerConnection.prototype.setLocalDescription = function(description) {
    var pc = this;

    if (!isActionAllowedInSignalingState('setLocalDescription',
        description.type, this.signalingState) || this._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not set local ' + description.type +
          ' in state ' + pc.signalingState));
    }

    var sections;
    var sessionpart;
    if (description.type === 'offer') {
      // VERY limited support for SDP munging. Limited to:
      // * changing the order of codecs
      sections = SDPUtils.splitSections(description.sdp);
      sessionpart = sections.shift();
      sections.forEach(function(mediaSection, sdpMLineIndex) {
        var caps = SDPUtils.parseRtpParameters(mediaSection);
        pc.transceivers[sdpMLineIndex].localCapabilities = caps;
      });

      this.transceivers.forEach(function(transceiver, sdpMLineIndex) {
        pc._gather(transceiver.mid, sdpMLineIndex);
      });
    } else if (description.type === 'answer') {
      sections = SDPUtils.splitSections(pc.remoteDescription.sdp);
      sessionpart = sections.shift();
      var isIceLite = SDPUtils.matchPrefix(sessionpart,
          'a=ice-lite').length > 0;
      sections.forEach(function(mediaSection, sdpMLineIndex) {
        var transceiver = pc.transceivers[sdpMLineIndex];
        var iceGatherer = transceiver.iceGatherer;
        var iceTransport = transceiver.iceTransport;
        var dtlsTransport = transceiver.dtlsTransport;
        var localCapabilities = transceiver.localCapabilities;
        var remoteCapabilities = transceiver.remoteCapabilities;

        // treat bundle-only as not-rejected.
        var rejected = SDPUtils.isRejected(mediaSection) &&
            SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;

        if (!rejected && !transceiver.isDatachannel) {
          var remoteIceParameters = SDPUtils.getIceParameters(
              mediaSection, sessionpart);
          var remoteDtlsParameters = SDPUtils.getDtlsParameters(
              mediaSection, sessionpart);
          if (isIceLite) {
            remoteDtlsParameters.role = 'server';
          }

          if (!pc.usingBundle || sdpMLineIndex === 0) {
            pc._gather(transceiver.mid, sdpMLineIndex);
            if (iceTransport.state === 'new') {
              iceTransport.start(iceGatherer, remoteIceParameters,
                  isIceLite ? 'controlling' : 'controlled');
            }
            if (dtlsTransport.state === 'new') {
              dtlsTransport.start(remoteDtlsParameters);
            }
          }

          // Calculate intersection of capabilities.
          var params = getCommonCapabilities(localCapabilities,
              remoteCapabilities);

          // Start the RTCRtpSender. The RTCRtpReceiver for this
          // transceiver has already been started in setRemoteDescription.
          pc._transceive(transceiver,
              params.codecs.length > 0,
              false);
        }
      });
    }

    this.localDescription = {
      type: description.type,
      sdp: description.sdp
    };
    switch (description.type) {
      case 'offer':
        this._updateSignalingState('have-local-offer');
        break;
      case 'answer':
        this._updateSignalingState('stable');
        break;
      default:
        throw new TypeError('unsupported type "' + description.type +
            '"');
    }

    return Promise.resolve();
  };

  RTCPeerConnection.prototype.setRemoteDescription = function(description) {
    var pc = this;

    if (!isActionAllowedInSignalingState('setRemoteDescription',
        description.type, this.signalingState) || this._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not set remote ' + description.type +
          ' in state ' + pc.signalingState));
    }

    var streams = {};
    this.remoteStreams.forEach(function(stream) {
      streams[stream.id] = stream;
    });
    var receiverList = [];
    var sections = SDPUtils.splitSections(description.sdp);
    var sessionpart = sections.shift();
    var isIceLite = SDPUtils.matchPrefix(sessionpart,
        'a=ice-lite').length > 0;
    var usingBundle = SDPUtils.matchPrefix(sessionpart,
        'a=group:BUNDLE ').length > 0;
    this.usingBundle = usingBundle;
    var iceOptions = SDPUtils.matchPrefix(sessionpart,
        'a=ice-options:')[0];
    if (iceOptions) {
      this.canTrickleIceCandidates = iceOptions.substr(14).split(' ')
          .indexOf('trickle') >= 0;
    } else {
      this.canTrickleIceCandidates = false;
    }

    sections.forEach(function(mediaSection, sdpMLineIndex) {
      var lines = SDPUtils.splitLines(mediaSection);
      var kind = SDPUtils.getKind(mediaSection);
      // treat bundle-only as not-rejected.
      var rejected = SDPUtils.isRejected(mediaSection) &&
          SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;
      var protocol = lines[0].substr(2).split(' ')[2];

      var direction = SDPUtils.getDirection(mediaSection, sessionpart);
      var remoteMsid = SDPUtils.parseMsid(mediaSection);

      var mid = SDPUtils.getMid(mediaSection) || SDPUtils.generateIdentifier();

      // Reject datachannels which are not implemented yet.
      if (kind === 'application' && protocol === 'DTLS/SCTP') {
        pc.transceivers[sdpMLineIndex] = {
          mid: mid,
          isDatachannel: true
        };
        return;
      }

      var transceiver;
      var iceGatherer;
      var iceTransport;
      var dtlsTransport;
      var rtpReceiver;
      var sendEncodingParameters;
      var recvEncodingParameters;
      var localCapabilities;

      var track;
      // FIXME: ensure the mediaSection has rtcp-mux set.
      var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
      var remoteIceParameters;
      var remoteDtlsParameters;
      if (!rejected) {
        remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
            sessionpart);
        remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
            sessionpart);
        remoteDtlsParameters.role = 'client';
      }
      recvEncodingParameters =
          SDPUtils.parseRtpEncodingParameters(mediaSection);

      var rtcpParameters = SDPUtils.parseRtcpParameters(mediaSection);

      var isComplete = SDPUtils.matchPrefix(mediaSection,
          'a=end-of-candidates', sessionpart).length > 0;
      var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
          .map(function(cand) {
            return SDPUtils.parseCandidate(cand);
          })
          .filter(function(cand) {
            return cand.component === 1;
          });

      // Check if we can use BUNDLE and dispose transports.
      if ((description.type === 'offer' || description.type === 'answer') &&
          !rejected && usingBundle && sdpMLineIndex > 0 &&
          pc.transceivers[sdpMLineIndex]) {
        pc._disposeIceAndDtlsTransports(sdpMLineIndex);
        pc.transceivers[sdpMLineIndex].iceGatherer =
            pc.transceivers[0].iceGatherer;
        pc.transceivers[sdpMLineIndex].iceTransport =
            pc.transceivers[0].iceTransport;
        pc.transceivers[sdpMLineIndex].dtlsTransport =
            pc.transceivers[0].dtlsTransport;
        if (pc.transceivers[sdpMLineIndex].rtpSender) {
          pc.transceivers[sdpMLineIndex].rtpSender.setTransport(
              pc.transceivers[0].dtlsTransport);
        }
        if (pc.transceivers[sdpMLineIndex].rtpReceiver) {
          pc.transceivers[sdpMLineIndex].rtpReceiver.setTransport(
              pc.transceivers[0].dtlsTransport);
        }
      }
      if (description.type === 'offer' && !rejected) {
        transceiver = pc.transceivers[sdpMLineIndex] ||
            pc._createTransceiver(kind);
        transceiver.mid = mid;

        if (!transceiver.iceGatherer) {
          transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex,
              usingBundle);
        }

        if (cands.length && transceiver.iceTransport.state === 'new') {
          if (isComplete && (!usingBundle || sdpMLineIndex === 0)) {
            transceiver.iceTransport.setRemoteCandidates(cands);
          } else {
            cands.forEach(function(candidate) {
              maybeAddCandidate(transceiver.iceTransport, candidate);
            });
          }
        }

        localCapabilities = window.RTCRtpReceiver.getCapabilities(kind);

        // filter RTX until additional stuff needed for RTX is implemented
        // in adapter.js
        if (edgeVersion < 15019) {
          localCapabilities.codecs = localCapabilities.codecs.filter(
              function(codec) {
                return codec.name !== 'rtx';
              });
        }

        sendEncodingParameters = transceiver.sendEncodingParameters || [{
          ssrc: (2 * sdpMLineIndex + 2) * 1001
        }];

        // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
        var isNewTrack = false;
        if (direction === 'sendrecv' || direction === 'sendonly') {
          isNewTrack = !transceiver.rtpReceiver;
          rtpReceiver = transceiver.rtpReceiver ||
              new window.RTCRtpReceiver(transceiver.dtlsTransport, kind);

          if (isNewTrack) {
            var stream;
            track = rtpReceiver.track;
            // FIXME: does not work with Plan B.
            if (remoteMsid && remoteMsid.stream === '-') {
              // no-op. a stream id of '-' means: no associated stream.
            } else if (remoteMsid) {
              if (!streams[remoteMsid.stream]) {
                streams[remoteMsid.stream] = new window.MediaStream();
                Object.defineProperty(streams[remoteMsid.stream], 'id', {
                  get: function() {
                    return remoteMsid.stream;
                  }
                });
              }
              Object.defineProperty(track, 'id', {
                get: function() {
                  return remoteMsid.track;
                }
              });
              stream = streams[remoteMsid.stream];
            } else {
              if (!streams.default) {
                streams.default = new window.MediaStream();
              }
              stream = streams.default;
            }
            if (stream) {
              addTrackToStreamAndFireEvent(track, stream);
              transceiver.associatedRemoteMediaStreams.push(stream);
            }
            receiverList.push([track, rtpReceiver, stream]);
          }
        } else if (transceiver.rtpReceiver && transceiver.rtpReceiver.track) {
          transceiver.associatedRemoteMediaStreams.forEach(function(s) {
            var nativeTrack = s.getTracks().find(function(t) {
              return t.id === transceiver.rtpReceiver.track.id;
            });
            if (nativeTrack) {
              removeTrackFromStreamAndFireEvent(nativeTrack, s);
            }
          });
          transceiver.associatedRemoteMediaStreams = [];
        }

        transceiver.localCapabilities = localCapabilities;
        transceiver.remoteCapabilities = remoteCapabilities;
        transceiver.rtpReceiver = rtpReceiver;
        transceiver.rtcpParameters = rtcpParameters;
        transceiver.sendEncodingParameters = sendEncodingParameters;
        transceiver.recvEncodingParameters = recvEncodingParameters;

        // Start the RTCRtpReceiver now. The RTPSender is started in
        // setLocalDescription.
        pc._transceive(pc.transceivers[sdpMLineIndex],
            false,
            isNewTrack);
      } else if (description.type === 'answer' && !rejected) {
        transceiver = pc.transceivers[sdpMLineIndex];
        iceGatherer = transceiver.iceGatherer;
        iceTransport = transceiver.iceTransport;
        dtlsTransport = transceiver.dtlsTransport;
        rtpReceiver = transceiver.rtpReceiver;
        sendEncodingParameters = transceiver.sendEncodingParameters;
        localCapabilities = transceiver.localCapabilities;

        pc.transceivers[sdpMLineIndex].recvEncodingParameters =
            recvEncodingParameters;
        pc.transceivers[sdpMLineIndex].remoteCapabilities =
            remoteCapabilities;
        pc.transceivers[sdpMLineIndex].rtcpParameters = rtcpParameters;

        if (cands.length && iceTransport.state === 'new') {
          if ((isIceLite || isComplete) &&
              (!usingBundle || sdpMLineIndex === 0)) {
            iceTransport.setRemoteCandidates(cands);
          } else {
            cands.forEach(function(candidate) {
              maybeAddCandidate(transceiver.iceTransport, candidate);
            });
          }
        }

        if (!usingBundle || sdpMLineIndex === 0) {
          if (iceTransport.state === 'new') {
            iceTransport.start(iceGatherer, remoteIceParameters,
                'controlling');
          }
          if (dtlsTransport.state === 'new') {
            dtlsTransport.start(remoteDtlsParameters);
          }
        }

        pc._transceive(transceiver,
            direction === 'sendrecv' || direction === 'recvonly',
            direction === 'sendrecv' || direction === 'sendonly');

        // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
        if (rtpReceiver &&
            (direction === 'sendrecv' || direction === 'sendonly')) {
          track = rtpReceiver.track;
          if (remoteMsid) {
            if (!streams[remoteMsid.stream]) {
              streams[remoteMsid.stream] = new window.MediaStream();
            }
            addTrackToStreamAndFireEvent(track, streams[remoteMsid.stream]);
            receiverList.push([track, rtpReceiver, streams[remoteMsid.stream]]);
          } else {
            if (!streams.default) {
              streams.default = new window.MediaStream();
            }
            addTrackToStreamAndFireEvent(track, streams.default);
            receiverList.push([track, rtpReceiver, streams.default]);
          }
        } else {
          // FIXME: actually the receiver should be created later.
          delete transceiver.rtpReceiver;
        }
      }
    });

    if (this._dtlsRole === undefined) {
      this._dtlsRole = description.type === 'offer' ? 'active' : 'passive';
    }

    this.remoteDescription = {
      type: description.type,
      sdp: description.sdp
    };
    switch (description.type) {
      case 'offer':
        this._updateSignalingState('have-remote-offer');
        break;
      case 'answer':
        this._updateSignalingState('stable');
        break;
      default:
        throw new TypeError('unsupported type "' + description.type +
            '"');
    }
    Object.keys(streams).forEach(function(sid) {
      var stream = streams[sid];
      if (stream.getTracks().length) {
        if (pc.remoteStreams.indexOf(stream) === -1) {
          pc.remoteStreams.push(stream);
          var event = new Event('addstream');
          event.stream = stream;
          window.setTimeout(function() {
            pc._dispatchEvent('addstream', event);
          });
        }

        receiverList.forEach(function(item) {
          var track = item[0];
          var receiver = item[1];
          if (stream.id !== item[2].id) {
            return;
          }
          fireAddTrack(pc, track, receiver, [stream]);
        });
      }
    });
    receiverList.forEach(function(item) {
      if (item[2]) {
        return;
      }
      fireAddTrack(pc, item[0], item[1], []);
    });

    // check whether addIceCandidate({}) was called within four seconds after
    // setRemoteDescription.
    window.setTimeout(function() {
      if (!(pc && pc.transceivers)) {
        return;
      }
      pc.transceivers.forEach(function(transceiver) {
        if (transceiver.iceTransport &&
            transceiver.iceTransport.state === 'new' &&
            transceiver.iceTransport.getRemoteCandidates().length > 0) {
          console.warn('Timeout for addRemoteCandidate. Consider sending ' +
              'an end-of-candidates notification');
          transceiver.iceTransport.addRemoteCandidate({});
        }
      });
    }, 4000);

    return Promise.resolve();
  };

  RTCPeerConnection.prototype.close = function() {
    this.transceivers.forEach(function(transceiver) {
      /* not yet
      if (transceiver.iceGatherer) {
        transceiver.iceGatherer.close();
      }
      */
      if (transceiver.iceTransport) {
        transceiver.iceTransport.stop();
      }
      if (transceiver.dtlsTransport) {
        transceiver.dtlsTransport.stop();
      }
      if (transceiver.rtpSender) {
        transceiver.rtpSender.stop();
      }
      if (transceiver.rtpReceiver) {
        transceiver.rtpReceiver.stop();
      }
    });
    // FIXME: clean up tracks, local streams, remote streams, etc
    this._isClosed = true;
    this._updateSignalingState('closed');
  };

  // Update the signaling state.
  RTCPeerConnection.prototype._updateSignalingState = function(newState) {
    this.signalingState = newState;
    var event = new Event('signalingstatechange');
    this._dispatchEvent('signalingstatechange', event);
  };

  // Determine whether to fire the negotiationneeded event.
  RTCPeerConnection.prototype._maybeFireNegotiationNeeded = function() {
    var pc = this;
    if (this.signalingState !== 'stable' || this.needNegotiation === true) {
      return;
    }
    this.needNegotiation = true;
    window.setTimeout(function() {
      if (pc.needNegotiation === false) {
        return;
      }
      pc.needNegotiation = false;
      var event = new Event('negotiationneeded');
      pc._dispatchEvent('negotiationneeded', event);
    }, 0);
  };

  // Update the connection state.
  RTCPeerConnection.prototype._updateConnectionState = function() {
    var newState;
    var states = {
      'new': 0,
      closed: 0,
      connecting: 0,
      checking: 0,
      connected: 0,
      completed: 0,
      disconnected: 0,
      failed: 0
    };
    this.transceivers.forEach(function(transceiver) {
      states[transceiver.iceTransport.state]++;
      states[transceiver.dtlsTransport.state]++;
    });
    // ICETransport.completed and connected are the same for this purpose.
    states.connected += states.completed;

    newState = 'new';
    if (states.failed > 0) {
      newState = 'failed';
    } else if (states.connecting > 0 || states.checking > 0) {
      newState = 'connecting';
    } else if (states.disconnected > 0) {
      newState = 'disconnected';
    } else if (states.new > 0) {
      newState = 'new';
    } else if (states.connected > 0 || states.completed > 0) {
      newState = 'connected';
    }

    if (newState !== this.iceConnectionState) {
      this.iceConnectionState = newState;
      var event = new Event('iceconnectionstatechange');
      this._dispatchEvent('iceconnectionstatechange', event);
    }
  };

  RTCPeerConnection.prototype.createOffer = function() {
    var pc = this;

    if (this._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not call createOffer after close'));
    }

    var numAudioTracks = this.transceivers.filter(function(t) {
      return t.kind === 'audio';
    }).length;
    var numVideoTracks = this.transceivers.filter(function(t) {
      return t.kind === 'video';
    }).length;

    // Determine number of audio and video tracks we need to send/recv.
    var offerOptions = arguments[0];
    if (offerOptions) {
      // Reject Chrome legacy constraints.
      if (offerOptions.mandatory || offerOptions.optional) {
        throw new TypeError(
            'Legacy mandatory/optional constraints not supported.');
      }
      if (offerOptions.offerToReceiveAudio !== undefined) {
        if (offerOptions.offerToReceiveAudio === true) {
          numAudioTracks = 1;
        } else if (offerOptions.offerToReceiveAudio === false) {
          numAudioTracks = 0;
        } else {
          numAudioTracks = offerOptions.offerToReceiveAudio;
        }
      }
      if (offerOptions.offerToReceiveVideo !== undefined) {
        if (offerOptions.offerToReceiveVideo === true) {
          numVideoTracks = 1;
        } else if (offerOptions.offerToReceiveVideo === false) {
          numVideoTracks = 0;
        } else {
          numVideoTracks = offerOptions.offerToReceiveVideo;
        }
      }
    }

    this.transceivers.forEach(function(transceiver) {
      if (transceiver.kind === 'audio') {
        numAudioTracks--;
        if (numAudioTracks < 0) {
          transceiver.wantReceive = false;
        }
      } else if (transceiver.kind === 'video') {
        numVideoTracks--;
        if (numVideoTracks < 0) {
          transceiver.wantReceive = false;
        }
      }
    });

    // Create M-lines for recvonly streams.
    while (numAudioTracks > 0 || numVideoTracks > 0) {
      if (numAudioTracks > 0) {
        this._createTransceiver('audio');
        numAudioTracks--;
      }
      if (numVideoTracks > 0) {
        this._createTransceiver('video');
        numVideoTracks--;
      }
    }

    var sdp = SDPUtils.writeSessionBoilerplate(this._sdpSessionId,
        this._sdpSessionVersion++);
    this.transceivers.forEach(function(transceiver, sdpMLineIndex) {
      // For each track, create an ice gatherer, ice transport,
      // dtls transport, potentially rtpsender and rtpreceiver.
      var track = transceiver.track;
      var kind = transceiver.kind;
      var mid = SDPUtils.generateIdentifier();
      transceiver.mid = mid;

      if (!transceiver.iceGatherer) {
        transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex,
            pc.usingBundle);
      }

      var localCapabilities = window.RTCRtpSender.getCapabilities(kind);
      // filter RTX until additional stuff needed for RTX is implemented
      // in adapter.js
      if (edgeVersion < 15019) {
        localCapabilities.codecs = localCapabilities.codecs.filter(
            function(codec) {
              return codec.name !== 'rtx';
            });
      }
      localCapabilities.codecs.forEach(function(codec) {
        // work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
        // by adding level-asymmetry-allowed=1
        if (codec.name === 'H264' &&
            codec.parameters['level-asymmetry-allowed'] === undefined) {
          codec.parameters['level-asymmetry-allowed'] = '1';
        }
      });

      // generate an ssrc now, to be used later in rtpSender.send
      var sendEncodingParameters = transceiver.sendEncodingParameters || [{
        ssrc: (2 * sdpMLineIndex + 1) * 1001
      }];
      if (track) {
        // add RTX
        if (edgeVersion >= 15019 && kind === 'video' &&
            !sendEncodingParameters[0].rtx) {
          sendEncodingParameters[0].rtx = {
            ssrc: sendEncodingParameters[0].ssrc + 1
          };
        }
      }

      if (transceiver.wantReceive) {
        transceiver.rtpReceiver = new window.RTCRtpReceiver(
            transceiver.dtlsTransport, kind);
      }

      transceiver.localCapabilities = localCapabilities;
      transceiver.sendEncodingParameters = sendEncodingParameters;
    });

    // always offer BUNDLE and dispose on return if not supported.
    if (this._config.bundlePolicy !== 'max-compat') {
      sdp += 'a=group:BUNDLE ' + this.transceivers.map(function(t) {
        return t.mid;
      }).join(' ') + '\r\n';
    }
    sdp += 'a=ice-options:trickle\r\n';

    this.transceivers.forEach(function(transceiver, sdpMLineIndex) {
      sdp += writeMediaSection(transceiver, transceiver.localCapabilities,
          'offer', transceiver.stream, pc._dtlsRole);
      sdp += 'a=rtcp-rsize\r\n';

      if (transceiver.iceGatherer && pc.iceGatheringState !== 'new' &&
          (sdpMLineIndex === 0 || !pc.usingBundle)) {
        transceiver.iceGatherer.getLocalCandidates().forEach(function(cand) {
          cand.component = 1;
          sdp += 'a=' + SDPUtils.writeCandidate(cand) + '\r\n';
        });

        if (transceiver.iceGatherer.state === 'completed') {
          sdp += 'a=end-of-candidates\r\n';
        }
      }
    });

    var desc = new window.RTCSessionDescription({
      type: 'offer',
      sdp: sdp
    });
    return Promise.resolve(desc);
  };

  RTCPeerConnection.prototype.createAnswer = function() {
    var pc = this;

    if (this._isClosed) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not call createAnswer after close'));
    }

    var sdp = SDPUtils.writeSessionBoilerplate(this._sdpSessionId,
        this._sdpSessionVersion++);
    if (this.usingBundle) {
      sdp += 'a=group:BUNDLE ' + this.transceivers.map(function(t) {
        return t.mid;
      }).join(' ') + '\r\n';
    }
    var mediaSectionsInOffer = SDPUtils.splitSections(
        this.remoteDescription.sdp).length - 1;
    this.transceivers.forEach(function(transceiver, sdpMLineIndex) {
      if (sdpMLineIndex + 1 > mediaSectionsInOffer) {
        return;
      }
      if (transceiver.isDatachannel) {
        sdp += 'm=application 0 DTLS/SCTP 5000\r\n' +
            'c=IN IP4 0.0.0.0\r\n' +
            'a=mid:' + transceiver.mid + '\r\n';
        return;
      }

      // FIXME: look at direction.
      if (transceiver.stream) {
        var localTrack;
        if (transceiver.kind === 'audio') {
          localTrack = transceiver.stream.getAudioTracks()[0];
        } else if (transceiver.kind === 'video') {
          localTrack = transceiver.stream.getVideoTracks()[0];
        }
        if (localTrack) {
          // add RTX
          if (edgeVersion >= 15019 && transceiver.kind === 'video' &&
              !transceiver.sendEncodingParameters[0].rtx) {
            transceiver.sendEncodingParameters[0].rtx = {
              ssrc: transceiver.sendEncodingParameters[0].ssrc + 1
            };
          }
        }
      }

      // Calculate intersection of capabilities.
      var commonCapabilities = getCommonCapabilities(
          transceiver.localCapabilities,
          transceiver.remoteCapabilities);

      var hasRtx = commonCapabilities.codecs.filter(function(c) {
        return c.name.toLowerCase() === 'rtx';
      }).length;
      if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
        delete transceiver.sendEncodingParameters[0].rtx;
      }

      sdp += writeMediaSection(transceiver, commonCapabilities,
          'answer', transceiver.stream, pc._dtlsRole);
      if (transceiver.rtcpParameters &&
          transceiver.rtcpParameters.reducedSize) {
        sdp += 'a=rtcp-rsize\r\n';
      }
    });

    var desc = new window.RTCSessionDescription({
      type: 'answer',
      sdp: sdp
    });
    return Promise.resolve(desc);
  };

  RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
    var sections;
    if (!candidate || candidate.candidate === '') {
      for (var j = 0; j < this.transceivers.length; j++) {
        if (this.transceivers[j].isDatachannel) {
          continue;
        }
        this.transceivers[j].iceTransport.addRemoteCandidate({});
        sections = SDPUtils.splitSections(this.remoteDescription.sdp);
        sections[j + 1] += 'a=end-of-candidates\r\n';
        this.remoteDescription.sdp = sections.join('');
        if (this.usingBundle) {
          break;
        }
      }
    } else if (!(candidate.sdpMLineIndex !== undefined || candidate.sdpMid)) {
      throw new TypeError('sdpMLineIndex or sdpMid required');
    } else if (!this.remoteDescription) {
      return Promise.reject(makeError('InvalidStateError',
          'Can not add ICE candidate without a remote description'));
    } else {
      var sdpMLineIndex = candidate.sdpMLineIndex;
      if (candidate.sdpMid) {
        for (var i = 0; i < this.transceivers.length; i++) {
          if (this.transceivers[i].mid === candidate.sdpMid) {
            sdpMLineIndex = i;
            break;
          }
        }
      }
      var transceiver = this.transceivers[sdpMLineIndex];
      if (transceiver) {
        if (transceiver.isDatachannel) {
          return Promise.resolve();
        }
        var cand = Object.keys(candidate.candidate).length > 0 ?
            SDPUtils.parseCandidate(candidate.candidate) : {};
        // Ignore Chrome's invalid candidates since Edge does not like them.
        if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
          return Promise.resolve();
        }
        // Ignore RTCP candidates, we assume RTCP-MUX.
        if (cand.component && cand.component !== 1) {
          return Promise.resolve();
        }
        // when using bundle, avoid adding candidates to the wrong
        // ice transport. And avoid adding candidates added in the SDP.
        if (sdpMLineIndex === 0 || (sdpMLineIndex > 0 &&
            transceiver.iceTransport !== this.transceivers[0].iceTransport)) {
          if (!maybeAddCandidate(transceiver.iceTransport, cand)) {
            return Promise.reject(makeError('OperationError',
                'Can not add ICE candidate'));
          }
        }

        // update the remoteDescription.
        var candidateString = candidate.candidate.trim();
        if (candidateString.indexOf('a=') === 0) {
          candidateString = candidateString.substr(2);
        }
        sections = SDPUtils.splitSections(this.remoteDescription.sdp);
        sections[sdpMLineIndex + 1] += 'a=' +
            (cand.type ? candidateString : 'end-of-candidates')
            + '\r\n';
        this.remoteDescription.sdp = sections.join('');
      } else {
        return Promise.reject(makeError('OperationError',
            'Can not add ICE candidate'));
      }
    }
    return Promise.resolve();
  };

  RTCPeerConnection.prototype.getStats = function() {
    var promises = [];
    this.transceivers.forEach(function(transceiver) {
      ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
          'dtlsTransport'].forEach(function(method) {
            if (transceiver[method]) {
              promises.push(transceiver[method].getStats());
            }
          });
    });
    var fixStatsType = function(stat) {
      return {
        inboundrtp: 'inbound-rtp',
        outboundrtp: 'outbound-rtp',
        candidatepair: 'candidate-pair',
        localcandidate: 'local-candidate',
        remotecandidate: 'remote-candidate'
      }[stat.type] || stat.type;
    };
    return new Promise(function(resolve) {
      // shim getStats with maplike support
      var results = new Map();
      Promise.all(promises).then(function(res) {
        res.forEach(function(result) {
          Object.keys(result).forEach(function(id) {
            result[id].type = fixStatsType(result[id]);
            results.set(id, result[id]);
          });
        });
        resolve(results);
      });
    });
  };

  // legacy callback shims. Should be moved to adapter.js some days.
  var methods = ['createOffer', 'createAnswer'];
  methods.forEach(function(method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function() {
      var args = arguments;
      if (typeof args[0] === 'function' ||
          typeof args[1] === 'function') { // legacy
        return nativeMethod.apply(this, [arguments[2]])
        .then(function(description) {
          if (typeof args[0] === 'function') {
            args[0].apply(null, [description]);
          }
        }, function(error) {
          if (typeof args[1] === 'function') {
            args[1].apply(null, [error]);
          }
        });
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  methods = ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate'];
  methods.forEach(function(method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function() {
      var args = arguments;
      if (typeof args[1] === 'function' ||
          typeof args[2] === 'function') { // legacy
        return nativeMethod.apply(this, arguments)
        .then(function() {
          if (typeof args[1] === 'function') {
            args[1].apply(null);
          }
        }, function(error) {
          if (typeof args[2] === 'function') {
            args[2].apply(null, [error]);
          }
        });
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  // getStats is special. It doesn't have a spec legacy method yet we support
  // getStats(something, cb) without error callbacks.
  ['getStats'].forEach(function(method) {
    var nativeMethod = RTCPeerConnection.prototype[method];
    RTCPeerConnection.prototype[method] = function() {
      var args = arguments;
      if (typeof args[1] === 'function') {
        return nativeMethod.apply(this, arguments)
        .then(function() {
          if (typeof args[1] === 'function') {
            args[1].apply(null);
          }
        });
      }
      return nativeMethod.apply(this, arguments);
    };
  });

  return RTCPeerConnection;
};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */


// Expose public methods.
module.exports = function(window) {
  var navigator = window && window.navigator;

  var shimError_ = function(e) {
    return {
      name: {PermissionDeniedError: 'NotAllowedError'}[e.name] || e.name,
      message: e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name;
      }
    };
  };

  // getUserMedia error shim.
  var origGetUserMedia = navigator.mediaDevices.getUserMedia.
      bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = function(c) {
    return origGetUserMedia(c).catch(function(e) {
      return Promise.reject(shimError_(e));
    });
  };
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */


var utils = __webpack_require__(0);

module.exports = {
  shimGetUserMedia: __webpack_require__(16),
  shimOnTrack: function(window) {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            e.stream.getTracks().forEach(function(track) {
              var event = new Event('track');
              event.track = track;
              event.receiver = {track: track};
              event.transceiver = {receiver: event.receiver};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        }
      });
    }
    if (typeof window === 'object' && window.RTCTrackEvent &&
        ('receiver' in window.RTCTrackEvent.prototype) &&
        !('transceiver' in window.RTCTrackEvent.prototype)) {
      Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
        get: function() {
          return {receiver: this.receiver};
        }
      });
    }
  },

  shimSourceObject: function(window) {
    // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this.mozSrcObject;
          },
          set: function(stream) {
            this.mozSrcObject = stream;
          }
        });
      }
    }
  },

  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    if (typeof window !== 'object' || !(window.RTCPeerConnection ||
        window.mozRTCPeerConnection)) {
      return; // probably media.peerconnection.enabled=false in about:config
    }
    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (browserDetails.version < 38) {
          // .urls is not supported in FF < 38.
          // create RTCIceServers with a single url.
          if (pcConfig && pcConfig.iceServers) {
            var newIceServers = [];
            for (var i = 0; i < pcConfig.iceServers.length; i++) {
              var server = pcConfig.iceServers[i];
              if (server.hasOwnProperty('urls')) {
                for (var j = 0; j < server.urls.length; j++) {
                  var newServer = {
                    url: server.urls[j]
                  };
                  if (server.urls[j].indexOf('turn') === 0) {
                    newServer.username = server.username;
                    newServer.credential = server.credential;
                  }
                  newIceServers.push(newServer);
                }
              } else {
                newIceServers.push(pcConfig.iceServers[i]);
              }
            }
            pcConfig.iceServers = newIceServers;
          }
        }
        return new window.mozRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype =
          window.mozRTCPeerConnection.prototype;

      // wrap static methods. Currently just generateCertificate.
      if (window.mozRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return window.mozRTCPeerConnection.generateCertificate;
          }
        });
      }

      window.RTCSessionDescription = window.mozRTCSessionDescription;
      window.RTCIceCandidate = window.mozRTCIceCandidate;
    }

    // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = window.RTCPeerConnection.prototype[method];
          window.RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null or undefined)
    var nativeAddIceCandidate =
        window.RTCPeerConnection.prototype.addIceCandidate;
    window.RTCPeerConnection.prototype.addIceCandidate = function() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };

    // shim getStats with maplike support
    var makeMapStats = function(stats) {
      var map = new Map();
      Object.keys(stats).forEach(function(key) {
        map.set(key, stats[key]);
        map[key] = stats[key];
      });
      return map;
    };

    var modernStatsTypes = {
      inboundrtp: 'inbound-rtp',
      outboundrtp: 'outbound-rtp',
      candidatepair: 'candidate-pair',
      localcandidate: 'local-candidate',
      remotecandidate: 'remote-candidate'
    };

    var nativeGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function(
      selector,
      onSucc,
      onErr
    ) {
      return nativeGetStats.apply(this, [selector || null])
        .then(function(stats) {
          if (browserDetails.version < 48) {
            stats = makeMapStats(stats);
          }
          if (browserDetails.version < 53 && !onSucc) {
            // Shim only promise getStats with spec-hyphens in type names
            // Leave callback version alone; misc old uses of forEach before Map
            try {
              stats.forEach(function(stat) {
                stat.type = modernStatsTypes[stat.type] || stat.type;
              });
            } catch (e) {
              if (e.name !== 'TypeError') {
                throw e;
              }
              // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
              stats.forEach(function(stat, i) {
                stats.set(i, Object.assign({}, stat, {
                  type: modernStatsTypes[stat.type] || stat.type
                }));
              });
            }
          }
          return stats;
        })
        .then(onSucc, onErr);
    };
  },

  shimRemoveStream: function(window) {
    if (!window.RTCPeerConnection ||
        'removeStream' in window.RTCPeerConnection.prototype) {
      return;
    }
    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      var pc = this;
      utils.deprecated('removeStream', 'removeTrack');
      this.getSenders().forEach(function(sender) {
        if (sender.track && stream.getTracks().indexOf(sender.track) !== -1) {
          pc.removeTrack(sender);
        }
      });
    };
  }
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */


var utils = __webpack_require__(0);
var logging = utils.log;

// Expose public methods.
module.exports = function(window) {
  var browserDetails = utils.detectBrowser(window);
  var navigator = window && window.navigator;
  var MediaStreamTrack = window && window.MediaStreamTrack;

  var shimError_ = function(e) {
    return {
      name: {
        InternalError: 'NotReadableError',
        NotSupportedError: 'TypeError',
        PermissionDeniedError: 'NotAllowedError',
        SecurityError: 'NotAllowedError'
      }[e.name] || e.name,
      message: {
        'The operation is insecure.': 'The request is not allowed by the ' +
        'user agent or the platform in the current context.'
      }[e.message] || e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  // getUserMedia constraints shim.
  var getUserMedia_ = function(constraints, onSuccess, onError) {
    var constraintsToFF37_ = function(c) {
      if (typeof c !== 'object' || c.require) {
        return c;
      }
      var require = [];
      Object.keys(c).forEach(function(key) {
        if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
          return;
        }
        var r = c[key] = (typeof c[key] === 'object') ?
            c[key] : {ideal: c[key]};
        if (r.min !== undefined ||
            r.max !== undefined || r.exact !== undefined) {
          require.push(key);
        }
        if (r.exact !== undefined) {
          if (typeof r.exact === 'number') {
            r. min = r.max = r.exact;
          } else {
            c[key] = r.exact;
          }
          delete r.exact;
        }
        if (r.ideal !== undefined) {
          c.advanced = c.advanced || [];
          var oc = {};
          if (typeof r.ideal === 'number') {
            oc[key] = {min: r.ideal, max: r.ideal};
          } else {
            oc[key] = r.ideal;
          }
          c.advanced.push(oc);
          delete r.ideal;
          if (!Object.keys(r).length) {
            delete c[key];
          }
        }
      });
      if (require.length) {
        c.require = require;
      }
      return c;
    };
    constraints = JSON.parse(JSON.stringify(constraints));
    if (browserDetails.version < 38) {
      logging('spec: ' + JSON.stringify(constraints));
      if (constraints.audio) {
        constraints.audio = constraintsToFF37_(constraints.audio);
      }
      if (constraints.video) {
        constraints.video = constraintsToFF37_(constraints.video);
      }
      logging('ff37: ' + JSON.stringify(constraints));
    }
    return navigator.mozGetUserMedia(constraints, onSuccess, function(e) {
      onError(shimError_(e));
    });
  };

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      getUserMedia_(constraints, resolve, reject);
    });
  };

  // Shim for mediaDevices on older versions.
  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {getUserMedia: getUserMediaPromise_,
      addEventListener: function() { },
      removeEventListener: function() { }
    };
  }
  navigator.mediaDevices.enumerateDevices =
      navigator.mediaDevices.enumerateDevices || function() {
        return new Promise(function(resolve) {
          var infos = [
            {kind: 'audioinput', deviceId: 'default', label: '', groupId: ''},
            {kind: 'videoinput', deviceId: 'default', label: '', groupId: ''}
          ];
          resolve(infos);
        });
      };

  if (browserDetails.version < 41) {
    // Work around http://bugzil.la/1169665
    var orgEnumerateDevices =
        navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    navigator.mediaDevices.enumerateDevices = function() {
      return orgEnumerateDevices().then(undefined, function(e) {
        if (e.name === 'NotFoundError') {
          return [];
        }
        throw e;
      });
    };
  }
  if (browserDetails.version < 49) {
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      return origGetUserMedia(c).then(function(stream) {
        // Work around https://bugzil.la/802326
        if (c.audio && !stream.getAudioTracks().length ||
            c.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach(function(track) {
            track.stop();
          });
          throw new DOMException('The object can not be found here.',
                                 'NotFoundError');
        }
        return stream;
      }, function(e) {
        return Promise.reject(shimError_(e));
      });
    };
  }
  if (!(browserDetails.version > 55 &&
      'autoGainControl' in navigator.mediaDevices.getSupportedConstraints())) {
    var remap = function(obj, a, b) {
      if (a in obj && !(b in obj)) {
        obj[b] = obj[a];
        delete obj[a];
      }
    };

    var nativeGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      if (typeof c === 'object' && typeof c.audio === 'object') {
        c = JSON.parse(JSON.stringify(c));
        remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
        remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
      }
      return nativeGetUserMedia(c);
    };

    if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
      var nativeGetSettings = MediaStreamTrack.prototype.getSettings;
      MediaStreamTrack.prototype.getSettings = function() {
        var obj = nativeGetSettings.apply(this, arguments);
        remap(obj, 'mozAutoGainControl', 'autoGainControl');
        remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
        return obj;
      };
    }

    if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
      var nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
      MediaStreamTrack.prototype.applyConstraints = function(c) {
        if (this.kind === 'audio' && typeof c === 'object') {
          c = JSON.parse(JSON.stringify(c));
          remap(c, 'autoGainControl', 'mozAutoGainControl');
          remap(c, 'noiseSuppression', 'mozNoiseSuppression');
        }
        return nativeApplyConstraints.apply(this, [c]);
      };
    }
  }
  navigator.getUserMedia = function(constraints, onSuccess, onError) {
    if (browserDetails.version < 44) {
      return getUserMedia_(constraints, onSuccess, onError);
    }
    // Replace Firefox 44+'s deprecation warning with unprefixed version.
    utils.deprecated('navigator.getUserMedia',
        'navigator.mediaDevices.getUserMedia');
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

var utils = __webpack_require__(0);

module.exports = {
  shimLocalStreamsAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    if (!('getLocalStreams' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getLocalStreams = function() {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        return this._localStreams;
      };
    }
    if (!('getStreamById' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getStreamById = function(id) {
        var result = null;
        if (this._localStreams) {
          this._localStreams.forEach(function(stream) {
            if (stream.id === id) {
              result = stream;
            }
          });
        }
        if (this._remoteStreams) {
          this._remoteStreams.forEach(function(stream) {
            if (stream.id === id) {
              result = stream;
            }
          });
        }
        return result;
      };
    }
    if (!('addStream' in window.RTCPeerConnection.prototype)) {
      var _addTrack = window.RTCPeerConnection.prototype.addTrack;
      window.RTCPeerConnection.prototype.addStream = function(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        if (this._localStreams.indexOf(stream) === -1) {
          this._localStreams.push(stream);
        }
        var pc = this;
        stream.getTracks().forEach(function(track) {
          _addTrack.call(pc, track, stream);
        });
      };

      window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
        if (stream) {
          if (!this._localStreams) {
            this._localStreams = [stream];
          } else if (this._localStreams.indexOf(stream) === -1) {
            this._localStreams.push(stream);
          }
        }
        return _addTrack.call(this, track, stream);
      };
    }
    if (!('removeStream' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.removeStream = function(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        var index = this._localStreams.indexOf(stream);
        if (index === -1) {
          return;
        }
        this._localStreams.splice(index, 1);
        var pc = this;
        var tracks = stream.getTracks();
        this.getSenders().forEach(function(sender) {
          if (tracks.indexOf(sender.track) !== -1) {
            pc.removeTrack(sender);
          }
        });
      };
    }
  },
  shimRemoteStreamsAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    if (!('getRemoteStreams' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getRemoteStreams = function() {
        return this._remoteStreams ? this._remoteStreams : [];
      };
    }
    if (!('onaddstream' in window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'onaddstream', {
        get: function() {
          return this._onaddstream;
        },
        set: function(f) {
          if (this._onaddstream) {
            this.removeEventListener('addstream', this._onaddstream);
            this.removeEventListener('track', this._onaddstreampoly);
          }
          this.addEventListener('addstream', this._onaddstream = f);
          this.addEventListener('track', this._onaddstreampoly = function(e) {
            var stream = e.streams[0];
            if (!this._remoteStreams) {
              this._remoteStreams = [];
            }
            if (this._remoteStreams.indexOf(stream) >= 0) {
              return;
            }
            this._remoteStreams.push(stream);
            var event = new Event('addstream');
            event.stream = e.streams[0];
            this.dispatchEvent(event);
          }.bind(this));
        }
      });
    }
  },
  shimCallbacksAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    var prototype = window.RTCPeerConnection.prototype;
    var createOffer = prototype.createOffer;
    var createAnswer = prototype.createAnswer;
    var setLocalDescription = prototype.setLocalDescription;
    var setRemoteDescription = prototype.setRemoteDescription;
    var addIceCandidate = prototype.addIceCandidate;

    prototype.createOffer = function(successCallback, failureCallback) {
      var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      var promise = createOffer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    prototype.createAnswer = function(successCallback, failureCallback) {
      var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      var promise = createAnswer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    var withCallback = function(description, successCallback, failureCallback) {
      var promise = setLocalDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setLocalDescription = withCallback;

    withCallback = function(description, successCallback, failureCallback) {
      var promise = setRemoteDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setRemoteDescription = withCallback;

    withCallback = function(candidate, successCallback, failureCallback) {
      var promise = addIceCandidate.apply(this, [candidate]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.addIceCandidate = withCallback;
  },
  shimGetUserMedia: function(window) {
    var navigator = window && window.navigator;

    if (!navigator.getUserMedia) {
      if (navigator.webkitGetUserMedia) {
        navigator.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
      } else if (navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia) {
        navigator.getUserMedia = function(constraints, cb, errcb) {
          navigator.mediaDevices.getUserMedia(constraints)
          .then(cb, errcb);
        }.bind(navigator);
      }
    }
  },
  shimRTCIceServerUrls: function(window) {
    // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
    var OrigPeerConnection = window.RTCPeerConnection;
    window.RTCPeerConnection = function(pcConfig, pcConstraints) {
      if (pcConfig && pcConfig.iceServers) {
        var newIceServers = [];
        for (var i = 0; i < pcConfig.iceServers.length; i++) {
          var server = pcConfig.iceServers[i];
          if (!server.hasOwnProperty('urls') &&
              server.hasOwnProperty('url')) {
            utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
            server = JSON.parse(JSON.stringify(server));
            server.urls = server.url;
            delete server.url;
            newIceServers.push(server);
          } else {
            newIceServers.push(pcConfig.iceServers[i]);
          }
        }
        pcConfig.iceServers = newIceServers;
      }
      return new OrigPeerConnection(pcConfig, pcConstraints);
    };
    window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
    // wrap static methods. Currently just generateCertificate.
    if ('generateCertificate' in window.RTCPeerConnection) {
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function() {
          return OrigPeerConnection.generateCertificate;
        }
      });
    }
  },
  shimTrackEventTransceiver: function(window) {
    // Add event.transceiver member over deprecated event.receiver
    if (typeof window === 'object' && window.RTCPeerConnection &&
        ('receiver' in window.RTCTrackEvent.prototype) &&
        // can't check 'transceiver' in window.RTCTrackEvent.prototype, as it is
        // defined for some reason even when window.RTCTransceiver is not.
        !window.RTCTransceiver) {
      Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
        get: function() {
          return {receiver: this.receiver};
        }
      });
    }
  },

  shimCreateOfferLegacy: function(window) {
    var origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
    window.RTCPeerConnection.prototype.createOffer = function(offerOptions) {
      var pc = this;
      if (offerOptions) {
        var audioTransceiver = pc.getTransceivers().find(function(transceiver) {
          return transceiver.sender.track &&
              transceiver.sender.track.kind === 'audio';
        });
        if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
          if (audioTransceiver.direction === 'sendrecv') {
            audioTransceiver.setDirection('sendonly');
          } else if (audioTransceiver.direction === 'recvonly') {
            audioTransceiver.setDirection('inactive');
          }
        } else if (offerOptions.offerToReceiveAudio === true &&
            !audioTransceiver) {
          pc.addTransceiver('audio');
        }

        var videoTransceiver = pc.getTransceivers().find(function(transceiver) {
          return transceiver.sender.track &&
              transceiver.sender.track.kind === 'video';
        });
        if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
          if (videoTransceiver.direction === 'sendrecv') {
            videoTransceiver.setDirection('sendonly');
          } else if (videoTransceiver.direction === 'recvonly') {
            videoTransceiver.setDirection('inactive');
          }
        } else if (offerOptions.offerToReceiveVideo === true &&
            !videoTransceiver) {
          pc.addTransceiver('video');
        }
      }
      return origCreateOffer.apply(pc, arguments);
    };
  }
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */


var SDPUtils = __webpack_require__(3);
var utils = __webpack_require__(0);

// Wraps the peerconnection event eventNameToWrap in a function
// which returns the modified event object.
function wrapPeerConnectionEvent(window, eventNameToWrap, wrapper) {
  if (!window.RTCPeerConnection) {
    return;
  }
  var proto = window.RTCPeerConnection.prototype;
  var nativeAddEventListener = proto.addEventListener;
  proto.addEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap) {
      return nativeAddEventListener.apply(this, arguments);
    }
    var wrappedCallback = function(e) {
      cb(wrapper(e));
    };
    this._eventMap = this._eventMap || {};
    this._eventMap[cb] = wrappedCallback;
    return nativeAddEventListener.apply(this, [nativeEventName,
      wrappedCallback]);
  };

  var nativeRemoveEventListener = proto.removeEventListener;
  proto.removeEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap || !this._eventMap
        || !this._eventMap[cb]) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    var unwrappedCb = this._eventMap[cb];
    delete this._eventMap[cb];
    return nativeRemoveEventListener.apply(this, [nativeEventName,
      unwrappedCb]);
  };

  Object.defineProperty(proto, 'on' + eventNameToWrap, {
    get: function() {
      return this['_on' + eventNameToWrap];
    },
    set: function(cb) {
      if (this['_on' + eventNameToWrap]) {
        this.removeEventListener(eventNameToWrap,
            this['_on' + eventNameToWrap]);
        delete this['_on' + eventNameToWrap];
      }
      if (cb) {
        this.addEventListener(eventNameToWrap,
            this['_on' + eventNameToWrap] = cb);
      }
    }
  });
}

module.exports = {
  shimRTCIceCandidate: function(window) {
    // foundation is arbitrarily chosen as an indicator for full support for
    // https://w3c.github.io/webrtc-pc/#rtcicecandidate-interface
    if (window.RTCIceCandidate && 'foundation' in
        window.RTCIceCandidate.prototype) {
      return;
    }

    var NativeRTCIceCandidate = window.RTCIceCandidate;
    window.RTCIceCandidate = function(args) {
      // Remove the a= which shouldn't be part of the candidate string.
      if (typeof args === 'object' && args.candidate &&
          args.candidate.indexOf('a=') === 0) {
        args = JSON.parse(JSON.stringify(args));
        args.candidate = args.candidate.substr(2);
      }

      // Augment the native candidate with the parsed fields.
      var nativeCandidate = new NativeRTCIceCandidate(args);
      var parsedCandidate = SDPUtils.parseCandidate(args.candidate);
      var augmentedCandidate = Object.assign(nativeCandidate,
          parsedCandidate);

      // Add a serializer that does not serialize the extra attributes.
      augmentedCandidate.toJSON = function() {
        return {
          candidate: augmentedCandidate.candidate,
          sdpMid: augmentedCandidate.sdpMid,
          sdpMLineIndex: augmentedCandidate.sdpMLineIndex,
          usernameFragment: augmentedCandidate.usernameFragment,
        };
      };
      return augmentedCandidate;
    };

    // Hook up the augmented candidate in onicecandidate and
    // addEventListener('icecandidate', ...)
    wrapPeerConnectionEvent(window, 'icecandidate', function(e) {
      if (e.candidate) {
        Object.defineProperty(e, 'candidate', {
          value: new window.RTCIceCandidate(e.candidate),
          writable: 'false'
        });
      }
      return e;
    });
  },

  // shimCreateObjectURL must be called before shimSourceObject to avoid loop.

  shimCreateObjectURL: function(window) {
    var URL = window && window.URL;

    if (!(typeof window === 'object' && window.HTMLMediaElement &&
          'srcObject' in window.HTMLMediaElement.prototype &&
        URL.createObjectURL && URL.revokeObjectURL)) {
      // Only shim CreateObjectURL using srcObject if srcObject exists.
      return undefined;
    }

    var nativeCreateObjectURL = URL.createObjectURL.bind(URL);
    var nativeRevokeObjectURL = URL.revokeObjectURL.bind(URL);
    var streams = new Map(), newId = 0;

    URL.createObjectURL = function(stream) {
      if ('getTracks' in stream) {
        var url = 'polyblob:' + (++newId);
        streams.set(url, stream);
        utils.deprecated('URL.createObjectURL(stream)',
            'elem.srcObject = stream');
        return url;
      }
      return nativeCreateObjectURL(stream);
    };
    URL.revokeObjectURL = function(url) {
      nativeRevokeObjectURL(url);
      streams.delete(url);
    };

    var dsc = Object.getOwnPropertyDescriptor(window.HTMLMediaElement.prototype,
                                              'src');
    Object.defineProperty(window.HTMLMediaElement.prototype, 'src', {
      get: function() {
        return dsc.get.apply(this);
      },
      set: function(url) {
        this.srcObject = streams.get(url) || null;
        return dsc.set.apply(this, [url]);
      }
    });

    var nativeSetAttribute = window.HTMLMediaElement.prototype.setAttribute;
    window.HTMLMediaElement.prototype.setAttribute = function() {
      if (arguments.length === 2 &&
          ('' + arguments[0]).toLowerCase() === 'src') {
        this.srcObject = streams.get(arguments[1]) || null;
      }
      return nativeSetAttribute.apply(this, arguments);
    };
  }
};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
	The MIT License (MIT)

	Copyright (c) 2016 Meetecho

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the "Software"),
	to deal in the Software without restriction, including without limitation
	the rights to use, copy, modify, merge, publish, distribute, sublicense,
	and/or sell copies of the Software, and to permit persons to whom the
	Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included
	in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
	THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
	OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
	ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	OTHER DEALINGS IN THE SOFTWARE.
 */

// List of sessions
Janus.sessions = {};

Janus.isExtensionEnabled = function () {
	if (window.navigator.userAgent.match('Chrome')) {
		var chromever = parseInt(window.navigator.userAgent.match(/Chrome\/(.*) /)[1], 10);
		var maxver = 33;
		if (window.navigator.userAgent.match('Linux')) maxver = 35; // "known" crash in chrome 34 and 35 on linux
		if (chromever >= 26 && chromever <= maxver) {
			// Older versions of Chrome don't support this extension-based approach, so lie
			return true;
		}
		return Janus.extension.isInstalled();
	} else {
		// Firefox of others, no need for the extension (but this doesn't mean it will work)
		return true;
	}
};

var defaultExtension = {
	// Screensharing Chrome Extension ID
	extensionId: 'hapfgfdkleiggjjpfpenajgdnfckjpaj',
	isInstalled: function isInstalled() {
		return document.querySelector('#janus-extension-installed') !== null;
	},
	getScreen: function getScreen(callback) {
		var pending = window.setTimeout(function () {
			error = new Error('NavigatorUserMediaError');
			error.name = 'The required Chrome extension is not installed: click <a href="#">here</a> to install it. (NOTE: this will need you to refresh the page)';
			return callback(error);
		}, 1000);
		this.cache[pending] = callback;
		window.postMessage({ type: 'janusGetScreen', id: pending }, '*');
	},
	init: function init() {
		var cache = {};
		this.cache = cache;
		// Wait for events from the Chrome Extension
		window.addEventListener('message', function (event) {
			if (event.origin != window.location.origin) return;
			if (event.data.type == 'janusGotScreen' && cache[event.data.id]) {
				var callback = cache[event.data.id];
				delete cache[event.data.id];

				if (event.data.sourceId === '') {
					// user canceled
					var error = new Error('NavigatorUserMediaError');
					error.name = 'You cancelled the request for permission, giving up...';
					callback(error);
				} else {
					callback(null, event.data.sourceId);
				}
			} else if (event.data.type == 'janusGetScreenPending') {
				console.log('clearing ', event.data.id);
				window.clearTimeout(event.data.id);
			}
		});
	}
};

Janus.useDefaultDependencies = function (deps) {
	var f = deps && deps.fetch || fetch;
	var p = deps && deps.Promise || Promise;
	var socketCls = deps && deps.WebSocket || WebSocket;

	return {
		newWebSocket: function newWebSocket(server, proto) {
			return new socketCls(server, proto);
		},
		extension: deps && deps.extension || defaultExtension,
		isArray: function isArray(arr) {
			return Array.isArray(arr);
		},
		webRTCAdapter: deps && deps.adapter || adapter,
		httpAPICall: function httpAPICall(url, options) {
			var fetchOptions = {
				method: options.verb,
				headers: {
					'Accept': 'application/json, text/plain, */*'
				},
				cache: 'no-cache'
			};
			if (options.verb === "POST") {
				fetchOptions.headers['Content-Type'] = 'application/json';
			}
			if (options.withCredentials !== undefined) {
				fetchOptions.credentials = options.withCredentials === true ? 'include' : options.withCredentials ? options.withCredentials : 'omit';
			}
			if (options.body !== undefined) {
				fetchOptions.body = JSON.stringify(options.body);
			}

			var fetching = f(url, fetchOptions).catch(function (error) {
				return p.reject({ message: 'Probably a network error, is the gateway down?', error: error });
			});

			/*
    * fetch() does not natively support timeouts.
    * Work around this by starting a timeout manually, and racing it agains the fetch() to see which thing resolves first.
    */

			if (options.timeout !== undefined) {
				var timeout = new p(function (resolve, reject) {
					var timerId = setTimeout(function () {
						clearTimeout(timerId);
						return reject({ message: 'Request timed out', timeout: options.timeout });
					}, options.timeout);
				});
				fetching = p.race([fetching, timeout]);
			}

			fetching.then(function (response) {
				if (response.ok) {
					if (_typeof(options.success) === _typeof(Janus.noop)) {
						return response.json().then(function (parsed) {
							options.success(parsed);
						}).catch(function (error) {
							return p.reject({ message: 'Failed to parse response body', error: error, response: response });
						});
					}
				} else {
					return p.reject({ message: 'API call failed', response: response });
				}
			}).catch(function (error) {
				if (_typeof(options.error) === _typeof(Janus.noop)) {
					options.error(error.message || '<< internal error >>', error);
				}
			});

			return fetching;
		}
	};
};

Janus.useOldDependencies = function (deps) {
	var jq = deps && deps.jQuery || jQuery;
	var socketCls = deps && deps.WebSocket || WebSocket;
	return {
		newWebSocket: function newWebSocket(server, proto) {
			return new socketCls(server, proto);
		},
		isArray: function isArray(arr) {
			return jq.isArray(arr);
		},
		extension: deps && deps.extension || defaultExtension,
		webRTCAdapter: deps && deps.adapter || adapter,
		httpAPICall: function httpAPICall(url, options) {
			var payload = options.body !== undefined ? {
				contentType: 'application/json',
				data: JSON.stringify(options.body)
			} : {};
			var credentials = options.withCredentials !== undefined ? { xhrFields: { withCredentials: options.withCredentials } } : {};

			return jq.ajax(jq.extend(payload, credentials, {
				url: url,
				type: options.verb,
				cache: false,
				dataType: 'json',
				async: options.async,
				timeout: options.timeout,
				success: function success(result) {
					if (_typeof(options.success) === _typeof(Janus.noop)) {
						options.success(result);
					}
				},
				error: function error(xhr, status, err) {
					if (_typeof(options.error) === _typeof(Janus.noop)) {
						options.error(status, err);
					}
				}
			}));
		}
	};
};

Janus.noop = function () {};

// Initialization
Janus.init = function (options) {
	options = options || {};
	options.callback = typeof options.callback == "function" ? options.callback : Janus.noop;
	if (Janus.initDone === true) {
		// Already initialized
		options.callback();
	} else {
		if (typeof console == "undefined" || typeof console.log == "undefined") console = { log: function log() {} };
		// Console logging (all debugging disabled by default)
		Janus.trace = Janus.noop;
		Janus.debug = Janus.noop;
		Janus.vdebug = Janus.noop;
		Janus.log = Janus.noop;
		Janus.warn = Janus.noop;
		Janus.error = Janus.noop;
		if (options.debug === true || options.debug === "all") {
			// Enable all debugging levels
			Janus.trace = console.trace.bind(console);
			Janus.debug = console.debug.bind(console);
			Janus.vdebug = console.debug.bind(console);
			Janus.log = console.log.bind(console);
			Janus.warn = console.warn.bind(console);
			Janus.error = console.error.bind(console);
		} else if (Array.isArray(options.debug)) {
			for (var i in options.debug) {
				var d = options.debug[i];
				switch (d) {
					case "trace":
						Janus.trace = console.trace.bind(console);
						break;
					case "debug":
						Janus.debug = console.debug.bind(console);
						break;
					case "vdebug":
						Janus.vdebug = console.debug.bind(console);
						break;
					case "log":
						Janus.log = console.log.bind(console);
						break;
					case "warn":
						Janus.warn = console.warn.bind(console);
						break;
					case "error":
						Janus.error = console.error.bind(console);
						break;
					default:
						console.error("Unknown debugging option '" + d + "' (supported: 'trace', 'debug', 'vdebug', 'log', warn', 'error')");
						break;
				}
			}
		}
		Janus.log("Initializing library");

		var usedDependencies = options.dependencies || Janus.useDefaultDependencies();
		Janus.isArray = usedDependencies.isArray;
		Janus.webRTCAdapter = usedDependencies.webRTCAdapter;
		Janus.httpAPICall = usedDependencies.httpAPICall;
		Janus.newWebSocket = usedDependencies.newWebSocket;
		Janus.extension = usedDependencies.extension;
		Janus.extension.init();

		// Helper method to enumerate devices
		Janus.listDevices = function (callback, config) {
			callback = typeof callback == "function" ? callback : Janus.noop;
			if (config == null) config = { audio: true, video: true };
			if (navigator.mediaDevices) {
				navigator.mediaDevices.getUserMedia(config).then(function (stream) {
					navigator.mediaDevices.enumerateDevices().then(function (devices) {
						Janus.debug(devices);
						callback(devices);
						// Get rid of the now useless stream
						try {
							var tracks = stream.getTracks();
							for (var i in tracks) {
								var mst = tracks[i];
								if (mst !== null && mst !== undefined) mst.stop();
							}
						} catch (e) {}
					});
				}).catch(function (err) {
					Janus.error(err);
					callback([]);
				});
			} else {
				Janus.warn("navigator.mediaDevices unavailable");
				callback([]);
			}
		};
		// Helper methods to attach/reattach a stream to a video element (previously part of adapter.js)
		Janus.attachMediaStream = function (element, stream) {
			if (Janus.webRTCAdapter.browserDetails.browser === 'chrome') {
				var chromever = Janus.webRTCAdapter.browserDetails.version;
				if (chromever >= 43) {
					element.srcObject = stream;
				} else if (typeof element.src !== 'undefined') {
					element.src = URL.createObjectURL(stream);
				} else {
					Janus.error("Error attaching stream to element");
				}
			} else {
				element.srcObject = stream;
			}
		};
		Janus.reattachMediaStream = function (to, from) {
			if (Janus.webRTCAdapter.browserDetails.browser === 'chrome') {
				var chromever = Janus.webRTCAdapter.browserDetails.version;
				if (chromever >= 43) {
					to.srcObject = from.srcObject;
				} else if (typeof to.src !== 'undefined') {
					to.src = from.src;
				} else {
					Janus.error("Error reattaching stream to element");
				}
			} else {
				to.srcObject = from.srcObject;
			}
		};
		// Detect tab close: make sure we don't loose existing onbeforeunload handlers
		var oldOBF = window.onbeforeunload;
		window.onbeforeunload = function () {
			Janus.log("Closing window");
			for (var s in Janus.sessions) {
				if (Janus.sessions[s] !== null && Janus.sessions[s] !== undefined && Janus.sessions[s].destroyOnUnload) {
					Janus.log("Destroying session " + s);
					Janus.sessions[s].destroy({ asyncRequest: false, notifyDestroyed: false });
				}
			}
			if (oldOBF && typeof oldOBF == "function") oldOBF();
		};
		Janus.initDone = true;
		options.callback();
	}
};

// Helper method to check whether WebRTC is supported by this browser
Janus.isWebrtcSupported = function () {
	return window.RTCPeerConnection !== undefined && window.RTCPeerConnection !== null && navigator.getUserMedia !== undefined && navigator.getUserMedia !== null;
};

// Helper method to create random identifiers (e.g., transaction)
Janus.randomString = function (len) {
	var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var randomString = '';
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz, randomPoz + 1);
	}
	return randomString;
};

function Janus(gatewayCallbacks) {
	if (Janus.initDone === undefined) {
		gatewayCallbacks.error("Library not initialized");
		return {};
	}
	if (!Janus.isWebrtcSupported()) {
		gatewayCallbacks.error("WebRTC not supported by this browser");
		return {};
	}
	Janus.log("Library initialized: " + Janus.initDone);
	gatewayCallbacks = gatewayCallbacks || {};
	gatewayCallbacks.success = typeof gatewayCallbacks.success == "function" ? gatewayCallbacks.success : Janus.noop;
	gatewayCallbacks.error = typeof gatewayCallbacks.error == "function" ? gatewayCallbacks.error : Janus.noop;
	gatewayCallbacks.destroyed = typeof gatewayCallbacks.destroyed == "function" ? gatewayCallbacks.destroyed : Janus.noop;
	if (gatewayCallbacks.server === null || gatewayCallbacks.server === undefined) {
		gatewayCallbacks.error("Invalid gateway url");
		return {};
	}
	var websockets = false;
	var ws = null;
	var wsHandlers = {};
	var wsKeepaliveTimeoutId = null;

	var servers = null,
	    serversIndex = 0;
	var server = gatewayCallbacks.server;
	if (Janus.isArray(server)) {
		Janus.log("Multiple servers provided (" + server.length + "), will use the first that works");
		server = null;
		servers = gatewayCallbacks.server;
		Janus.debug(servers);
	} else {
		if (server.indexOf("ws") === 0) {
			websockets = true;
			Janus.log("Using WebSockets to contact Janus: " + server);
		} else {
			websockets = false;
			Janus.log("Using REST API to contact Janus: " + server);
		}
	}
	var iceServers = gatewayCallbacks.iceServers;
	if (iceServers === undefined || iceServers === null) iceServers = [{ urls: "stun:stun.l.google.com:19302" }];
	var iceTransportPolicy = gatewayCallbacks.iceTransportPolicy;
	var bundlePolicy = gatewayCallbacks.bundlePolicy;
	// Whether IPv6 candidates should be gathered
	var ipv6Support = gatewayCallbacks.ipv6;
	if (ipv6Support === undefined || ipv6Support === null) ipv6Support = false;
	// Whether we should enable the withCredentials flag for XHR requests
	var withCredentials = false;
	if (gatewayCallbacks.withCredentials !== undefined && gatewayCallbacks.withCredentials !== null) withCredentials = gatewayCallbacks.withCredentials === true;
	// Optional max events
	var maxev = null;
	if (gatewayCallbacks.max_poll_events !== undefined && gatewayCallbacks.max_poll_events !== null) maxev = gatewayCallbacks.max_poll_events;
	if (maxev < 1) maxev = 1;
	// Token to use (only if the token based authentication mechanism is enabled)
	var token = null;
	if (gatewayCallbacks.token !== undefined && gatewayCallbacks.token !== null) token = gatewayCallbacks.token;
	// API secret to use (only if the shared API secret is enabled)
	var apisecret = null;
	if (gatewayCallbacks.apisecret !== undefined && gatewayCallbacks.apisecret !== null) apisecret = gatewayCallbacks.apisecret;
	// Whether we should destroy this session when onbeforeunload is called
	this.destroyOnUnload = true;
	if (gatewayCallbacks.destroyOnUnload !== undefined && gatewayCallbacks.destroyOnUnload !== null) this.destroyOnUnload = gatewayCallbacks.destroyOnUnload === true;

	var connected = false;
	var sessionId = null;
	var pluginHandles = {};
	var that = this;
	var retries = 0;
	var transactions = {};
	createSession(gatewayCallbacks);

	// Public methods
	this.getServer = function () {
		return server;
	};
	this.isConnected = function () {
		return connected;
	};
	this.reconnect = function (callbacks) {
		callbacks = callbacks || {};
		callbacks.success = typeof callbacks.success == "function" ? callbacks.success : Janus.noop;
		callbacks.error = typeof callbacks.error == "function" ? callbacks.error : Janus.noop;
		callbacks["reconnect"] = true;
		createSession(callbacks);
	};
	this.getSessionId = function () {
		return sessionId;
	};
	this.destroy = function (callbacks) {
		destroySession(callbacks);
	};
	this.attach = function (callbacks) {
		createHandle(callbacks);
	};

	function eventHandler() {
		if (sessionId == null) return;
		Janus.debug('Long poll...');
		if (!connected) {
			Janus.warn("Is the gateway down? (connected=false)");
			return;
		}
		var longpoll = server + "/" + sessionId + "?rid=" + new Date().getTime();
		if (maxev !== undefined && maxev !== null) longpoll = longpoll + "&maxev=" + maxev;
		if (token !== null && token !== undefined) longpoll = longpoll + "&token=" + token;
		if (apisecret !== null && apisecret !== undefined) longpoll = longpoll + "&apisecret=" + apisecret;
		Janus.httpAPICall(longpoll, {
			verb: 'GET',
			withCredentials: withCredentials,
			success: handleEvent,
			timeout: 60000, // FIXME
			error: function error(textStatus, errorThrown) {
				Janus.error(textStatus + ":", errorThrown);
				retries++;
				if (retries > 3) {
					// Did we just lose the gateway? :-(
					connected = false;
					gatewayCallbacks.error("Lost connection to the gateway (is it down?)");
					return;
				}
				eventHandler();
			}
		});
	}

	// Private event handler: this will trigger plugin callbacks, if set
	function handleEvent(json, skipTimeout) {
		retries = 0;
		if (!websockets && sessionId !== undefined && sessionId !== null && skipTimeout !== true) setTimeout(eventHandler, 200);
		if (!websockets && Janus.isArray(json)) {
			// We got an array: it means we passed a maxev > 1, iterate on all objects
			for (var i = 0; i < json.length; i++) {
				handleEvent(json[i], true);
			}
			return;
		}
		if (json["janus"] === "keepalive") {
			// Nothing happened
			Janus.vdebug("Got a keepalive on session " + sessionId);
			return;
		} else if (json["janus"] === "ack") {
			// Just an ack, we can probably ignore
			Janus.debug("Got an ack on session " + sessionId);
			Janus.debug(json);
			var transaction = json["transaction"];
			if (transaction !== null && transaction !== undefined) {
				var reportSuccess = transactions[transaction];
				if (reportSuccess !== null && reportSuccess !== undefined) {
					reportSuccess(json);
				}
				delete transactions[transaction];
			}
			return;
		} else if (json["janus"] === "success") {
			// Success!
			Janus.debug("Got a success on session " + sessionId);
			Janus.debug(json);
			var transaction = json["transaction"];
			if (transaction !== null && transaction !== undefined) {
				var reportSuccess = transactions[transaction];
				if (reportSuccess !== null && reportSuccess !== undefined) {
					reportSuccess(json);
				}
				delete transactions[transaction];
			}
			return;
		} else if (json["janus"] === "trickle") {
			// We got a trickle candidate from Janus
			var sender = json["sender"];
			if (sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var pluginHandle = pluginHandles[sender];
			if (pluginHandle === undefined || pluginHandle === null) {
				Janus.debug("This handle is not attached to this session");
				return;
			}
			var candidate = json["candidate"];
			Janus.debug("Got a trickled candidate on session " + sessionId);
			Janus.debug(candidate);
			var config = pluginHandle.webrtcStuff;
			if (config.pc && config.remoteSdp) {
				// Add candidate right now
				Janus.debug("Adding remote candidate:", candidate);
				if (!candidate || candidate.completed === true) {
					// end-of-candidates
					config.pc.addIceCandidate();
				} else {
					// New candidate
					config.pc.addIceCandidate(new RTCIceCandidate(candidate));
				}
			} else {
				// We didn't do setRemoteDescription (trickle got here before the offer?)
				Janus.debug("We didn't do setRemoteDescription (trickle got here before the offer?), caching candidate");
				if (!config.candidates) config.candidates = [];
				config.candidates.push(candidate);
				Janus.debug(config.candidates);
			}
		} else if (json["janus"] === "webrtcup") {
			// The PeerConnection with the gateway is up! Notify this
			Janus.debug("Got a webrtcup event on session " + sessionId);
			Janus.debug(json);
			var sender = json["sender"];
			if (sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var pluginHandle = pluginHandles[sender];
			if (pluginHandle === undefined || pluginHandle === null) {
				Janus.debug("This handle is not attached to this session");
				return;
			}
			pluginHandle.webrtcState(true);
			return;
		} else if (json["janus"] === "hangup") {
			// A plugin asked the core to hangup a PeerConnection on one of our handles
			Janus.debug("Got a hangup event on session " + sessionId);
			Janus.debug(json);
			var sender = json["sender"];
			if (sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var pluginHandle = pluginHandles[sender];
			if (pluginHandle === undefined || pluginHandle === null) {
				Janus.debug("This handle is not attached to this session");
				return;
			}
			pluginHandle.webrtcState(false, json["reason"]);
			pluginHandle.hangup();
		} else if (json["janus"] === "detached") {
			// A plugin asked the core to detach one of our handles
			Janus.debug("Got a detached event on session " + sessionId);
			Janus.debug(json);
			var sender = json["sender"];
			if (sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var pluginHandle = pluginHandles[sender];
			if (pluginHandle === undefined || pluginHandle === null) {
				// Don't warn here because destroyHandle causes this situation.
				return;
			}
			pluginHandle.detached = true;
			pluginHandle.ondetached();
			pluginHandle.detach();
		} else if (json["janus"] === "media") {
			// Media started/stopped flowing
			Janus.debug("Got a media event on session " + sessionId);
			Janus.debug(json);
			var sender = json["sender"];
			if (sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var pluginHandle = pluginHandles[sender];
			if (pluginHandle === undefined || pluginHandle === null) {
				Janus.debug("This handle is not attached to this session");
				return;
			}
			pluginHandle.mediaState(json["type"], json["receiving"]);
		} else if (json["janus"] === "slowlink") {
			Janus.debug("Got a slowlink event on session " + sessionId);
			Janus.debug(json);
			// Trouble uplink or downlink
			var sender = json["sender"];
			if (sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var pluginHandle = pluginHandles[sender];
			if (pluginHandle === undefined || pluginHandle === null) {
				Janus.debug("This handle is not attached to this session");
				return;
			}
			pluginHandle.slowLink(json["uplink"], json["nacks"]);
		} else if (json["janus"] === "error") {
			// Oops, something wrong happened
			Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason); // FIXME
			Janus.debug(json);
			var transaction = json["transaction"];
			if (transaction !== null && transaction !== undefined) {
				var reportSuccess = transactions[transaction];
				if (reportSuccess !== null && reportSuccess !== undefined) {
					reportSuccess(json);
				}
				delete transactions[transaction];
			}
			return;
		} else if (json["janus"] === "event") {
			Janus.debug("Got a plugin event on session " + sessionId);
			Janus.debug(json);
			var sender = json["sender"];
			if (sender === undefined || sender === null) {
				Janus.warn("Missing sender...");
				return;
			}
			var plugindata = json["plugindata"];
			if (plugindata === undefined || plugindata === null) {
				Janus.warn("Missing plugindata...");
				return;
			}
			Janus.debug("  -- Event is coming from " + sender + " (" + plugindata["plugin"] + ")");
			var data = plugindata["data"];
			Janus.debug(data);
			var pluginHandle = pluginHandles[sender];
			if (pluginHandle === undefined || pluginHandle === null) {
				Janus.warn("This handle is not attached to this session");
				return;
			}
			var jsep = json["jsep"];
			if (jsep !== undefined && jsep !== null) {
				Janus.debug("Handling SDP as well...");
				Janus.debug(jsep);
			}
			var callback = pluginHandle.onmessage;
			if (callback !== null && callback !== undefined) {
				Janus.debug("Notifying application...");
				// Send to callback specified when attaching plugin handle
				callback(data, jsep);
			} else {
				// Send to generic callback (?)
				Janus.debug("No provided notification callback");
			}
		} else {
			Janus.warn("Unknown message/event  '" + json["janus"] + "' on session " + sessionId);
			Janus.debug(json);
		}
	}

	// Private helper to send keep-alive messages on WebSockets
	function keepAlive() {
		if (server === null || !websockets || !connected) return;
		wsKeepaliveTimeoutId = setTimeout(keepAlive, 30000);
		var request = { "janus": "keepalive", "session_id": sessionId, "transaction": Janus.randomString(12) };
		if (token !== null && token !== undefined) request["token"] = token;
		if (apisecret !== null && apisecret !== undefined) request["apisecret"] = apisecret;
		ws.send(JSON.stringify(request));
	}

	// Private method to create a session
	function createSession(callbacks) {
		var transaction = Janus.randomString(12);
		var request = { "janus": "create", "transaction": transaction };
		if (callbacks["reconnect"]) {
			// We're reconnecting, claim the session
			connected = false;
			request["janus"] = "claim";
			request["session_id"] = sessionId;
			// If we were using websockets, ignore the old connection
			if (ws) {
				ws.onopen = null;
				ws.onerror = null;
				ws.onclose = null;
				if (wsKeepaliveTimeoutId) {
					clearTimeout(wsKeepaliveTimeoutId);
					wsKeepaliveTimeoutId = null;
				}
			}
		}
		if (token !== null && token !== undefined) request["token"] = token;
		if (apisecret !== null && apisecret !== undefined) request["apisecret"] = apisecret;
		if (server === null && Janus.isArray(servers)) {
			// We still need to find a working server from the list we were given
			server = servers[serversIndex];
			if (server.indexOf("ws") === 0) {
				websockets = true;
				Janus.log("Server #" + (serversIndex + 1) + ": trying WebSockets to contact Janus (" + server + ")");
			} else {
				websockets = false;
				Janus.log("Server #" + (serversIndex + 1) + ": trying REST API to contact Janus (" + server + ")");
			}
		}
		if (websockets) {
			ws = Janus.newWebSocket(server, 'janus-protocol');
			wsHandlers = {
				'error': function error() {
					Janus.error("Error connecting to the Janus WebSockets server... " + server);
					if (Janus.isArray(servers)) {
						serversIndex++;
						if (serversIndex == servers.length) {
							// We tried all the servers the user gave us and they all failed
							callbacks.error("Error connecting to any of the provided Janus servers: Is the gateway down?");
							return;
						}
						// Let's try the next server
						server = null;
						setTimeout(function () {
							createSession(callbacks);
						}, 200);
						return;
					}
					callbacks.error("Error connecting to the Janus WebSockets server: Is the gateway down?");
				},

				'open': function open() {
					// We need to be notified about the success
					transactions[transaction] = function (json) {
						Janus.debug(json);
						if (json["janus"] !== "success") {
							Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason); // FIXME
							callbacks.error(json["error"].reason);
							return;
						}
						wsKeepaliveTimeoutId = setTimeout(keepAlive, 30000);
						connected = true;
						sessionId = json["session_id"] ? json["session_id"] : json.data["id"];
						if (callbacks["reconnect"]) {
							Janus.log("Claimed session: " + sessionId);
						} else {
							Janus.log("Created session: " + sessionId);
						}
						Janus.sessions[sessionId] = that;
						callbacks.success();
					};
					ws.send(JSON.stringify(request));
				},

				'message': function message(event) {
					handleEvent(JSON.parse(event.data));
				},

				'close': function close() {
					if (server === null || !connected) {
						return;
					}
					connected = false;
					// FIXME What if this is called when the page is closed?
					gatewayCallbacks.error("Lost connection to the gateway (is it down?)");
				}
			};

			for (var eventName in wsHandlers) {
				ws.addEventListener(eventName, wsHandlers[eventName]);
			}

			return;
		}
		Janus.httpAPICall(server, {
			verb: 'POST',
			withCredentials: withCredentials,
			body: request,
			success: function success(json) {
				Janus.debug(json);
				if (json["janus"] !== "success") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason); // FIXME
					callbacks.error(json["error"].reason);
					return;
				}
				connected = true;
				sessionId = json["session_id"] ? json["session_id"] : json.data["id"];
				if (callbacks["reconnect"]) {
					Janus.log("Claimed session: " + sessionId);
				} else {
					Janus.log("Created session: " + sessionId);
				}
				Janus.sessions[sessionId] = that;
				eventHandler();
				callbacks.success();
			},
			error: function error(textStatus, errorThrown) {
				Janus.error(textStatus + ":", errorThrown); // FIXME
				if (Janus.isArray(servers)) {
					serversIndex++;
					if (serversIndex == servers.length) {
						// We tried all the servers the user gave us and they all failed
						callbacks.error("Error connecting to any of the provided Janus servers: Is the gateway down?");
						return;
					}
					// Let's try the next server
					server = null;
					setTimeout(function () {
						createSession(callbacks);
					}, 200);
					return;
				}
				if (errorThrown === "") callbacks.error(textStatus + ": Is the gateway down?");else callbacks.error(textStatus + ": " + errorThrown);
			}
		});
	}

	// Private method to destroy a session
	function destroySession(callbacks) {
		callbacks = callbacks || {};
		// FIXME This method triggers a success even when we fail
		callbacks.success = typeof callbacks.success == "function" ? callbacks.success : Janus.noop;
		var asyncRequest = true;
		if (callbacks.asyncRequest !== undefined && callbacks.asyncRequest !== null) asyncRequest = callbacks.asyncRequest === true;
		var notifyDestroyed = true;
		if (callbacks.notifyDestroyed !== undefined && callbacks.notifyDestroyed !== null) notifyDestroyed = callbacks.notifyDestroyed === true;
		Janus.log("Destroying session " + sessionId + " (async=" + asyncRequest + ")");
		if (!connected) {
			Janus.warn("Is the gateway down? (connected=false)");
			callbacks.success();
			return;
		}
		if (sessionId === undefined || sessionId === null) {
			Janus.warn("No session to destroy");
			callbacks.success();
			if (notifyDestroyed) gatewayCallbacks.destroyed();
			return;
		}
		delete Janus.sessions[sessionId];
		// No need to destroy all handles first, Janus will do that itself
		var request = { "janus": "destroy", "transaction": Janus.randomString(12) };
		if (token !== null && token !== undefined) request["token"] = token;
		if (apisecret !== null && apisecret !== undefined) request["apisecret"] = apisecret;
		if (websockets) {
			request["session_id"] = sessionId;

			var unbindWebSocket = function unbindWebSocket() {
				for (var eventName in wsHandlers) {
					ws.removeEventListener(eventName, wsHandlers[eventName]);
				}
				ws.removeEventListener('message', onUnbindMessage);
				ws.removeEventListener('error', onUnbindError);
				if (wsKeepaliveTimeoutId) {
					clearTimeout(wsKeepaliveTimeoutId);
				}
				ws.close();
			};

			var onUnbindMessage = function onUnbindMessage(event) {
				var data = JSON.parse(event.data);
				if (data.session_id == request.session_id && data.transaction == request.transaction) {
					unbindWebSocket();
					callbacks.success();
					if (notifyDestroyed) gatewayCallbacks.destroyed();
				}
			};
			var onUnbindError = function onUnbindError(event) {
				unbindWebSocket();
				callbacks.error("Failed to destroy the gateway: Is the gateway down?");
				if (notifyDestroyed) gatewayCallbacks.destroyed();
			};

			ws.addEventListener('message', onUnbindMessage);
			ws.addEventListener('error', onUnbindError);

			ws.send(JSON.stringify(request));
			return;
		}
		Janus.httpAPICall(server + "/" + sessionId, {
			verb: 'POST',
			async: asyncRequest, // Sometimes we need false here, or destroying in onbeforeunload won't work
			withCredentials: withCredentials,
			body: request,
			success: function success(json) {
				Janus.log("Destroyed session:");
				Janus.debug(json);
				sessionId = null;
				connected = false;
				if (json["janus"] !== "success") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason); // FIXME
				}
				callbacks.success();
				if (notifyDestroyed) gatewayCallbacks.destroyed();
			},
			error: function error(textStatus, errorThrown) {
				Janus.error(textStatus + ":", errorThrown); // FIXME
				// Reset everything anyway
				sessionId = null;
				connected = false;
				callbacks.success();
				if (notifyDestroyed) gatewayCallbacks.destroyed();
			}
		});
	}

	// Private method to create a plugin handle
	function createHandle(callbacks) {
		callbacks = callbacks || {};
		callbacks.success = typeof callbacks.success == "function" ? callbacks.success : Janus.noop;
		callbacks.error = typeof callbacks.error == "function" ? callbacks.error : Janus.noop;
		callbacks.consentDialog = typeof callbacks.consentDialog == "function" ? callbacks.consentDialog : Janus.noop;
		callbacks.iceState = typeof callbacks.iceState == "function" ? callbacks.iceState : Janus.noop;
		callbacks.mediaState = typeof callbacks.mediaState == "function" ? callbacks.mediaState : Janus.noop;
		callbacks.webrtcState = typeof callbacks.webrtcState == "function" ? callbacks.webrtcState : Janus.noop;
		callbacks.slowLink = typeof callbacks.slowLink == "function" ? callbacks.slowLink : Janus.noop;
		callbacks.onmessage = typeof callbacks.onmessage == "function" ? callbacks.onmessage : Janus.noop;
		callbacks.onlocalstream = typeof callbacks.onlocalstream == "function" ? callbacks.onlocalstream : Janus.noop;
		callbacks.onremotestream = typeof callbacks.onremotestream == "function" ? callbacks.onremotestream : Janus.noop;
		callbacks.ondata = typeof callbacks.ondata == "function" ? callbacks.ondata : Janus.noop;
		callbacks.ondataopen = typeof callbacks.ondataopen == "function" ? callbacks.ondataopen : Janus.noop;
		callbacks.oncleanup = typeof callbacks.oncleanup == "function" ? callbacks.oncleanup : Janus.noop;
		callbacks.ondetached = typeof callbacks.ondetached == "function" ? callbacks.ondetached : Janus.noop;
		if (!connected) {
			Janus.warn("Is the gateway down? (connected=false)");
			callbacks.error("Is the gateway down? (connected=false)");
			return;
		}
		var plugin = callbacks.plugin;
		if (plugin === undefined || plugin === null) {
			Janus.error("Invalid plugin");
			callbacks.error("Invalid plugin");
			return;
		}
		var opaqueId = callbacks.opaqueId;
		var handleToken = callbacks.token ? callbacks.token : token;
		var transaction = Janus.randomString(12);
		var request = { "janus": "attach", "plugin": plugin, "opaque_id": opaqueId, "transaction": transaction };
		if (handleToken !== null && handleToken !== undefined) request["token"] = handleToken;
		if (apisecret !== null && apisecret !== undefined) request["apisecret"] = apisecret;
		if (websockets) {
			transactions[transaction] = function (json) {
				Janus.debug(json);
				if (json["janus"] !== "success") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason); // FIXME
					callbacks.error("Ooops: " + json["error"].code + " " + json["error"].reason);
					return;
				}
				var handleId = json.data["id"];
				Janus.log("Created handle: " + handleId);
				var pluginHandle = {
					session: that,
					plugin: plugin,
					id: handleId,
					token: handleToken,
					detached: false,
					webrtcStuff: {
						started: false,
						myStream: null,
						streamExternal: false,
						remoteStream: null,
						mySdp: null,
						mediaConstraints: null,
						pc: null,
						dataChannel: null,
						dtmfSender: null,
						trickle: true,
						iceDone: false,
						volume: {
							value: null,
							timer: null
						},
						bitrate: {
							value: null,
							bsnow: null,
							bsbefore: null,
							tsnow: null,
							tsbefore: null,
							timer: null
						}
					},
					getId: function getId() {
						return handleId;
					},
					getPlugin: function getPlugin() {
						return plugin;
					},
					getVolume: function getVolume() {
						return _getVolume(handleId);
					},
					isAudioMuted: function isAudioMuted() {
						return isMuted(handleId, false);
					},
					muteAudio: function muteAudio() {
						return mute(handleId, false, true);
					},
					unmuteAudio: function unmuteAudio() {
						return mute(handleId, false, false);
					},
					isVideoMuted: function isVideoMuted() {
						return isMuted(handleId, true);
					},
					muteVideo: function muteVideo() {
						return mute(handleId, true, true);
					},
					unmuteVideo: function unmuteVideo() {
						return mute(handleId, true, false);
					},
					getBitrate: function getBitrate() {
						return _getBitrate(handleId);
					},
					send: function send(callbacks) {
						sendMessage(handleId, callbacks);
					},
					data: function data(callbacks) {
						sendData(handleId, callbacks);
					},
					dtmf: function dtmf(callbacks) {
						sendDtmf(handleId, callbacks);
					},
					consentDialog: callbacks.consentDialog,
					iceState: callbacks.iceState,
					mediaState: callbacks.mediaState,
					webrtcState: callbacks.webrtcState,
					slowLink: callbacks.slowLink,
					onmessage: callbacks.onmessage,
					createOffer: function createOffer(callbacks) {
						prepareWebrtc(handleId, callbacks);
					},
					createAnswer: function createAnswer(callbacks) {
						prepareWebrtc(handleId, callbacks);
					},
					handleRemoteJsep: function handleRemoteJsep(callbacks) {
						prepareWebrtcPeer(handleId, callbacks);
					},
					onlocalstream: callbacks.onlocalstream,
					onremotestream: callbacks.onremotestream,
					ondata: callbacks.ondata,
					ondataopen: callbacks.ondataopen,
					oncleanup: callbacks.oncleanup,
					ondetached: callbacks.ondetached,
					hangup: function hangup(sendRequest) {
						cleanupWebrtc(handleId, sendRequest === true);
					},
					detach: function detach(callbacks) {
						destroyHandle(handleId, callbacks);
					}
				};
				pluginHandles[handleId] = pluginHandle;
				callbacks.success(pluginHandle);
			};
			request["session_id"] = sessionId;
			ws.send(JSON.stringify(request));
			return;
		}
		Janus.httpAPICall(server + "/" + sessionId, {
			verb: 'POST',
			withCredentials: withCredentials,
			body: request,
			success: function success(json) {
				Janus.debug(json);
				if (json["janus"] !== "success") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason); // FIXME
					callbacks.error("Ooops: " + json["error"].code + " " + json["error"].reason);
					return;
				}
				var handleId = json.data["id"];
				Janus.log("Created handle: " + handleId);
				var pluginHandle = {
					session: that,
					plugin: plugin,
					id: handleId,
					token: handleToken,
					detached: false,
					webrtcStuff: {
						started: false,
						myStream: null,
						streamExternal: false,
						remoteStream: null,
						mySdp: null,
						mediaConstraints: null,
						pc: null,
						dataChannel: null,
						dtmfSender: null,
						trickle: true,
						iceDone: false,
						volume: {
							value: null,
							timer: null
						},
						bitrate: {
							value: null,
							bsnow: null,
							bsbefore: null,
							tsnow: null,
							tsbefore: null,
							timer: null
						}
					},
					getId: function getId() {
						return handleId;
					},
					getPlugin: function getPlugin() {
						return plugin;
					},
					getVolume: function getVolume() {
						return _getVolume(handleId);
					},
					isAudioMuted: function isAudioMuted() {
						return isMuted(handleId, false);
					},
					muteAudio: function muteAudio() {
						return mute(handleId, false, true);
					},
					unmuteAudio: function unmuteAudio() {
						return mute(handleId, false, false);
					},
					isVideoMuted: function isVideoMuted() {
						return isMuted(handleId, true);
					},
					muteVideo: function muteVideo() {
						return mute(handleId, true, true);
					},
					unmuteVideo: function unmuteVideo() {
						return mute(handleId, true, false);
					},
					getBitrate: function getBitrate() {
						return _getBitrate(handleId);
					},
					send: function send(callbacks) {
						sendMessage(handleId, callbacks);
					},
					data: function data(callbacks) {
						sendData(handleId, callbacks);
					},
					dtmf: function dtmf(callbacks) {
						sendDtmf(handleId, callbacks);
					},
					consentDialog: callbacks.consentDialog,
					iceState: callbacks.iceState,
					mediaState: callbacks.mediaState,
					webrtcState: callbacks.webrtcState,
					slowLink: callbacks.slowLink,
					onmessage: callbacks.onmessage,
					createOffer: function createOffer(callbacks) {
						prepareWebrtc(handleId, callbacks);
					},
					createAnswer: function createAnswer(callbacks) {
						prepareWebrtc(handleId, callbacks);
					},
					handleRemoteJsep: function handleRemoteJsep(callbacks) {
						prepareWebrtcPeer(handleId, callbacks);
					},
					onlocalstream: callbacks.onlocalstream,
					onremotestream: callbacks.onremotestream,
					ondata: callbacks.ondata,
					ondataopen: callbacks.ondataopen,
					oncleanup: callbacks.oncleanup,
					ondetached: callbacks.ondetached,
					hangup: function hangup(sendRequest) {
						cleanupWebrtc(handleId, sendRequest === true);
					},
					detach: function detach(callbacks) {
						destroyHandle(handleId, callbacks);
					}
				};
				pluginHandles[handleId] = pluginHandle;
				callbacks.success(pluginHandle);
			},
			error: function error(textStatus, errorThrown) {
				Janus.error(textStatus + ":", errorThrown); // FIXME
			}
		});
	}

	// Private method to send a message
	function sendMessage(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = typeof callbacks.success == "function" ? callbacks.success : Janus.noop;
		callbacks.error = typeof callbacks.error == "function" ? callbacks.error : Janus.noop;
		if (!connected) {
			Janus.warn("Is the gateway down? (connected=false)");
			callbacks.error("Is the gateway down? (connected=false)");
			return;
		}
		var pluginHandle = pluginHandles[handleId];
		if (pluginHandle === null || pluginHandle === undefined || pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var message = callbacks.message;
		var jsep = callbacks.jsep;
		var transaction = Janus.randomString(12);
		var request = { "janus": "message", "body": message, "transaction": transaction };
		if (pluginHandle.token !== null && pluginHandle.token !== undefined) request["token"] = pluginHandle.token;
		if (apisecret !== null && apisecret !== undefined) request["apisecret"] = apisecret;
		if (jsep !== null && jsep !== undefined) request.jsep = jsep;
		Janus.debug("Sending message to plugin (handle=" + handleId + "):");
		Janus.debug(request);
		if (websockets) {
			request["session_id"] = sessionId;
			request["handle_id"] = handleId;
			transactions[transaction] = function (json) {
				Janus.debug("Message sent!");
				Janus.debug(json);
				if (json["janus"] === "success") {
					// We got a success, must have been a synchronous transaction
					var plugindata = json["plugindata"];
					if (plugindata === undefined || plugindata === null) {
						Janus.warn("Request succeeded, but missing plugindata...");
						callbacks.success();
						return;
					}
					Janus.log("Synchronous transaction successful (" + plugindata["plugin"] + ")");
					var data = plugindata["data"];
					Janus.debug(data);
					callbacks.success(data);
					return;
				} else if (json["janus"] !== "ack") {
					// Not a success and not an ack, must be an error
					if (json["error"] !== undefined && json["error"] !== null) {
						Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason); // FIXME
						callbacks.error(json["error"].code + " " + json["error"].reason);
					} else {
						Janus.error("Unknown error"); // FIXME
						callbacks.error("Unknown error");
					}
					return;
				}
				// If we got here, the plugin decided to handle the request asynchronously
				callbacks.success();
			};
			ws.send(JSON.stringify(request));
			return;
		}
		Janus.httpAPICall(server + "/" + sessionId + "/" + handleId, {
			verb: 'POST',
			withCredentials: withCredentials,
			body: request,
			success: function success(json) {
				Janus.debug("Message sent!");
				Janus.debug(json);
				if (json["janus"] === "success") {
					// We got a success, must have been a synchronous transaction
					var plugindata = json["plugindata"];
					if (plugindata === undefined || plugindata === null) {
						Janus.warn("Request succeeded, but missing plugindata...");
						callbacks.success();
						return;
					}
					Janus.log("Synchronous transaction successful (" + plugindata["plugin"] + ")");
					var data = plugindata["data"];
					Janus.debug(data);
					callbacks.success(data);
					return;
				} else if (json["janus"] !== "ack") {
					// Not a success and not an ack, must be an error
					if (json["error"] !== undefined && json["error"] !== null) {
						Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason); // FIXME
						callbacks.error(json["error"].code + " " + json["error"].reason);
					} else {
						Janus.error("Unknown error"); // FIXME
						callbacks.error("Unknown error");
					}
					return;
				}
				// If we got here, the plugin decided to handle the request asynchronously
				callbacks.success();
			},
			error: function error(textStatus, errorThrown) {
				Janus.error(textStatus + ":", errorThrown); // FIXME
				callbacks.error(textStatus + ": " + errorThrown);
			}
		});
	}

	// Private method to send a trickle candidate
	function sendTrickleCandidate(handleId, candidate) {
		if (!connected) {
			Janus.warn("Is the gateway down? (connected=false)");
			return;
		}
		var pluginHandle = pluginHandles[handleId];
		if (pluginHandle === null || pluginHandle === undefined || pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var request = { "janus": "trickle", "candidate": candidate, "transaction": Janus.randomString(12) };
		if (pluginHandle.token !== null && pluginHandle.token !== undefined) request["token"] = pluginHandle.token;
		if (apisecret !== null && apisecret !== undefined) request["apisecret"] = apisecret;
		Janus.vdebug("Sending trickle candidate (handle=" + handleId + "):");
		Janus.vdebug(request);
		if (websockets) {
			request["session_id"] = sessionId;
			request["handle_id"] = handleId;
			ws.send(JSON.stringify(request));
			return;
		}
		Janus.httpAPICall(server + "/" + sessionId + "/" + handleId, {
			verb: 'POST',
			withCredentials: withCredentials,
			body: request,
			success: function success(json) {
				Janus.vdebug("Candidate sent!");
				Janus.vdebug(json);
				if (json["janus"] !== "ack") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason); // FIXME
					return;
				}
			},
			error: function error(textStatus, errorThrown) {
				Janus.error(textStatus + ":", errorThrown); // FIXME
			}
		});
	}

	// Private method to send a data channel message
	function sendData(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = typeof callbacks.success == "function" ? callbacks.success : Janus.noop;
		callbacks.error = typeof callbacks.error == "function" ? callbacks.error : Janus.noop;
		var pluginHandle = pluginHandles[handleId];
		if (pluginHandle === null || pluginHandle === undefined || pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		var text = callbacks.text;
		if (text === null || text === undefined) {
			Janus.warn("Invalid text");
			callbacks.error("Invalid text");
			return;
		}
		Janus.log("Sending string on data channel: " + text);
		config.dataChannel.send(text);
		callbacks.success();
	}

	// Private method to send a DTMF tone
	function sendDtmf(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = typeof callbacks.success == "function" ? callbacks.success : Janus.noop;
		callbacks.error = typeof callbacks.error == "function" ? callbacks.error : Janus.noop;
		var pluginHandle = pluginHandles[handleId];
		if (pluginHandle === null || pluginHandle === undefined || pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		if (config.dtmfSender === null || config.dtmfSender === undefined) {
			// Create the DTMF sender the proper way, if possible
			if (config.pc !== undefined && config.pc !== null) {
				var senders = config.pc.getSenders();
				var audioSender = senders.find(function (sender) {
					return sender.track && sender.track.kind === 'audio';
				});
				if (!audioSender) {
					Janus.warn("Invalid DTMF configuration (no audio track)");
					callbacks.error("Invalid DTMF configuration (no audio track)");
					return;
				}
				config.dtmfSender = audioSender.dtmf;
				if (config.dtmfSender) {
					Janus.log("Created DTMF Sender");
					config.dtmfSender.ontonechange = function (tone) {
						Janus.debug("Sent DTMF tone: " + tone.tone);
					};
				}
			}
			if (config.dtmfSender === null || config.dtmfSender === undefined) {
				Janus.warn("Invalid DTMF configuration");
				callbacks.error("Invalid DTMF configuration");
				return;
			}
		}
		var dtmf = callbacks.dtmf;
		if (dtmf === null || dtmf === undefined) {
			Janus.warn("Invalid DTMF parameters");
			callbacks.error("Invalid DTMF parameters");
			return;
		}
		var tones = dtmf.tones;
		if (tones === null || tones === undefined) {
			Janus.warn("Invalid DTMF string");
			callbacks.error("Invalid DTMF string");
			return;
		}
		var duration = dtmf.duration;
		if (duration === null || duration === undefined) duration = 500; // We choose 500ms as the default duration for a tone
		var gap = dtmf.gap;
		if (gap === null || gap === undefined) gap = 50; // We choose 50ms as the default gap between tones
		Janus.debug("Sending DTMF string " + tones + " (duration " + duration + "ms, gap " + gap + "ms)");
		config.dtmfSender.insertDTMF(tones, duration, gap);
	}

	// Private method to destroy a plugin handle
	function destroyHandle(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = typeof callbacks.success == "function" ? callbacks.success : Janus.noop;
		callbacks.error = typeof callbacks.error == "function" ? callbacks.error : Janus.noop;
		var asyncRequest = true;
		if (callbacks.asyncRequest !== undefined && callbacks.asyncRequest !== null) asyncRequest = callbacks.asyncRequest === true;
		Janus.log("Destroying handle " + handleId + " (async=" + asyncRequest + ")");
		cleanupWebrtc(handleId);
		var pluginHandle = pluginHandles[handleId];
		if (pluginHandle === null || pluginHandle === undefined || pluginHandle.detached) {
			// Plugin was already detached by Janus, calling detach again will return a handle not found error, so just exit here
			delete pluginHandles[handleId];
			callbacks.success();
			return;
		}
		if (!connected) {
			Janus.warn("Is the gateway down? (connected=false)");
			callbacks.error("Is the gateway down? (connected=false)");
			return;
		}
		var request = { "janus": "detach", "transaction": Janus.randomString(12) };
		if (pluginHandle.token !== null && pluginHandle.token !== undefined) request["token"] = pluginHandle.token;
		if (apisecret !== null && apisecret !== undefined) request["apisecret"] = apisecret;
		if (websockets) {
			request["session_id"] = sessionId;
			request["handle_id"] = handleId;
			ws.send(JSON.stringify(request));
			delete pluginHandles[handleId];
			callbacks.success();
			return;
		}
		Janus.httpAPICall(server + "/" + sessionId + "/" + handleId, {
			verb: 'POST',
			async: asyncRequest, // Sometimes we need false here, or destroying in onbeforeunload won't work
			withCredentials: withCredentials,
			body: request,
			success: function success(json) {
				Janus.log("Destroyed handle:");
				Janus.debug(json);
				if (json["janus"] !== "success") {
					Janus.error("Ooops: " + json["error"].code + " " + json["error"].reason); // FIXME
				}
				delete pluginHandles[handleId];
				callbacks.success();
			},
			error: function error(textStatus, errorThrown) {
				Janus.error(textStatus + ":", errorThrown); // FIXME
				// We cleanup anyway
				delete pluginHandles[handleId];
				callbacks.success();
			}
		});
	}

	// WebRTC stuff
	function streamsDone(handleId, jsep, media, callbacks, stream) {
		var pluginHandle = pluginHandles[handleId];
		if (pluginHandle === null || pluginHandle === undefined || pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		Janus.debug("streamsDone:", stream);
		if (stream) {
			Janus.debug("  -- Audio tracks:", stream.getAudioTracks());
			Janus.debug("  -- Video tracks:", stream.getVideoTracks());
		}
		// We're now capturing the new stream: check if we're updating or if it's a new thing
		var addTracks = false;
		if (!config.myStream || !media.update || config.streamExternal) {
			config.myStream = stream;
			addTracks = true;
		} else {
			// We only need to update the existing stream
			if ((!media.update && isAudioSendEnabled(media) || media.update && (media.addAudio || media.replaceAudio)) && stream.getAudioTracks() && stream.getAudioTracks().length) {
				config.myStream.addTrack(stream.getAudioTracks()[0]);
				if (media.replaceAudio && Janus.webRTCAdapter.browserDetails.browser === "firefox") {
					Janus.log("Replacing audio track:", stream.getAudioTracks()[0]);
					for (var index in config.pc.getSenders()) {
						var s = config.pc.getSenders()[index];
						if (s && s.track && s.track.kind === "audio") {
							s.replaceTrack(stream.getAudioTracks()[0]);
						}
					}
				} else {
					if (Janus.webRTCAdapter.browserDetails.browser === "firefox" && Janus.webRTCAdapter.browserDetails.version >= 59) {
						// Firefox >= 59 uses Transceivers
						Janus.log((media.replaceVideo ? "Replacing" : "Adding") + " video track:", stream.getVideoTracks()[0]);
						var audioTransceiver = null;
						var transceivers = config.pc.getTransceivers();
						if (transceivers && transceivers.length > 0) {
							for (var i in transceivers) {
								var t = transceivers[i];
								if (t.sender && t.sender.track && t.sender.track.kind === "audio" || t.receiver && t.receiver.track && t.receiver.track.kind === "audio") {
									audioTransceiver = t;
									break;
								}
							}
						}
						if (audioTransceiver && audioTransceiver.sender) {
							audioTransceiver.sender.replaceTrack(stream.getVideoTracks()[0]);
						} else {
							config.pc.addTrack(stream.getVideoTracks()[0], stream);
						}
					} else {
						Janus.log((media.replaceAudio ? "Replacing" : "Adding") + " audio track:", stream.getAudioTracks()[0]);
						config.pc.addTrack(stream.getAudioTracks()[0], stream);
					}
				}
			}
			if ((!media.update && isVideoSendEnabled(media) || media.update && (media.addVideo || media.replaceVideo)) && stream.getVideoTracks() && stream.getVideoTracks().length) {
				config.myStream.addTrack(stream.getVideoTracks()[0]);
				if (media.replaceVideo && Janus.webRTCAdapter.browserDetails.browser === "firefox") {
					Janus.log("Replacing video track:", stream.getVideoTracks()[0]);
					for (var index in config.pc.getSenders()) {
						var s = config.pc.getSenders()[index];
						if (s && s.track && s.track.kind === "video") {
							s.replaceTrack(stream.getVideoTracks()[0]);
						}
					}
				} else {
					if (Janus.webRTCAdapter.browserDetails.browser === "firefox" && Janus.webRTCAdapter.browserDetails.version >= 59) {
						// Firefox >= 59 uses Transceivers
						Janus.log((media.replaceVideo ? "Replacing" : "Adding") + " video track:", stream.getVideoTracks()[0]);
						var videoTransceiver = null;
						var transceivers = config.pc.getTransceivers();
						if (transceivers && transceivers.length > 0) {
							for (var i in transceivers) {
								var t = transceivers[i];
								if (t.sender && t.sender.track && t.sender.track.kind === "video" || t.receiver && t.receiver.track && t.receiver.track.kind === "video") {
									videoTransceiver = t;
									break;
								}
							}
						}
						if (videoTransceiver && videoTransceiver.sender) {
							videoTransceiver.sender.replaceTrack(stream.getVideoTracks()[0]);
						} else {
							config.pc.addTrack(stream.getVideoTracks()[0], stream);
						}
					} else {
						Janus.log((media.replaceVideo ? "Replacing" : "Adding") + " video track:", stream.getVideoTracks()[0]);
						config.pc.addTrack(stream.getVideoTracks()[0], stream);
					}
				}
			}
		}
		// If we still need to create a PeerConnection, let's do that
		if (!config.pc) {
			var pc_config = { "iceServers": iceServers, "iceTransportPolicy": iceTransportPolicy, "bundlePolicy": bundlePolicy };
			//~ var pc_constraints = {'mandatory': {'MozDontOfferDataChannel':true}};
			var pc_constraints = {
				"optional": [{ "DtlsSrtpKeyAgreement": true }]
			};
			if (ipv6Support === true) {
				// FIXME This is only supported in Chrome right now
				// For support in Firefox track this: https://bugzilla.mozilla.org/show_bug.cgi?id=797262
				pc_constraints.optional.push({ "googIPv6": true });
			}
			// Any custom constraint to add?
			if (callbacks.rtcConstraints && _typeof(callbacks.rtcConstraints) === 'object') {
				Janus.debug("Adding custom PeerConnection constraints:", callbacks.rtcConstraints);
				for (var i in callbacks.rtcConstraints) {
					pc_constraints.optional.push(callbacks.rtcConstraints[i]);
				}
			}
			if (Janus.webRTCAdapter.browserDetails.browser === "edge") {
				// This is Edge, enable BUNDLE explicitly
				pc_config.bundlePolicy = "max-bundle";
			}
			Janus.log("Creating PeerConnection");
			Janus.debug(pc_constraints);
			config.pc = new RTCPeerConnection(pc_config, pc_constraints);
			Janus.debug(config.pc);
			if (config.pc.getStats) {
				// FIXME
				config.volume.value = 0;
				config.bitrate.value = "0 kbits/sec";
			}
			Janus.log("Preparing local SDP and gathering candidates (trickle=" + config.trickle + ")");
			config.pc.oniceconnectionstatechange = function (e) {
				if (config.pc) pluginHandle.iceState(config.pc.iceConnectionState);
			};
			config.pc.onicecandidate = function (event) {
				if (event.candidate == null || Janus.webRTCAdapter.browserDetails.browser === 'edge' && event.candidate.candidate.indexOf('endOfCandidates') > 0) {
					Janus.log("End of candidates.");
					config.iceDone = true;
					if (config.trickle === true) {
						// Notify end of candidates
						sendTrickleCandidate(handleId, { "completed": true });
					} else {
						// No trickle, time to send the complete SDP (including all candidates)
						sendSDP(handleId, callbacks);
					}
				} else {
					// JSON.stringify doesn't work on some WebRTC objects anymore
					// See https://code.google.com/p/chromium/issues/detail?id=467366
					var candidate = {
						"candidate": event.candidate.candidate,
						"sdpMid": event.candidate.sdpMid,
						"sdpMLineIndex": event.candidate.sdpMLineIndex
					};
					if (config.trickle === true) {
						// Send candidate
						sendTrickleCandidate(handleId, candidate);
					}
				}
			};
			config.pc.ontrack = function (event) {
				Janus.log("Handling Remote Track");
				Janus.debug(event);
				if (!event.streams) return;
				config.remoteStream = event.streams[0];
				pluginHandle.onremotestream(config.remoteStream);
				if (event.track && !event.track.onended) {
					Janus.log("Adding onended callback to track:", event.track);
					event.track.onended = function (ev) {
						Janus.log("Remote track removed:", ev);
						if (config.remoteStream) {
							config.remoteStream.removeTrack(ev.target);
							pluginHandle.onremotestream(config.remoteStream);
						}
					};
				}
			};
		}
		if (addTracks && stream !== null && stream !== undefined) {
			Janus.log('Adding local stream');
			stream.getTracks().forEach(function (track) {
				Janus.log('Adding local track:', track);
				config.pc.addTrack(track, stream);
			});
		}
		// Any data channel to create?
		if (isDataEnabled(media) && !config.dataChannel) {
			Janus.log("Creating data channel");
			var onDataChannelMessage = function onDataChannelMessage(event) {
				Janus.log('Received message on data channel: ' + event.data);
				pluginHandle.ondata(event.data); // FIXME
			};
			var onDataChannelStateChange = function onDataChannelStateChange() {
				var dcState = config.dataChannel !== null ? config.dataChannel.readyState : "null";
				Janus.log('State change on data channel: ' + dcState);
				if (dcState === 'open') {
					pluginHandle.ondataopen(); // FIXME
				}
			};
			var onDataChannelError = function onDataChannelError(error) {
				Janus.error('Got error on data channel:', error);
				// TODO
			};
			// Until we implement the proxying of open requests within the Janus core, we open a channel ourselves whatever the case
			config.dataChannel = config.pc.createDataChannel("JanusDataChannel", { ordered: false }); // FIXME Add options (ordered, maxRetransmits, etc.)
			config.dataChannel.onmessage = onDataChannelMessage;
			config.dataChannel.onopen = onDataChannelStateChange;
			config.dataChannel.onclose = onDataChannelStateChange;
			config.dataChannel.onerror = onDataChannelError;
		}
		// If there's a new local stream, let's notify the application
		if (config.myStream) pluginHandle.onlocalstream(config.myStream);
		// Create offer/answer now
		if (jsep === null || jsep === undefined) {
			createOffer(handleId, media, callbacks);
		} else {
			config.pc.setRemoteDescription(new RTCSessionDescription(jsep), function () {
				Janus.log("Remote description accepted!");
				config.remoteSdp = jsep.sdp;
				// Any trickle candidate we cached?
				if (config.candidates && config.candidates.length > 0) {
					for (var i in config.candidates) {
						var candidate = config.candidates[i];
						Janus.debug("Adding remote candidate:", candidate);
						if (!candidate || candidate.completed === true) {
							// end-of-candidates
							config.pc.addIceCandidate();
						} else {
							// New candidate
							config.pc.addIceCandidate(new RTCIceCandidate(candidate));
						}
					}
					config.candidates = [];
				}
				// Create the answer now
				createAnswer(handleId, media, callbacks);
			}, callbacks.error);
		}
	}

	function prepareWebrtc(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = typeof callbacks.success == "function" ? callbacks.success : Janus.noop;
		callbacks.error = typeof callbacks.error == "function" ? callbacks.error : webrtcError;
		var jsep = callbacks.jsep;
		callbacks.media = callbacks.media || { audio: true, video: true };
		var media = callbacks.media;
		var pluginHandle = pluginHandles[handleId];
		if (pluginHandle === null || pluginHandle === undefined || pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		config.trickle = isTrickleEnabled(callbacks.trickle);
		// Are we updating a session?
		if (config.pc === undefined || config.pc === null) {
			// Nope, new PeerConnection
			media.update = false;
		} else if (config.pc !== undefined && config.pc !== null) {
			Janus.log("Updating existing media session");
			media.update = true;
			// Check if there's anything do add/remove/replace, or if we
			// can go directly to preparing the new SDP offer or answer
			if (callbacks.stream !== null && callbacks.stream !== undefined) {
				// External stream: is this the same as the one we were using before?
				if (callbacks.stream !== config.myStream) {
					Janus.log("Renegotiation involves a new external stream");
				}
			} else {
				// Check if there are changes on audio
				if (media.addAudio) {
					media.replaceAudio = false;
					media.removeAudio = false;
					media.audioSend = true;
					if (config.myStream && config.myStream.getAudioTracks() && config.myStream.getAudioTracks().length) {
						Janus.error("Can't add audio stream, there already is one");
						callbacks.error("Can't add audio stream, there already is one");
						return;
					}
				} else if (media.removeAudio) {
					media.replaceAudio = false;
					media.addAudio = false;
					media.audioSend = false;
				} else if (media.replaceAudio) {
					media.addAudio = false;
					media.removeAudio = false;
					media.audioSend = true;
				}
				if (config.myStream === null || config.myStream === undefined) {
					// No media stream: if we were asked to replace, it's actually an "add"
					if (media.replaceAudio) {
						media.replaceAudio = false;
						media.addAudio = true;
						media.audioSend = true;
					}
					if (isAudioSendEnabled(media)) media.addAudio = true;
				} else {
					if (config.myStream.getAudioTracks() === null || config.myStream.getAudioTracks() === undefined || config.myStream.getAudioTracks().length === 0) {
						// No audio track: if we were asked to replace, it's actually an "add"
						if (media.replaceAudio) {
							media.replaceAudio = false;
							media.addAudio = true;
							media.audioSend = true;
						}
						if (isAudioSendEnabled(media)) media.addAudio = true;
					}
				}
				// Check if there are changes on video
				if (media.addVideo) {
					media.replaceVideo = false;
					media.removeVideo = false;
					media.videoSend = true;
					if (config.myStream && config.myStream.getVideoTracks() && config.myStream.getVideoTracks().length) {
						Janus.error("Can't add video stream, there already is one");
						callbacks.error("Can't add video stream, there already is one");
						return;
					}
				} else if (media.removeVideo) {
					media.replaceVideo = false;
					media.addVideo = false;
					media.videoSend = false;
				} else if (media.replaceVideo) {
					media.addVideo = false;
					media.removeVideo = false;
					media.videoSend = true;
				}
				if (config.myStream === null || config.myStream === undefined) {
					// No media stream: if we were asked to replace, it's actually an "add"
					if (media.replaceVideo) {
						media.replaceVideo = false;
						media.addVideo = true;
						media.videoSend = true;
					}
					if (isVideoSendEnabled(media)) media.addVideo = true;
				} else {
					if (config.myStream.getVideoTracks() === null || config.myStream.getVideoTracks() === undefined || config.myStream.getVideoTracks().length === 0) {
						// No video track: if we were asked to replace, it's actually an "add"
						if (media.replaceVideo) {
							media.replaceVideo = false;
							media.addVideo = true;
							media.videoSend = true;
						}
						if (isVideoSendEnabled(media)) media.addVideo = true;
					}
				}
				// Data channels can only be added
				if (media.addData) media.data = true;
			}
		}
		// If we're updating, check if we need to remove/replace one of the tracks
		if (media.update && !config.streamExternal) {
			if (media.removeAudio || media.replaceAudio) {
				if (config.myStream && config.myStream.getAudioTracks() && config.myStream.getAudioTracks().length) {
					var s = config.myStream.getAudioTracks()[0];
					Janus.log("Removing audio track:", s);
					config.myStream.removeTrack(s);
					try {
						s.stop();
					} catch (e) {};
				}
				if (config.pc.getSenders() && config.pc.getSenders().length) {
					var ra = true;
					if (media.replaceAudio && Janus.webRTCAdapter.browserDetails.browser === "firefox") {
						// On Firefox we can use replaceTrack
						ra = false;
					}
					if (ra) {
						for (var index in config.pc.getSenders()) {
							var s = config.pc.getSenders()[index];
							if (s && s.track && s.track.kind === "audio") {
								Janus.log("Removing audio sender:", s);
								config.pc.removeTrack(s);
							}
						}
					}
				}
			}
			if (media.removeVideo || media.replaceVideo) {
				if (config.myStream && config.myStream.getVideoTracks() && config.myStream.getVideoTracks().length) {
					var s = config.myStream.getVideoTracks()[0];
					Janus.log("Removing video track:", s);
					config.myStream.removeTrack(s);
					try {
						s.stop();
					} catch (e) {};
				}
				if (config.pc.getSenders() && config.pc.getSenders().length) {
					var rv = true;
					if (media.replaceVideo && Janus.webRTCAdapter.browserDetails.browser === "firefox") {
						// On Firefox we can use replaceTrack
						rv = false;
					}
					if (rv) {
						for (var index in config.pc.getSenders()) {
							var s = config.pc.getSenders()[index];
							if (s && s.track && s.track.kind === "video") {
								Janus.log("Removing video sender:", s);
								config.pc.removeTrack(s);
							}
						}
					}
				}
			}
		}
		// Was a MediaStream object passed, or do we need to take care of that?
		if (callbacks.stream !== null && callbacks.stream !== undefined) {
			var stream = callbacks.stream;
			Janus.log("MediaStream provided by the application");
			Janus.debug(stream);
			// If this is an update, let's check if we need to release the previous stream
			if (media.update) {
				if (config.myStream && config.myStream !== callbacks.stream && !config.streamExternal) {
					// We're replacing a stream we captured ourselves with an external one
					try {
						// Try a MediaStreamTrack.stop() for each track
						var tracks = config.myStream.getTracks();
						for (var i in tracks) {
							var mst = tracks[i];
							Janus.log(mst);
							if (mst !== null && mst !== undefined) mst.stop();
						}
					} catch (e) {
						// Do nothing if this fails
					}
					config.myStream = null;
				}
			}
			// Skip the getUserMedia part
			config.streamExternal = true;
			streamsDone(handleId, jsep, media, callbacks, stream);
			return;
		}
		if (isAudioSendEnabled(media) || isVideoSendEnabled(media)) {
			var constraints = { mandatory: {}, optional: [] };
			pluginHandle.consentDialog(true);
			var audioSupport = isAudioSendEnabled(media);
			if (audioSupport === true && media != undefined && media != null) {
				if (_typeof(media.audio) === 'object') {
					audioSupport = media.audio;
				}
			}
			var videoSupport = isVideoSendEnabled(media);
			if (videoSupport === true && media != undefined && media != null) {
				var simulcast = callbacks.simulcast === true ? true : false;
				if (simulcast && !jsep && (media.video === undefined || media.video === false)) media.video = "hires";
				if (media.video && media.video != 'screen' && media.video != 'window') {
					if (_typeof(media.video) === 'object') {
						videoSupport = media.video;
					} else {
						var width = 0;
						var height = 0,
						    maxHeight = 0;
						if (media.video === 'lowres') {
							// Small resolution, 4:3
							height = 240;
							maxHeight = 240;
							width = 320;
						} else if (media.video === 'lowres-16:9') {
							// Small resolution, 16:9
							height = 180;
							maxHeight = 180;
							width = 320;
						} else if (media.video === 'hires' || media.video === 'hires-16:9' || media.video === 'hdres') {
							// High(HD) resolution is only 16:9
							height = 720;
							maxHeight = 720;
							width = 1280;
						} else if (media.video === 'fhdres') {
							// Full HD resolution is only 16:9
							height = 1080;
							maxHeight = 1080;
							width = 1920;
						} else if (media.video === '4kres') {
							// 4K resolution is only 16:9
							height = 2160;
							maxHeight = 2160;
							width = 3840;
						} else if (media.video === 'stdres') {
							// Normal resolution, 4:3
							height = 480;
							maxHeight = 480;
							width = 640;
						} else if (media.video === 'stdres-16:9') {
							// Normal resolution, 16:9
							height = 360;
							maxHeight = 360;
							width = 640;
						} else {
							Janus.log("Default video setting is stdres 4:3");
							height = 480;
							maxHeight = 480;
							width = 640;
						}
						Janus.log("Adding media constraint:", media.video);
						videoSupport = {
							'height': { 'ideal': height },
							'width': { 'ideal': width }
						};
						Janus.log("Adding video constraint:", videoSupport);
					}
				} else if (media.video === 'screen' || media.video === 'window') {
					// We're going to try and use the extension for Chrome 34+, the old approach
					// for older versions of Chrome, or the experimental support in Firefox 33+
					var callbackUserMedia = function callbackUserMedia(error, stream) {
						pluginHandle.consentDialog(false);
						if (error) {
							callbacks.error(error);
						} else {
							streamsDone(handleId, jsep, media, callbacks, stream);
						}
					};

					var getScreenMedia = function getScreenMedia(constraints, gsmCallback, useAudio) {
						Janus.log("Adding media constraint (screen capture)");
						Janus.debug(constraints);
						navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
							if (useAudio) {
								navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function (audioStream) {
									stream.addTrack(audioStream.getAudioTracks()[0]);
									gsmCallback(null, stream);
								});
							} else {
								gsmCallback(null, stream);
							}
						}).catch(function (error) {
							pluginHandle.consentDialog(false);gsmCallback(error);
						});
					};

					if (!media.screenshareFrameRate) {
						media.screenshareFrameRate = 3;
					}
					// Not a webcam, but screen capture
					if (window.location.protocol !== 'https:') {
						// Screen sharing mandates HTTPS
						Janus.warn("Screen sharing only works on HTTPS, try the https:// version of this page");
						pluginHandle.consentDialog(false);
						callbacks.error("Screen sharing only works on HTTPS, try the https:// version of this page");
						return;
					};
					;
					if (Janus.webRTCAdapter.browserDetails.browser === 'chrome') {
						var chromever = Janus.webRTCAdapter.browserDetails.version;
						var maxver = 33;
						if (window.navigator.userAgent.match('Linux')) maxver = 35; // "known" crash in chrome 34 and 35 on linux
						if (chromever >= 26 && chromever <= maxver) {
							// Chrome 26->33 requires some awkward chrome://flags manipulation
							constraints = {
								video: {
									mandatory: {
										googLeakyBucket: true,
										maxWidth: window.screen.width,
										maxHeight: window.screen.height,
										minFrameRate: media.screenshareFrameRate,
										maxFrameRate: media.screenshareFrameRate,
										chromeMediaSource: 'screen'
									}
								},
								audio: isAudioSendEnabled(media)
							};
							getScreenMedia(constraints, callbackUserMedia);
						} else {
							// Chrome 34+ requires an extension
							Janus.extension.getScreen(function (error, sourceId) {
								if (error) {
									pluginHandle.consentDialog(false);
									return callbacks.error(error);
								}
								constraints = {
									audio: false,
									video: {
										mandatory: {
											chromeMediaSource: 'desktop',
											maxWidth: window.screen.width,
											maxHeight: window.screen.height,
											minFrameRate: media.screenshareFrameRate,
											maxFrameRate: media.screenshareFrameRate
										},
										optional: [{ googLeakyBucket: true }, { googTemporalLayeredScreencast: true }]
									}
								};
								constraints.video.mandatory.chromeMediaSourceId = event.data.sourceId;
								getScreenMedia(constraints, callbackUserMedia, isAudioSendEnabled(media));
							});
						}
					} else if (window.navigator.userAgent.match('Firefox')) {
						var ffver = parseInt(window.navigator.userAgent.match(/Firefox\/(.*)/)[1], 10);
						if (ffver >= 33) {
							// Firefox 33+ has experimental support for screen sharing
							constraints = {
								video: {
									mozMediaSource: media.video,
									mediaSource: media.video
								},
								audio: isAudioSendEnabled(media)
							};
							getScreenMedia(constraints, function (err, stream) {
								callbackUserMedia(err, stream);
								// Workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1045810
								if (!err) {
									var lastTime = stream.currentTime;
									var polly = window.setInterval(function () {
										if (!stream) window.clearInterval(polly);
										if (stream.currentTime == lastTime) {
											window.clearInterval(polly);
											if (stream.onended) {
												stream.onended();
											}
										}
										lastTime = stream.currentTime;
									}, 500);
								}
							});
						} else {
							var error = new Error('NavigatorUserMediaError');
							error.name = 'Your version of Firefox does not support screen sharing, please install Firefox 33 (or more recent versions)';
							pluginHandle.consentDialog(false);
							callbacks.error(error);
							return;
						}
					}
					return;
				}
			}
			// If we got here, we're not screensharing
			if (media === null || media === undefined || media.video !== 'screen') {
				// Check whether all media sources are actually available or not
				navigator.mediaDevices.enumerateDevices().then(function (devices) {
					var audioExist = devices.some(function (device) {
						return device.kind === 'audioinput';
					}),
					    videoExist = devices.some(function (device) {
						return device.kind === 'videoinput';
					});

					// Check whether a missing device is really a problem
					var audioSend = isAudioSendEnabled(media);
					var videoSend = isVideoSendEnabled(media);
					var needAudioDevice = isAudioSendRequired(media);
					var needVideoDevice = isVideoSendRequired(media);
					if (audioSend || videoSend || needAudioDevice || needVideoDevice) {
						// We need to send either audio or video
						var haveAudioDevice = audioSend ? audioExist : false;
						var haveVideoDevice = videoSend ? videoExist : false;
						if (!haveAudioDevice && !haveVideoDevice) {
							// FIXME Should we really give up, or just assume recvonly for both?
							pluginHandle.consentDialog(false);
							callbacks.error('No capture device found');
							return false;
						} else if (!haveAudioDevice && needAudioDevice) {
							pluginHandle.consentDialog(false);
							callbacks.error('Audio capture is required, but no capture device found');
							return false;
						} else if (!haveVideoDevice && needVideoDevice) {
							pluginHandle.consentDialog(false);
							callbacks.error('Video capture is required, but no capture device found');
							return false;
						}
					}

					var gumConstraints = {
						audio: audioExist ? audioSupport : false,
						video: videoExist ? videoSupport : false
					};
					Janus.debug("getUserMedia constraints", gumConstraints);
					navigator.mediaDevices.getUserMedia(gumConstraints).then(function (stream) {
						pluginHandle.consentDialog(false);streamsDone(handleId, jsep, media, callbacks, stream);
					}).catch(function (error) {
						pluginHandle.consentDialog(false);callbacks.error({ code: error.code, name: error.name, message: error.message });
					});
				}).catch(function (error) {
					pluginHandle.consentDialog(false);
					callbacks.error('enumerateDevices error', error);
				});
			}
		} else {
			// No need to do a getUserMedia, create offer/answer right away
			streamsDone(handleId, jsep, media, callbacks);
		}
	}

	function prepareWebrtcPeer(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = typeof callbacks.success == "function" ? callbacks.success : Janus.noop;
		callbacks.error = typeof callbacks.error == "function" ? callbacks.error : webrtcError;
		var jsep = callbacks.jsep;
		var pluginHandle = pluginHandles[handleId];
		if (pluginHandle === null || pluginHandle === undefined || pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		if (jsep !== undefined && jsep !== null) {
			if (config.pc === null) {
				Janus.warn("Wait, no PeerConnection?? if this is an answer, use createAnswer and not handleRemoteJsep");
				callbacks.error("No PeerConnection: if this is an answer, use createAnswer and not handleRemoteJsep");
				return;
			}
			config.pc.setRemoteDescription(new RTCSessionDescription(jsep), function () {
				Janus.log("Remote description accepted!");
				config.remoteSdp = jsep.sdp;
				// Any trickle candidate we cached?
				if (config.candidates && config.candidates.length > 0) {
					for (var i in config.candidates) {
						var candidate = config.candidates[i];
						Janus.debug("Adding remote candidate:", candidate);
						if (!candidate || candidate.completed === true) {
							// end-of-candidates
							config.pc.addIceCandidate();
						} else {
							// New candidate
							config.pc.addIceCandidate(new RTCIceCandidate(candidate));
						}
					}
					config.candidates = [];
				}
				// Done
				callbacks.success();
			}, callbacks.error);
		} else {
			callbacks.error("Invalid JSEP");
		}
	}

	function createOffer(handleId, media, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = typeof callbacks.success == "function" ? callbacks.success : Janus.noop;
		callbacks.error = typeof callbacks.error == "function" ? callbacks.error : Janus.noop;
		var pluginHandle = pluginHandles[handleId];
		if (pluginHandle === null || pluginHandle === undefined || pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		var simulcast = callbacks.simulcast === true ? true : false;
		if (!simulcast) {
			Janus.log("Creating offer (iceDone=" + config.iceDone + ")");
		} else {
			Janus.log("Creating offer (iceDone=" + config.iceDone + ", simulcast=" + simulcast + ")");
		}
		// https://code.google.com/p/webrtc/issues/detail?id=3508
		var mediaConstraints = {};
		if (Janus.webRTCAdapter.browserDetails.browser === "firefox" && Janus.webRTCAdapter.browserDetails.version >= 59) {
			// Firefox >= 59 uses Transceivers
			var audioTransceiver = null,
			    videoTransceiver = null;
			var transceivers = config.pc.getTransceivers();
			if (transceivers && transceivers.length > 0) {
				for (var i in transceivers) {
					var t = transceivers[i];
					if (t.sender && t.sender.track && t.sender.track.kind === "audio" || t.receiver && t.receiver.track && t.receiver.track.kind === "audio") {
						if (!audioTransceiver) audioTransceiver = t;
						continue;
					}
					if (t.sender && t.sender.track && t.sender.track.kind === "video" || t.receiver && t.receiver.track && t.receiver.track.kind === "video") {
						if (!videoTransceiver) videoTransceiver = t;
						continue;
					}
				}
			}
			// Handle audio (and related changes, if any)
			var audioSend = isAudioSendEnabled(media);
			var audioRecv = isAudioRecvEnabled(media);
			if (!audioSend && !audioRecv) {
				// Audio disabled: have we removed it?
				if (media.removeAudio && audioTransceiver) {
					audioTransceiver.direction = "inactive";
					Janus.log("Setting audio transceiver to inactive:", audioTransceiver);
				}
			} else {
				// Take care of audio m-line
				if (audioSend && audioRecv) {
					if (audioTransceiver) {
						audioTransceiver.direction = "sendrecv";
						Janus.log("Setting audio transceiver to sendrecv:", audioTransceiver);
					}
				} else if (audioSend && !audioRecv) {
					if (audioTransceiver) {
						audioTransceiver.direction = "sendonly";
						Janus.log("Setting audio transceiver to sendonly:", audioTransceiver);
					}
				} else if (!audioSend && audioRecv) {
					if (audioTransceiver) {
						audioTransceiver.direction = "recvonly";
						Janus.log("Setting audio transceiver to recvonly:", audioTransceiver);
					} else {
						// In theory, this is the only case where we might not have a transceiver yet
						audioTransceiver = config.pc.addTransceiver("audio", { direction: "recvonly" });
						Janus.log("Adding recvonly audio transceiver:", audioTransceiver);
					}
				}
			}
			// Handle video (and related changes, if any)
			var videoSend = isVideoSendEnabled(media);
			var videoRecv = isVideoRecvEnabled(media);
			if (!videoSend && !videoRecv) {
				// Video disabled: have we removed it?
				if (media.removeVideo && videoTransceiver) {
					videoTransceiver.direction = "inactive";
					Janus.log("Setting video transceiver to inactive:", videoTransceiver);
				}
			} else {
				// Take care of video m-line
				if (videoSend && videoRecv) {
					if (videoTransceiver) {
						videoTransceiver.direction = "sendrecv";
						Janus.log("Setting video transceiver to sendrecv:", videoTransceiver);
					}
				} else if (videoSend && !videoRecv) {
					if (videoTransceiver) {
						videoTransceiver.direction = "sendonly";
						Janus.log("Setting video transceiver to sendonly:", videoTransceiver);
					}
				} else if (!videoSend && videoRecv) {
					if (videoTransceiver) {
						videoTransceiver.direction = "recvonly";
						Janus.log("Setting video transceiver to recvonly:", videoTransceiver);
					} else {
						// In theory, this is the only case where we might not have a transceiver yet
						videoTransceiver = config.pc.addTransceiver("video", { direction: "recvonly" });
						Janus.log("Adding recvonly video transceiver:", videoTransceiver);
					}
				}
			}
		} else {
			mediaConstraints["offerToReceiveAudio"] = isAudioRecvEnabled(media);
			mediaConstraints["offerToReceiveVideo"] = isVideoRecvEnabled(media);
		}
		var iceRestart = callbacks.iceRestart === true ? true : false;
		if (iceRestart) {
			mediaConstraints["iceRestart"] = true;
		}
		Janus.debug(mediaConstraints);
		// Check if this is Firefox and we've been asked to do simulcasting
		var sendVideo = isVideoSendEnabled(media);
		if (sendVideo && simulcast && Janus.webRTCAdapter.browserDetails.browser === "firefox") {
			// FIXME Based on https://gist.github.com/voluntas/088bc3cc62094730647b
			Janus.log("Enabling Simulcasting for Firefox (RID)");
			var sender = config.pc.getSenders()[1];
			Janus.log(sender);
			var parameters = sender.getParameters();
			Janus.log(parameters);
			sender.setParameters({ encodings: [{ rid: "high", active: true, priority: "high", maxBitrate: 1000000 }, { rid: "medium", active: true, priority: "medium", maxBitrate: 300000 }, { rid: "low", active: true, priority: "low", maxBitrate: 100000 }] });
		}
		config.pc.createOffer(function (offer) {
			Janus.debug(offer);
			Janus.log("Setting local description");
			if (sendVideo && simulcast) {
				// This SDP munging only works with Chrome
				if (Janus.webRTCAdapter.browserDetails.browser === "chrome") {
					Janus.log("Enabling Simulcasting for Chrome (SDP munging)");
					offer.sdp = mungeSdpForSimulcasting(offer.sdp);
				} else if (Janus.webRTCAdapter.browserDetails.browser !== "firefox") {
					Janus.warn("simulcast=true, but this is not Chrome nor Firefox, ignoring");
				}
			}
			config.mySdp = offer.sdp;
			config.pc.setLocalDescription(offer);
			config.mediaConstraints = mediaConstraints;
			if (!config.iceDone && !config.trickle) {
				// Don't do anything until we have all candidates
				Janus.log("Waiting for all candidates...");
				return;
			}
			Janus.log("Offer ready");
			Janus.debug(callbacks);
			// JSON.stringify doesn't work on some WebRTC objects anymore
			// See https://code.google.com/p/chromium/issues/detail?id=467366
			var jsep = {
				"type": offer.type,
				"sdp": offer.sdp
			};
			callbacks.success(jsep);
		}, callbacks.error, mediaConstraints);
	}

	function createAnswer(handleId, media, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = typeof callbacks.success == "function" ? callbacks.success : Janus.noop;
		callbacks.error = typeof callbacks.error == "function" ? callbacks.error : Janus.noop;
		var pluginHandle = pluginHandles[handleId];
		if (pluginHandle === null || pluginHandle === undefined || pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			callbacks.error("Invalid handle");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		var simulcast = callbacks.simulcast === true ? true : false;
		if (!simulcast) {
			Janus.log("Creating answer (iceDone=" + config.iceDone + ")");
		} else {
			Janus.log("Creating answer (iceDone=" + config.iceDone + ", simulcast=" + simulcast + ")");
		}
		var mediaConstraints = null;
		if (Janus.webRTCAdapter.browserDetails.browser === "firefox" && Janus.webRTCAdapter.browserDetails.version >= 59) {
			// Firefox >= 59 uses Transceivers
			mediaConstraints = {};
			var audioTransceiver = null,
			    videoTransceiver = null;
			var transceivers = config.pc.getTransceivers();
			if (transceivers && transceivers.length > 0) {
				for (var i in transceivers) {
					var t = transceivers[i];
					if (t.sender && t.sender.track && t.sender.track.kind === "audio" || t.receiver && t.receiver.track && t.receiver.track.kind === "audio") {
						if (!audioTransceiver) audioTransceiver = t;
						continue;
					}
					if (t.sender && t.sender.track && t.sender.track.kind === "video" || t.receiver && t.receiver.track && t.receiver.track.kind === "video") {
						if (!videoTransceiver) videoTransceiver = t;
						continue;
					}
				}
			}
			// Handle audio (and related changes, if any)
			var audioSend = isAudioSendEnabled(media);
			var audioRecv = isAudioRecvEnabled(media);
			if (!audioSend && !audioRecv) {
				// Audio disabled: have we removed it?
				if (media.removeAudio && audioTransceiver) {
					audioTransceiver.direction = "inactive";
					Janus.log("Setting audio transceiver to inactive:", audioTransceiver);
				}
			} else {
				// Take care of audio m-line
				if (audioSend && audioRecv) {
					if (audioTransceiver) {
						audioTransceiver.direction = "sendrecv";
						Janus.log("Setting audio transceiver to sendrecv:", audioTransceiver);
					}
				} else if (audioSend && !audioRecv) {
					if (audioTransceiver) {
						audioTransceiver.direction = "sendonly";
						Janus.log("Setting audio transceiver to sendonly:", audioTransceiver);
					}
				} else if (!audioSend && audioRecv) {
					if (audioTransceiver) {
						audioTransceiver.direction = "recvonly";
						Janus.log("Setting audio transceiver to recvonly:", audioTransceiver);
					} else {
						// In theory, this is the only case where we might not have a transceiver yet
						audioTransceiver = config.pc.addTransceiver("audio", { direction: "recvonly" });
						Janus.log("Adding recvonly audio transceiver:", audioTransceiver);
					}
				}
			}
			// Handle video (and related changes, if any)
			var videoSend = isVideoSendEnabled(media);
			var videoRecv = isVideoRecvEnabled(media);
			if (!videoSend && !videoRecv) {
				// Video disabled: have we removed it?
				if (media.removeVideo && videoTransceiver) {
					videoTransceiver.direction = "inactive";
					Janus.log("Setting video transceiver to inactive:", videoTransceiver);
				}
			} else {
				// Take care of video m-line
				if (videoSend && videoRecv) {
					if (videoTransceiver) {
						videoTransceiver.direction = "sendrecv";
						Janus.log("Setting video transceiver to sendrecv:", videoTransceiver);
					}
				} else if (videoSend && !videoRecv) {
					if (videoTransceiver) {
						videoTransceiver.direction = "sendonly";
						Janus.log("Setting video transceiver to sendonly:", videoTransceiver);
					}
				} else if (!videoSend && videoRecv) {
					if (videoTransceiver) {
						videoTransceiver.direction = "recvonly";
						Janus.log("Setting video transceiver to recvonly:", videoTransceiver);
					} else {
						// In theory, this is the only case where we might not have a transceiver yet
						videoTransceiver = config.pc.addTransceiver("video", { direction: "recvonly" });
						Janus.log("Adding recvonly video transceiver:", videoTransceiver);
					}
				}
			}
		} else {
			if (Janus.webRTCAdapter.browserDetails.browser == "firefox" || Janus.webRTCAdapter.browserDetails.browser == "edge") {
				mediaConstraints = {
					offerToReceiveAudio: isAudioRecvEnabled(media),
					offerToReceiveVideo: isVideoRecvEnabled(media)
				};
			} else {
				mediaConstraints = {
					mandatory: {
						OfferToReceiveAudio: isAudioRecvEnabled(media),
						OfferToReceiveVideo: isVideoRecvEnabled(media)
					}
				};
			}
		}
		Janus.debug(mediaConstraints);
		// Check if this is Firefox and we've been asked to do simulcasting
		var sendVideo = isVideoSendEnabled(media);
		if (sendVideo && simulcast && Janus.webRTCAdapter.browserDetails.browser === "firefox") {
			// FIXME Based on https://gist.github.com/voluntas/088bc3cc62094730647b
			Janus.log("Enabling Simulcasting for Firefox (RID)");
			var sender = config.pc.getSenders()[1];
			Janus.log(sender);
			var parameters = sender.getParameters();
			Janus.log(parameters);
			sender.setParameters({ encodings: [{ rid: "high", active: true, priority: "high", maxBitrate: 1000000 }, { rid: "medium", active: true, priority: "medium", maxBitrate: 300000 }, { rid: "low", active: true, priority: "low", maxBitrate: 100000 }] });
		}
		config.pc.createAnswer(function (answer) {
			Janus.debug(answer);
			Janus.log("Setting local description");
			if (sendVideo && simulcast) {
				// This SDP munging only works with Chrome
				if (Janus.webRTCAdapter.browserDetails.browser === "chrome") {
					// FIXME Apparently trying to simulcast when answering breaks video in Chrome...
					//~ Janus.log("Enabling Simulcasting for Chrome (SDP munging)");
					//~ answer.sdp = mungeSdpForSimulcasting(answer.sdp);
					Janus.warn("simulcast=true, but this is an answer, and video breaks in Chrome if we enable it");
				} else if (Janus.webRTCAdapter.browserDetails.browser !== "firefox") {
					Janus.warn("simulcast=true, but this is not Chrome nor Firefox, ignoring");
				}
			}
			config.mySdp = answer.sdp;
			config.pc.setLocalDescription(answer);
			config.mediaConstraints = mediaConstraints;
			if (!config.iceDone && !config.trickle) {
				// Don't do anything until we have all candidates
				Janus.log("Waiting for all candidates...");
				return;
			}
			// JSON.stringify doesn't work on some WebRTC objects anymore
			// See https://code.google.com/p/chromium/issues/detail?id=467366
			var jsep = {
				"type": answer.type,
				"sdp": answer.sdp
			};
			callbacks.success(jsep);
		}, callbacks.error, mediaConstraints);
	}

	function sendSDP(handleId, callbacks) {
		callbacks = callbacks || {};
		callbacks.success = typeof callbacks.success == "function" ? callbacks.success : Janus.noop;
		callbacks.error = typeof callbacks.error == "function" ? callbacks.error : Janus.noop;
		var pluginHandle = pluginHandles[handleId];
		if (pluginHandle === null || pluginHandle === undefined || pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle, not sending anything");
			return;
		}
		var config = pluginHandle.webrtcStuff;
		Janus.log("Sending offer/answer SDP...");
		if (config.mySdp === null || config.mySdp === undefined) {
			Janus.warn("Local SDP instance is invalid, not sending anything...");
			return;
		}
		config.mySdp = {
			"type": config.pc.localDescription.type,
			"sdp": config.pc.localDescription.sdp
		};
		if (config.trickle === false) config.mySdp["trickle"] = false;
		Janus.debug(callbacks);
		config.sdpSent = true;
		callbacks.success(config.mySdp);
	}

	function _getVolume(handleId) {
		var pluginHandle = pluginHandles[handleId];
		if (pluginHandle === null || pluginHandle === undefined || pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			return 0;
		}
		var config = pluginHandle.webrtcStuff;
		// Start getting the volume, if getStats is supported
		if (config.pc.getStats && Janus.webRTCAdapter.browserDetails.browser == "chrome") {
			// FIXME
			if (config.remoteStream === null || config.remoteStream === undefined) {
				Janus.warn("Remote stream unavailable");
				return 0;
			}
			// http://webrtc.googlecode.com/svn/trunk/samples/js/demos/html/constraints-and-stats.html
			if (config.volume.timer === null || config.volume.timer === undefined) {
				Janus.log("Starting volume monitor");
				config.volume.timer = setInterval(function () {
					config.pc.getStats(function (stats) {
						var results = stats.result();
						for (var i = 0; i < results.length; i++) {
							var res = results[i];
							if (res.type == 'ssrc' && res.stat('audioOutputLevel')) {
								config.volume.value = res.stat('audioOutputLevel');
							}
						}
					});
				}, 200);
				return 0; // We don't have a volume to return yet
			}
			return config.volume.value;
		} else {
			Janus.log("Getting the remote volume unsupported by browser");
			return 0;
		}
	}

	function isMuted(handleId, video) {
		var pluginHandle = pluginHandles[handleId];
		if (pluginHandle === null || pluginHandle === undefined || pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			return true;
		}
		var config = pluginHandle.webrtcStuff;
		if (config.pc === null || config.pc === undefined) {
			Janus.warn("Invalid PeerConnection");
			return true;
		}
		if (config.myStream === undefined || config.myStream === null) {
			Janus.warn("Invalid local MediaStream");
			return true;
		}
		if (video) {
			// Check video track
			if (config.myStream.getVideoTracks() === null || config.myStream.getVideoTracks() === undefined || config.myStream.getVideoTracks().length === 0) {
				Janus.warn("No video track");
				return true;
			}
			return !config.myStream.getVideoTracks()[0].enabled;
		} else {
			// Check audio track
			if (config.myStream.getAudioTracks() === null || config.myStream.getAudioTracks() === undefined || config.myStream.getAudioTracks().length === 0) {
				Janus.warn("No audio track");
				return true;
			}
			return !config.myStream.getAudioTracks()[0].enabled;
		}
	}

	function mute(handleId, video, mute) {
		var pluginHandle = pluginHandles[handleId];
		if (pluginHandle === null || pluginHandle === undefined || pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			return false;
		}
		var config = pluginHandle.webrtcStuff;
		if (config.pc === null || config.pc === undefined) {
			Janus.warn("Invalid PeerConnection");
			return false;
		}
		if (config.myStream === undefined || config.myStream === null) {
			Janus.warn("Invalid local MediaStream");
			return false;
		}
		if (video) {
			// Mute/unmute video track
			if (config.myStream.getVideoTracks() === null || config.myStream.getVideoTracks() === undefined || config.myStream.getVideoTracks().length === 0) {
				Janus.warn("No video track");
				return false;
			}
			config.myStream.getVideoTracks()[0].enabled = mute ? false : true;
			return true;
		} else {
			// Mute/unmute audio track
			if (config.myStream.getAudioTracks() === null || config.myStream.getAudioTracks() === undefined || config.myStream.getAudioTracks().length === 0) {
				Janus.warn("No audio track");
				return false;
			}
			config.myStream.getAudioTracks()[0].enabled = mute ? false : true;
			return true;
		}
	}

	function _getBitrate(handleId) {
		var pluginHandle = pluginHandles[handleId];
		if (pluginHandle === null || pluginHandle === undefined || pluginHandle.webrtcStuff === null || pluginHandle.webrtcStuff === undefined) {
			Janus.warn("Invalid handle");
			return "Invalid handle";
		}
		var config = pluginHandle.webrtcStuff;
		if (config.pc === null || config.pc === undefined) return "Invalid PeerConnection";
		// Start getting the bitrate, if getStats is supported
		if (config.pc.getStats) {
			if (config.bitrate.timer === null || config.bitrate.timer === undefined) {
				Janus.log("Starting bitrate timer (via getStats)");
				config.bitrate.timer = setInterval(function () {
					config.pc.getStats().then(function (stats) {
						stats.forEach(function (res) {
							if (!res) return;
							var inStats = false;
							// Check if these are statistics on incoming media
							if ((res.mediaType === "video" || res.id.toLowerCase().indexOf("video") > -1) && res.type === "inbound-rtp" && res.id.indexOf("rtcp") < 0) {
								// New stats
								inStats = true;
							} else if (res.type == 'ssrc' && res.bytesReceived && (res.googCodecName === "VP8" || res.googCodecName === "")) {
								// Older Chromer versions
								inStats = true;
							}
							// Parse stats now
							if (inStats) {
								config.bitrate.bsnow = res.bytesReceived;
								config.bitrate.tsnow = res.timestamp;
								if (config.bitrate.bsbefore === null || config.bitrate.tsbefore === null) {
									// Skip this round
									config.bitrate.bsbefore = config.bitrate.bsnow;
									config.bitrate.tsbefore = config.bitrate.tsnow;
								} else {
									// Calculate bitrate
									var timePassed = config.bitrate.tsnow - config.bitrate.tsbefore;
									if (Janus.webRTCAdapter.browserDetails.browser == "safari") timePassed = timePassed / 1000; // Apparently the timestamp is in microseconds, in Safari
									var bitRate = Math.round((config.bitrate.bsnow - config.bitrate.bsbefore) * 8 / timePassed);
									config.bitrate.value = bitRate + ' kbits/sec';
									//~ Janus.log("Estimated bitrate is " + config.bitrate.value);
									config.bitrate.bsbefore = config.bitrate.bsnow;
									config.bitrate.tsbefore = config.bitrate.tsnow;
								}
							}
						});
					});
				}, 1000);
				return "0 kbits/sec"; // We don't have a bitrate value yet
			}
			return config.bitrate.value;
		} else {
			Janus.warn("Getting the video bitrate unsupported by browser");
			return "Feature unsupported by browser";
		}
	}

	function webrtcError(error) {
		Janus.error("WebRTC error:", error);
	}

	function cleanupWebrtc(handleId, hangupRequest) {
		Janus.log("Cleaning WebRTC stuff");
		var pluginHandle = pluginHandles[handleId];
		if (pluginHandle === null || pluginHandle === undefined) {
			// Nothing to clean
			return;
		}
		var config = pluginHandle.webrtcStuff;
		if (config !== null && config !== undefined) {
			if (hangupRequest === true) {
				// Send a hangup request (we don't really care about the response)
				var request = { "janus": "hangup", "transaction": Janus.randomString(12) };
				if (pluginHandle.token !== null && pluginHandle.token !== undefined) request["token"] = pluginHandle.token;
				if (apisecret !== null && apisecret !== undefined) request["apisecret"] = apisecret;
				Janus.debug("Sending hangup request (handle=" + handleId + "):");
				Janus.debug(request);
				if (websockets) {
					request["session_id"] = sessionId;
					request["handle_id"] = handleId;
					ws.send(JSON.stringify(request));
				} else {
					Janus.httpAPICall(server + "/" + sessionId + "/" + handleId, {
						verb: 'POST',
						withCredentials: withCredentials,
						body: request
					});
				}
			}
			// Cleanup stack
			config.remoteStream = null;
			if (config.volume.timer) clearInterval(config.volume.timer);
			config.volume.value = null;
			if (config.bitrate.timer) clearInterval(config.bitrate.timer);
			config.bitrate.timer = null;
			config.bitrate.bsnow = null;
			config.bitrate.bsbefore = null;
			config.bitrate.tsnow = null;
			config.bitrate.tsbefore = null;
			config.bitrate.value = null;
			try {
				// Try a MediaStreamTrack.stop() for each track
				if (!config.streamExternal && config.myStream !== null && config.myStream !== undefined) {
					Janus.log("Stopping local stream tracks");
					var tracks = config.myStream.getTracks();
					for (var i in tracks) {
						var mst = tracks[i];
						Janus.log(mst);
						if (mst !== null && mst !== undefined) mst.stop();
					}
				}
			} catch (e) {
				// Do nothing if this fails
			}
			config.streamExternal = false;
			config.myStream = null;
			// Close PeerConnection
			try {
				config.pc.close();
			} catch (e) {
				// Do nothing
			}
			config.pc = null;
			config.candidates = null;
			config.mySdp = null;
			config.remoteSdp = null;
			config.iceDone = false;
			config.dataChannel = null;
			config.dtmfSender = null;
		}
		pluginHandle.oncleanup();
	}

	// Helper method to munge an SDP to enable simulcasting (Chrome only)
	function mungeSdpForSimulcasting(sdp) {
		// Let's munge the SDP to add the attributes for enabling simulcasting
		// (based on https://gist.github.com/ggarber/a19b4c33510028b9c657)
		var lines = sdp.split("\r\n");
		var video = false;
		var ssrc = [-1],
		    ssrc_fid = [-1];
		var cname = null,
		    msid = null,
		    mslabel = null,
		    label = null;
		var insertAt = -1;
		for (var i = 0; i < lines.length; i++) {
			var mline = lines[i].match(/m=(\w+) */);
			if (mline) {
				var medium = mline[1];
				if (medium === "video") {
					// New video m-line: make sure it's the first one
					if (ssrc[0] < 0) {
						video = true;
					} else {
						// We're done, let's add the new attributes here
						insertAt = i;
						break;
					}
				} else {
					// New non-video m-line: do we have what we were looking for?
					if (ssrc[0] > -1) {
						// We're done, let's add the new attributes here
						insertAt = i;
						break;
					}
				}
				continue;
			}
			if (!video) continue;
			var fid = lines[i].match(/a=ssrc-group:FID (\d+) (\d+)/);
			if (fid) {
				ssrc[0] = fid[1];
				ssrc_fid[0] = fid[2];
				lines.splice(i, 1);i--;
				continue;
			}
			if (ssrc[0]) {
				var match = lines[i].match('a=ssrc:' + ssrc[0] + ' cname:(.+)');
				if (match) {
					cname = match[1];
				}
				match = lines[i].match('a=ssrc:' + ssrc[0] + ' msid:(.+)');
				if (match) {
					msid = match[1];
				}
				match = lines[i].match('a=ssrc:' + ssrc[0] + ' mslabel:(.+)');
				if (match) {
					mslabel = match[1];
				}
				match = lines[i].match('a=ssrc:' + ssrc + ' label:(.+)');
				if (match) {
					label = match[1];
				}
				if (lines[i].indexOf('a=ssrc:' + ssrc_fid) === 0) {
					lines.splice(i, 1);i--;
					continue;
				}
				if (lines[i].indexOf('a=ssrc:' + ssrc[0]) === 0) {
					lines.splice(i, 1);i--;
					continue;
				}
			}
			if (lines[i].length == 0) {
				lines.splice(i, 1);i--;
				continue;
			}
		}
		if (ssrc[0] < 0) {
			// Couldn't find a FID attribute, let's just take the first video SSRC we find
			insertAt = -1;
			video = false;
			for (var i = 0; i < lines.length; i++) {
				var mline = lines[i].match(/m=(\w+) */);
				if (mline) {
					var medium = mline[1];
					if (medium === "video") {
						// New video m-line: make sure it's the first one
						if (ssrc[0] < 0) {
							video = true;
						} else {
							// We're done, let's add the new attributes here
							insertAt = i;
							break;
						}
					} else {
						// New non-video m-line: do we have what we were looking for?
						if (ssrc[0] > -1) {
							// We're done, let's add the new attributes here
							insertAt = i;
							break;
						}
					}
					continue;
				}
				if (!video) continue;
				if (ssrc[0] < 0) {
					var value = lines[i].match(/a=ssrc:(\d+)/);
					if (value) {
						ssrc[0] = value[1];
						lines.splice(i, 1);i--;
						continue;
					}
				} else {
					var match = lines[i].match('a=ssrc:' + ssrc[0] + ' cname:(.+)');
					if (match) {
						cname = match[1];
					}
					match = lines[i].match('a=ssrc:' + ssrc[0] + ' msid:(.+)');
					if (match) {
						msid = match[1];
					}
					match = lines[i].match('a=ssrc:' + ssrc[0] + ' mslabel:(.+)');
					if (match) {
						mslabel = match[1];
					}
					match = lines[i].match('a=ssrc:' + ssrc[0] + ' label:(.+)');
					if (match) {
						label = match[1];
					}
					if (lines[i].indexOf('a=ssrc:' + ssrc_fid[0]) === 0) {
						lines.splice(i, 1);i--;
						continue;
					}
					if (lines[i].indexOf('a=ssrc:' + ssrc[0]) === 0) {
						lines.splice(i, 1);i--;
						continue;
					}
				}
				if (lines[i].length == 0) {
					lines.splice(i, 1);i--;
					continue;
				}
			}
		}
		if (ssrc[0] < 0) {
			// Still nothing, let's just return the SDP we were asked to munge
			Janus.warn("Couldn't find the video SSRC, simulcasting NOT enabled");
			return sdp;
		}
		if (insertAt < 0) {
			// Append at the end
			insertAt = lines.length;
		}
		// Generate a couple of SSRCs (for retransmissions too)
		// Note: should we check if there are conflicts, here?
		ssrc[1] = Math.floor(Math.random() * 0xFFFFFFFF);
		ssrc[2] = Math.floor(Math.random() * 0xFFFFFFFF);
		ssrc_fid[1] = Math.floor(Math.random() * 0xFFFFFFFF);
		ssrc_fid[2] = Math.floor(Math.random() * 0xFFFFFFFF);
		// Add attributes to the SDP
		for (var i = 0; i < ssrc.length; i++) {
			if (cname) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' cname:' + cname);
				insertAt++;
			}
			if (msid) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' msid:' + msid);
				insertAt++;
			}
			if (mslabel) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' mslabel:' + mslabel);
				insertAt++;
			}
			if (label) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc[i] + ' label:' + label);
				insertAt++;
			}
			// Add the same info for the retransmission SSRC
			if (cname) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' cname:' + cname);
				insertAt++;
			}
			if (msid) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' msid:' + msid);
				insertAt++;
			}
			if (mslabel) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' mslabel:' + mslabel);
				insertAt++;
			}
			if (label) {
				lines.splice(insertAt, 0, 'a=ssrc:' + ssrc_fid[i] + ' label:' + label);
				insertAt++;
			}
		}
		lines.splice(insertAt, 0, 'a=ssrc-group:FID ' + ssrc[2] + ' ' + ssrc_fid[2]);
		lines.splice(insertAt, 0, 'a=ssrc-group:FID ' + ssrc[1] + ' ' + ssrc_fid[1]);
		lines.splice(insertAt, 0, 'a=ssrc-group:FID ' + ssrc[0] + ' ' + ssrc_fid[0]);
		lines.splice(insertAt, 0, 'a=ssrc-group:SIM ' + ssrc[0] + ' ' + ssrc[1] + ' ' + ssrc[2]);
		sdp = lines.join("\r\n");
		if (!sdp.endsWith("\r\n")) sdp += "\r\n";
		return sdp;
	}

	// Helper methods to parse a media object
	function isAudioSendEnabled(media) {
		Janus.debug("isAudioSendEnabled:", media);
		if (media === undefined || media === null) return true; // Default
		if (media.audio === false) return false; // Generic audio has precedence
		if (media.audioSend === undefined || media.audioSend === null) return true; // Default
		return media.audioSend === true;
	}

	function isAudioSendRequired(media) {
		Janus.debug("isAudioSendRequired:", media);
		if (media === undefined || media === null) return false; // Default
		if (media.audio === false || media.audioSend === false) return false; // If we're not asking to capture audio, it's not required
		if (media.failIfNoAudio === undefined || media.failIfNoAudio === null) return false; // Default
		return media.failIfNoAudio === true;
	}

	function isAudioRecvEnabled(media) {
		Janus.debug("isAudioRecvEnabled:", media);
		if (media === undefined || media === null) return true; // Default
		if (media.audio === false) return false; // Generic audio has precedence
		if (media.audioRecv === undefined || media.audioRecv === null) return true; // Default
		return media.audioRecv === true;
	}

	function isVideoSendEnabled(media) {
		Janus.debug("isVideoSendEnabled:", media);
		if (media === undefined || media === null) return true; // Default
		if (media.video === false) return false; // Generic video has precedence
		if (media.videoSend === undefined || media.videoSend === null) return true; // Default
		return media.videoSend === true;
	}

	function isVideoSendRequired(media) {
		Janus.debug("isVideoSendRequired:", media);
		if (media === undefined || media === null) return false; // Default
		if (media.video === false || media.videoSend === false) return false; // If we're not asking to capture video, it's not required
		if (media.failIfNoVideo === undefined || media.failIfNoVideo === null) return false; // Default
		return media.failIfNoVideo === true;
	}

	function isVideoRecvEnabled(media) {
		Janus.debug("isVideoRecvEnabled:", media);
		if (media === undefined || media === null) return true; // Default
		if (media.video === false) return false; // Generic video has precedence
		if (media.videoRecv === undefined || media.videoRecv === null) return true; // Default
		return media.videoRecv === true;
	}

	function isDataEnabled(media) {
		Janus.debug("isDataEnabled:", media);
		if (Janus.webRTCAdapter.browserDetails.browser == "edge") {
			Janus.warn("Edge doesn't support data channels yet");
			return false;
		}
		if (media === undefined || media === null) return false; // Default
		return media.data === true;
	}

	function isTrickleEnabled(trickle) {
		Janus.debug("isTrickleEnabled:", trickle);
		if (trickle === undefined || trickle === null) return true; // Default is true
		return trickle === true;
	}
};

exports.default = Janus;

/***/ })
/******/ ]);
});