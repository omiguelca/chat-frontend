(function() {
  'use strict';

  var storage = require("./storage.js");
  var config = require("./config.json");

  // The content of apiServerUrl varies according to NODE_ENV
  var API_HOST = config.apiServerUrl;

  // Option argument of Vue.resource(...) should have emulateJSON
  // it can prevent sending pre-flight request when accessing to
  // the backend server to call API.
  var resource = function(url) {
    var options = { emulateJSON: true };
    return Vue.resource(url, null, null, options);
  };

  var setTokenHeader = function(token) {
    Vue.http.headers.common.Authorization = ("Basic " + token);
  };

  module.exports = {
    api: {
      ping: resource(API_HOST + "/api/ping"),

      newUser:   resource(API_HOST + "/api/user/new"),
      getUser:   resource(API_HOST + "/api/user/:id"),
      patchUser: resource(API_HOST + "/api/user/:id"),

      allRooms:  resource(API_HOST + "/api/room"),
      getUsers:  resource(API_HOST + "/api/room/:id/users"),
      roomEnter: resource(API_HOST + "/api/room/:id/enter"),
      roomLeave: resource(API_HOST + "/api/room/:id/leave"),

      sendMessage: resource(API_HOST + "/api/message/:id")
    },

    pingRequest: function() {
      return this.api.ping.get();
    },

    createNewUser: function(name) {
      setTokenHeader(storage.get("token"));
      return this.api.newUser.save({ name: name });
    },

    patchUser: function(userId, data) {
      setTokenHeader(storage.get("token"));
      return this.api.patchUser.save({ id: userId }, { data: data });
    },

    getAllRooms: function() {
      setTokenHeader(storage.get("token"));
      return this.api.allRooms.get();
    },

    getRoomUsers: function(roomId) {
      setTokenHeader(storage.get("token"));
      return this.api.getUsers.get({ id: roomId });
    },

    userRoomEnter: function(roomId) {
      setTokenHeader(storage.get("token"));
      return this.api.roomEnter.save({ id: roomId }, {});
    },

    userRoomLeave: function(roomId) {
      setTokenHeader(storage.get("token"));
      return this.api.roomLeave.save({ id: roomId }, {});
    },

    sendMessage: function(roomId, message) {
      var params = { content: message };
      setTokenHeader(storage.get("token"));
      return this.api.sendMessage.save({ id: roomId }, params);
    },

    connectRocketIO: function(roomId) {
      var rocketioInstance = (new RocketIO({
        type: "comet",
        channel: roomId
      })).connect(API_HOST);
      return rocketioInstance;
    }
  };
})();
