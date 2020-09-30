var assert = require('assert');
var should = require('should');
var expect = require('chai').expect;
var path = require('path');

import { prepareMockWebsocketServer } from './setup_ws_server.js';

import { WebSocket, Server } from 'mock-socket';

global.WebSocket = WebSocket;

import * as APIdaze from '../src/index.js';

describe('CLIENT', function() {
  describe('#new CLIENT() with empty configuration', function() {
    it("should throw exception  {ok: false, message: 'Please provide an apiKey', origin: 'CLIENT'}", function() {
      try {
        var client = new APIdaze.CLIENT({});
      } catch(error){
        expect(error).to.eql({ok: false, message: 'Please provide an apiKey', origin: 'CLIENT'});
      }
    });
  });

  describe('#new CLIENT({apiKey: "testapikey"}), valid apiKey and no region preference', function() {
    it("should have _wsUrl set with its default value", function(done) {
      this.timeout(50000);
      var client = new APIdaze.CLIENT({
        apiKey: "testingIfApiKeyIsValid",
        onReady: function(){
          expect(client._wsUrl).to.equal("wss://webrtc.apidaze.io:4062");

          client.shutdown();
          done();
        }
      });
    })
  });

  describe('#new CLIENT({apiKey: "testapikey"}), WebSocket URL with ws protocol', function() {
    it("should throw exception  {ok: false, message: 'Wrong WebSocket URL, must start with wss://', origin: 'CLIENT'}", function() {
      try {
        var client = new APIdaze.CLIENT({apiKey: "testapikey", wsurl: "ws://webrtc.apidaze.io:4062"});
      } catch(error){
        expect(error).to.eql({ok: false, message: 'Wrong WebSocket URL, must start with wss://', origin: 'CLIENT'});
      }
    });
  });

  describe('#new CLIENT({apiKey: "apiKeyWithoutExternalScript"}), No External Script configured', function() {
    it("should throw exception  {ok: false, message: Not allowed to login', origin: 'CLIENT'}", function(done) {
      var client = new APIdaze.CLIENT({
        apiKey: "apiKeyWithoutExternalScript",
        onError: function(error){
          console.log("Error : ", error);
          expect(error).to.eql("Not allowed to login");
          client.shutdown();
          done();
        }
      });
    });
  });

  describe('#new CLIENT({apiKey:"apiKeyIsValid", wsurl: "wss://webrtc.apidaze.io:4062"}), valid apiKey and WebSocket URL', function() {
    it("should call onReady handler if present", function(done) {
      var client = new APIdaze.CLIENT({
        apiKey: "testingIfApiKeyIsValid",
        onReady: function(){
          console.log("Ready");
          client.shutdown();
          done();
        }
      });
    });
  });

  describe.only('#new CLIENT({apiKey:"apiKeyIsValid", region: "us-west"}), valid apiKey and region', function() {
    before(() => {
      prepareMockWebsocketServer("wss://webrtc.us2.apidaze.io:4062")
    })

    it("should call onReady handler if present", function(done) {
      var client = new APIdaze.CLIENT({
        apiKey: "testingIfApiKeyIsValid",
        region: "us-west",
        onReady: function(){
          console.log("Ready");
          client.shutdown();
          done();
        }
      });
    });
  });
});
