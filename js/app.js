var api = require("./api.js");
var router = require("./routes.js");
var shared = require("./shared.js");
var storage = require("./storage.js");

Vue.use(VueRouter);
Vue.use(VueResource);

router.mapRoutings();

var app = new Vue({
  created: function() {
    if (!storage.isAvailable) {
      // Show a message that says "Your browser cannot browse this page"
    }

    api.pingRequest(function(data, isSucceed) {
      if (!isSucceed) {
        router.go({ path: "/error" });
      }

      shared.init();
    });
  }
});

module.exports = app;
