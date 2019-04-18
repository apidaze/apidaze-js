import config from '../config.js';

describe('examples', () => {
  it('index page', () => {
    cy.visit('/');
    cy.get('body').should('contain', 'APIdaze JavaScript sample codes');
  });

  it('key check', () => {
    cy.visit('/');
    cy.get('[data-cy="key check"]').click();
    cy.get('#apikeyTextId').type(config.key);
    cy.get('#apikeyButtonId').click();
    cy.get('#output').should("contain", 'Toggling inputs');
    cy.get('#output').should("contain", 'Checking...');
    cy.get('#output').should("contain", 'handleWebSocketOpen | WebSocket opened');
    cy.get('#output').should("contain", `handleWebSocketMessage | C->S : {"wsp_version":"1","method":"ping","params":{"apiKey":"${config.key}","sessid":null,"userKeys":{}}}`);
    cy.get('#output').should("contain", 'message":"pong"');
    cy.get('#output').should("contain", '"method":"verto.clientReady"');
    cy.get('#output').should("contain", 'Ready');
  })

  it('login', () => {
    const stub = cy.stub()
    cy.on ('window:alert', stub);
    cy.visit('/');
    cy.get('[data-cy="login"]').click();
    cy.get('#apikeyTextId').type(config.key);
    cy.get('#userNameId').type("username");
    cy.get('#checkButtonId').click();
    cy.get('#output').should("contain", 'Toggling inputs');
    cy.get('#output').should("contain", 'Checking...');
    cy.get('#output').should("contain", 'handleWebSocketOpen | WebSocket opened');
    cy.get('#output').should("contain", `handleWebSocketMessage | C->S : {"wsp_version":"1","method":"ping","params":{"apiKey":"${config.key}","sessid":null,"userKeys":{"command":"auth","userid":"username"}}}`);
    cy.get('#output').should("contain", 'message":"pong"');
    cy.get('#output').should("contain", '"method":"verto.clientReady"');
    cy.get('#output').should("contain", '"id":"username"');
    cy.get('#output').should("contain", 'Ready');
    cy.wait(100).then(() => {
      expect(stub.getCall(0)).to.be.calledWith('Logged in as username !');
    });
  })

  it('round trip time', () => {
    cy.visit('/');
    cy.get('[data-cy="round-trip time"]').click();
    cy.get('#apikeyTextId').type(config.key);
    cy.get('#apikeyButtonId').click()
    cy.get('#output').should("contain", 'Toggling inputs');
    cy.get('#output').should("contain", 'Connecting...');
    cy.get('#output').should("contain", 'handleWebSocketOpen | WebSocket opened');
    cy.get('#output').should("contain", `handleWebSocketMessage | C->S : {"wsp_version":"1","method":"ping","params":{"apiKey":"${config.key}","sessid":null,"userKeys":{}}}`);
    cy.get('#output').should("contain", 'message":"pong"');
    cy.get('#output').should("contain", '"method":"verto.clientReady"');
    cy.get('#output').should("contain", 'Ready');
    cy.get('#output').should("contain", 'handleWebSocketMessage | C->S : {"wsp_version":"1","method":"echo","params":{"type":"echo_request"');
    cy.get('#output').should("contain", 'handleWebSocketMessage | S->C : {"wsp_version":"1","id":null,"result":{"type":"echo_request"');
    cy.get('#output').should("contain", 'handleEchoReply RTT');
  })

  it('send text', () => {
    cy.visit('/');
    cy.get('[data-cy="send text"]').click();
    cy.get('#apikeyTextId').type(config.key);
    cy.get('#textToSendId').type("test-string");
    cy.get('#sendTextButtonId').click();
    cy.get('#output').should("contain", 'Toggling inputs');
    cy.get('#output').should("contain", 'Checking...');
    cy.get('#output').should("contain", 'handleWebSocketOpen | WebSocket opened');
    cy.get('#output').should("contain", `handleWebSocketMessage | C->S : {"wsp_version":"1","method":"ping","params":{"apiKey":"${config.key}","sessid":null,"userKeys":{}}}`);
    cy.get('#output').should("contain", 'message":"pong"');
    cy.get('#output').should("contain", '"method":"verto.clientReady"');
    cy.get('#output').should("contain", 'Ready');
    cy.get('#output').should("contain", 'handleWebSocketMessage | C->S : {"wsp_version":"1","method":"verto.info","params":{"type":"sendtext_request","text":"test-string","userKeys":{}}}');
    cy.get('#output').should("contain", 'handleWebSocketMessage | S->C : {"wsp_version":"1","id":null,"result":{"type":"sendtext_request","httpCode":200,"ok":true,"message":"External Script returned code [200] with no data","content":"","data":{}');
    cy.get('#output').should("contain", 'handleSendTextReply{"wsp_version":"1","id":null,"result":{"type":"sendtext_request","httpCode":200,"ok":true,"message":"External Script returned code [200] with no data","content":"","data":{}');
    const stub = cy.stub();
    cy.on ('window:alert', stub);
    cy.wait(100).then(() => {
      expect(stub.getCall(0)).to.be.calledWith('{\n    "httpCode": 200,\n    "ok": true,\n    "message": "External Script returned code [200] with no data",\n    "data": {}\n}');
    });
  })

  it('receive text', () => {
    cy.visit('/');
    cy.get('[data-cy="receive text"]').click();
    cy.get('#apikeyTextId').type(config.key);
    cy.get('#userNameId').type("username");
    cy.get('#checkButtonId').click();
    cy.get('#output').should("contain", 'Toggling inputs');
    cy.get('#output').should("contain", 'Checking...');
    cy.get('#output').should("contain", 'handleWebSocketOpen | WebSocket opened');
    cy.get('#output').should("contain", `handleWebSocketMessage | C->S : {"wsp_version":"1","method":"ping","params":{"apiKey":"${config.key}","sessid":null,"userKeys":{"command":"auth","userid":"username"}}}`);
    cy.get('#output').should("contain", 'message":"pong"');
    cy.get('#output').should("contain", '"method":"verto.clientReady"');
    cy.get('#output').should("contain", '"id":"username"');
    cy.get('#output').should("contain", 'Ready');
  })

  it.only('join conference', () => {
    cy.visit('/');
    cy.get('[data-cy="join conference"]').click();
    cy.get('#apikeyTextId').type(config.key);
    cy.get('#checkButtonId').click();
    cy.get('#output').should("contain", 'Checking...');
    cy.get('#output').should("contain", 'handleWebSocketOpen | WebSocket opened');
    cy.get('#output').should("contain", `handleWebSocketMessage | C->S : {"wsp_version":"1","method":"ping","params":{"apiKey":"${config.key}","sessid":null,"userKeys":{}}}`);
    cy.get('#output').should("contain", 'message":"pong"');
    cy.get('#output').should("contain", '"method":"verto.clientReady"');
    cy.get('#output').should("contain", 'Ready');
    cy.get('#joinRoomButtonId').click();
    cy.get('#output').should("contain", 'Call | Inserting HTML5 <video/> element (audio only) to APIdaze tag');
    cy.get('#output').should("contain", 'Call | GUM constraints : {"audio":true}');
    cy.get('#output').should("contain", 'Call | Found devices');
    cy.get('#output').should("contain", 'Call | WebRTC Ok');
    cy.get('#output').should("contain", 'Call | Creating RTCPeerConnection...');
    cy.get('#output').should("contain", 'Call | Added local stream to peerConnection');
    cy.get('#output').should("contain", 'Call | Local SDP');
    cy.get('#output').should("contain", 'Call | Setting description to local peerConnection');
    cy.get('#output').should("contain", 'Call | WebRTC set up, ready to start call');
    cy.get('#output').should("contain", 'Call | ICE candidate received');
    cy.get('#output').should("contain", 'Call | Got all our ICE candidates (from onicegatheringstatechange), thanks!');
    cy.get('#output').should("contain", 'Call | Sending message');
    cy.get('#output').should("contain", 'handleWebSocketMessage | C->S : {"wsp_version":"1","method":"call"');
    cy.get('#output').should("contain", 'handleWebSocketMessage | S->C : {"wsp_version":"1","id":null,"result":{"message":"CALL CREATED"');
    cy.get('#output').should("contain", 'Got CALL CREATED event');
    cy.get('#output').should("contain", 'Call created with callID');
    cy.get('#output').should("contain", '"method":"answer"');
    cy.get('#output').should("contain", 'Found call index : 0');
    cy.get('#output').should("contain", 'Call | Answer');
    cy.get('#output').should("contain", 'Call | ICE State : checking');
    cy.get('#output').should("contain", 'Call | ICE state change event');
    cy.get('#output').should("contain", 'Call | Received remote stream');
    cy.get('#output').should("contain", 'Call | ICE State : connected');
    cy.get('#output').should("contain", 'Call | ICE State : completed');
    cy.get('#output').should("contain", '"method":"event","params":{"pvtData":{"action":"conference-liveArray-join"');
    cy.get('#output').should("contain", 'Received event of type channelPvtData');
    cy.get('#output').should("contain", 'Event channel UUID');
    cy.get('#output').should("contain", 'Event channel');
    cy.get('#output').should("contain", 'Need to handle simple event');
    cy.get('#output').should("contain", 'handleWebSocketMessage | C->S : {"wsp_version":"1","method":"verto.subscribe","id":"subscribe_message');
    cy.get('#output').should("contain", 'handleWebSocketMessage | C->S : {"wsp_version":"1","method":"jsapi","id":"conference_list_command');
    cy.get('#output').should("contain", 'handleWebSocketMessage | S->C : {"wsp_version":"1","id":"subscribe_message');
    cy.get('#output').should("contain", 'Found valid subscribedChannels[] array');
    cy.get('#output').should("contain", 'handleWebSocketMessage | S->C : {"wsp_version":"1","id":"conference_list_command');
    cy.get('#output').should("contain", 'Got members {"wsp_version":"1","id":"conference_list_command');
    cy.get('#output').should("contain", 'Call | Initial list of members');
    cy.get('#output').should("contain", 'Got members for this room');
    cy.get('#output').should("contain", '"method":"event","params":{"data":{"action":"modify"');
    cy.get('#output').should("contain", 'Received event of type undefined');
    cy.get('#output').should("contain", 'Event channel UUID : undefined');
    cy.get('#output').should("contain", 'Event channel : conference-liveArray');
    cy.get('#output').should("contain", 'event.params.data : {"action":"modify"');
    cy.get('#output').should("contain", 'Call | Talk event');
    cy.get('#output').should("contain", 'Start/stop talking event from a member : {"type":"room.talking"');
    cy.get('#leaveRoomButtonId').click();
    cy.get('#output').should("contain", 'Call | Hangup call with callID');
    cy.get('#output').should("contain", 'handleWebSocketMessage | C->S : {"wsp_version":"1","method":"verto.unsubscribe","id":"unsubscribe_message","params":{"eventChannel":["conference-liveArray');
    cy.get('#output').should("contain", 'C->S : {"wsp_version":"1","method":"hangup","id":"unsubscribe_message","params":{"callID"');
    cy.get('#output').should("contain", 'S->C : {"wsp_version":"1","id":"unsubscribe_message","result":{"unsubscribedChannels":["conference-liveArray');
    cy.get('#output').should("contain", '"message":"CALL ENDED","causeCode":16,"cause":"NORMAL_CLEARING"');
    cy.get('#output').should("contain", 'Got CALL ENDED event');
    cy.get('#output').should("contain", 'Call ended with callID');
    cy.get('#output').should("contain", 'Call | Call hungup');
    cy.get('#output').should("contain", 'I left the room');
    cy.get('#output').should("contain", 'Call | peerConnection is null, call has been hungup ?');
    cy.get('#output').should("contain", '"method":"event","params":{"pvtData":{"action":"conference-liveArray-part","laChannel":"conference-liveArray');
    cy.get('#output').should("contain", 'Received event of type channelPvtData');
  })

});
