(function() {
  'use strict';

  var controller = require("./messageViewController.js");

  var messageViewComponent = {
    template: require("./_message_view.jade")(),

    data: function() {
      return {
        messages: []
      };
    },

    ready: controller.ready,

    methods: {
      isPrevUserSame: controller.isPrevUserSame
    }
  };

  module.exports = messageViewComponent;
})();