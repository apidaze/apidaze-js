var assert = require('assert');
var should = require('should');
var expect = require('chai').expect;
var path = require('path');

require('./setup_ws_server.js');

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
    it("should throw exception  {ok: false, message: 'Please provide an apiKey', origin: 'CLIENT'}", function() {
      try {
        var client = new APIdaze.CLIENT({});
      } catch(error){
        expect(error).to.eql({ok: false, message: 'Please provide an apiKey', origin: 'CLIENT'});
      }
    });
  });
  describe('#new CLIENT({apiKey: "testapikey"}), no WebSocket URL', function() {
    it("should throw exception  {ok: false, message: 'Wrong WebSocket URL, must start with wss://', origin: 'CLIENT'}", function() {
      try {
        var client = new APIdaze.CLIENT({apiKey: "testapikey"});
      } catch(error){
        expect(error).to.eql({ok: false, message: 'Wrong WebSocket URL, must start with wss://', origin: 'CLIENT'});
      }
    });
  });
  describe('#new CLIENT({apiKey: "apiKeyWithoutExternalScript", wsurl: "ws://localhost:9080"}), No External Script configured', function() {
    it("should throw exception  {ok: false, message: Not allowed to login', origin: 'CLIENT'}", function(done) {
      var client = new APIdaze.CLIENT({
        debug: true,
        apiKey: "apiKeyWithoutExternalScript",
        wsurl: "ws://localhost:9080",
        onError: function(error){
          console.log("Error : ", error);
          expect(error).to.eql("Not allowed to login");
          client.shutdown();
          done();
        }
      });
    });
  });
  describe('#new CLIENT({apiKey:"apiKeyIsValid", wsurl: "ws://localhost:9080"}), valid apiKey and WebSocket URL', function() {
    it("should call onReady handler if present", function(done) {
      var client = new APIdaze.CLIENT({
        debug: true,
        apiKey: "testingIfApiKeyIsValid",
        wsurl: "ws://localhost:9080",
        onReady: function(){
          console.log("Ready");
          client.shutdown();
          done();
        }
      });
    });
  });
});
