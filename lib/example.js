"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _Deferred = require("./Deferred.js");
var _fakeCall = _interopRequireDefault(require("./fakeCall.js"));
var deferred = (0, _Deferred.Defer)(_fakeCall["default"]);
deferred.promise.then(console.log)["catch"](console.error)["finally"](function () {
  console.log("finally promise");
});
console.log("called: ".concat(deferred.called));
deferred.execute(function () {
  console.log('...all is finished');
});
console.log("called: ".concat(deferred.called));
deferred.execute();
deferred.execute(function () {
  console.log('...all is finished');
});
//# sourceMappingURL=example.js.map