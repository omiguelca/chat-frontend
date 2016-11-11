(function() {
  var shared = require("./shared.js");
  var api = require("./api.js");
  var utils = require("./utils.js");

  var delegateRocketioListeners = function() {
    if (!shared.data.rocketio.instance) {
      return;
    }

    var listeners = Object.keys(shared.data.rocketio.listeners);
    if (listeners.length) {
      listeners.forEach(function(listener) {
        shared.data.rocketio.instance.removeListener(listener);
      });
    }
  };

  var functions = {
    setupRocketIOListeners: function(_this, roomId) {
      delegateRocketioListeners();

      if (shared.data.rocketio.instance) {
        shared.data.rocketio.instance.close();
        console.info("[ROCKET.IO] Closed.");
      }

      var listeners = {
        connected: function() {
          _this.$broadcast("app:msgInput:networkConnected");
          _this.$broadcast("app:sidebar:networkConnected");
          console.info("[ROCKET.IO] Connected.");
        },

        error: function() {
          // TODO now network error handling is disabled here because Heroku will send
          // "idle connection" as an error so here unhopefully catches them. This error
          // catching block has to handle them not as an error in the future.
          // _this.$broadcast("app:msgInput:networkError");
          // _this.$broadcast("app:sidebar:networkError");
        },

        newMessage: function(data) {
          data = JSON.parse(data);
          utils.formatCreatedAtTime(data);
          _this.$broadcast("app:msgView:addMessage", data);
          _this.$broadcast("app:msgView:scrollBottom");
        },

        updateRooms: function(data) {
          data = JSON.parse(data);
          _this.$broadcast("app:sidebar:updateRooms", data);
        },

        updateMembers: function(data) {
          data = JSON.parse(data);
          _this.$broadcast("app:sidebar:updateUsers", data);
        },

        userEnter: function(data) {
           // TODO Add a system message that someone got in to the room
        },

        userLeave: function(data) {
          // TODO Add a system message that someone left from the room
        }
      };

      // TODO Monitor disconnection of RocketIO caused by some errors on network
      var rocketio = shared.data.rocketio.instance = api.connectRocketIO(roomId);
      shared.data.rocketio.listeners = {
        newMessage:    rocketio.on("newMessage", listeners.newMessage),
        updateRooms:   rocketio.on("updateRooms", listeners.updateRooms),
        updateMembers: rocketio.on("updateMembers", listeners.updateMembers),
        userEnter:     rocketio.on("userEnter", listeners.userEnter),
        userLeave:     rocketio.on("userLeave", listeners.userLeave),
        connected:     rocketio.on("connect", listeners.connected),
        error:         rocketio.on("error", listeners.error)
      };
    }
  };

  module.exports = functions;
})();