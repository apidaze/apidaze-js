var assert = require('assert');
var should = require('should');
var expect = require('chai').expect;
var path = require('path');

global.WebSocket = require('ws');

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
  describe('#new CLIENT({apiKey: "apiKeyWithoutExternalScript", wsurl: "wss://ws2-old.apidaze.io"}), No External Script configured', function() {
    it("should throw exception  {ok: false, message: Not allowed to login', origin: 'CLIENT'}", function(done) {
      this.timeout(10000);
      var client = new APIdaze.CLIENT({
        debug: true,
        apiKey: "apiKeyWithoutExternalScript",
        wsurl: "wss://ws2-old.apidaze.io",
        onError: function(error){
          console.log("Error : ", error);
          expect(error).to.eql("Not allowed to login");
          done();
        }
      });
    });
  });
  describe('#new CLIENT({apiKey:"53ff9c9d", wsurl: "wss://ws2-old.apidaze.io"}), valid apiKey and WebSocket URL', function() {
    it("should call onReady handler if present", function(done) {
      this.timeout(10000);
      var client = new APIdaze.CLIENT({
        debug: true,
        apiKey: "53ff9c9d",
        wsurl: "wss://ws2-old.apidaze.io",
        onReady: function(){
          console.log("Ready");
          done();
          client.shutdown();
        },
        onError: function(error){
          console.log("Error : ", error);
        }
      });
    });
    it("should test RTT with server", function(done) {
      this.timeout(10000);
      var client = new APIdaze.CLIENT({
        debug: true,
        apiKey: "53ff9c9d",
        wsurl: "wss://ws2-old.apidaze.io",
        onReady: function(){
          console.log("Ready");
          client.ping(function(rtt){
            console.log("RTT :", rtt);
            done();
            client.shutdown();
          });
        }
      });
    });
  });
});
