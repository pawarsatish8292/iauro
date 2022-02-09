"use strict";

function includeAllRoutes(app, connection) {
  require("./product-api.js")(app, connection);
  require("./user-api.js")(app, connection);
}
module.exports = function (app, connection) {
  includeAllRoutes(app, connection);
};