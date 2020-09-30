import { Server } from 'mock-socket';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function invalidExternalScriptResponse() {
	return {
		wsp_version: 1,
		id: null,
		error: {
			code: -32602,
			message: "Permission denied, please activate or check your External Script URL"
		}
	}
}

function genericPongResponse(sessid) {
	return {
		wsp_version: 1,
		id: null,
		result: {
			message: "pong",
			sessid: sessid
		}
	}
}

function clientReadyResponse(sessid) {
	return {
		wsp_version: 1,
		id: 11925,
		method: "verto.clientReady",
		params: {
			reattached_sessions:[],
			id: sessid,
			sessid: sessid
		}
	}
}

export function prepareMockWebsocketServer(serverUrl) {
	const mockServer = new Server(serverUrl);
	mockServer.on('connection', (server) => {
		console.log("[WsServer] Got connection");
	});

	mockServer.on('message', (JSONMessage) => {
		const parsedMessage = JSON.parse(JSONMessage);
		const params = parsedMessage.params;
		const sessid = uuidv4();


		var answer = {};
		answer.wsp_version = 1;
		answer.id = null;

		console.log("[WsServer] received message :", JSONMessage);
		switch (params.apiKey) {
			case "apiKeyWithoutExternalScript":{
				console.log("[WsServer] No External Script for this apiKey");
				mockServer.send(JSON.stringify(invalidExternalScriptResponse()))
				break;
			}
			case "testingIfApiKeyIsValid": {
				console.log("[WsServer] Valid API key");
				// API key validated
				mockServer.send(JSON.stringify(genericPongResponse(sessid)));
				mockServer.send(JSON.stringify(clientReadyResponse(sessid)))
				break;
			}
			default: {
				console.log("[WsServer] apiKey is valid")
			}
		}
	});
}

before(()  => prepareMockWebsocketServer('wss://webrtc.apidaze.io:4062'));
