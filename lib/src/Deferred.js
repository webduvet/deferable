"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Defer = Defer;
exports.DeferredTrigger = exports.DeferredPromise = void 0;
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));
var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));
var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));
var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
/**
 * @desc
 * implements deferred pattern
 * extended promise with exposed resolve and reject handlers
 *
 * passed resolver function
 *
 * @param? {Function} resolver function taking two params: function resolve and function reject
 * 		this parameter is provided as default
 */
var DeferredPromise = /*#__PURE__*/function (_Promise) {
  (0, _inherits2["default"])(DeferredPromise, _Promise);
  var _super = _createSuper(DeferredPromise);
  function DeferredPromise(resolver) {
    var _this;
    (0, _classCallCheck2["default"])(this, DeferredPromise);
    var that = {};
    _this = _super.call(this, function (resolve, reject) {
      Object.assign(that, {
        resolve: resolve,
        reject: reject
      });
    });
    Object.assign((0, _assertThisInitialized2["default"])(_this), that);
    if (resolver) {
      resolver(_this.resolve, _this.reject);
    }
    return _this;
  }
  return (0, _createClass2["default"])(DeferredPromise);
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(Promise));
/**
 * @desc
 * extended Deferred
 *
 * example:
 * 		new Deferred(() => http.get(url))
 *
 * if we need to pass promise but we do not want to do the actual work yet
 * like e.g. REST calls throttling.
 *
 * @param {Function} takes as argument factory returning promise
 */
exports.DeferredPromise = DeferredPromise;
var DeferredTrigger = /*#__PURE__*/function (_DeferredPromise) {
  (0, _inherits2["default"])(DeferredTrigger, _DeferredPromise);
  var _super2 = _createSuper(DeferredTrigger);
  function DeferredTrigger(load) {
    var _this2;
    (0, _classCallCheck2["default"])(this, DeferredTrigger);
    if (load.length == 2) {
      _this2 = _super2.call(this, load);
    }
    if (!load.length) {
      _this2 = _super2.call(this, function (resolve, reject) {});
      _this2._workload = load;
    }
    return (0, _possibleConstructorReturn2["default"])(_this2);
  }
  (0, _createClass2["default"])(DeferredTrigger, [{
    key: "trigger",
    value: function trigger() {
      var _this3 = this;
      return this._workload().then(function (data) {
        _this3.resolve(data);
      })["catch"](function (reason) {
        _this3.reject(reason);
      });
    }
  }]);
  return DeferredTrigger;
}(DeferredPromise);
/**
 * @desc
 * defer the execution of the workload
 *
 * @param {Function} factory function returning a Promise (which needs to be deffered)
 *
 * @returns {Objcect} with deferred promise and an executor which triggers the promise fullfillment
 **/
exports.DeferredTrigger = DeferredTrigger;
function Defer(workload) {
  var _reject, _resolve, _called;
  var _p = new Promise(function (resolve, reject) {
    _resolve = resolve;
    _reject = reject;
  }.bind(Defer));
  var executor = function (workload) {
    var _executor = undefined;
    return function () {
      _called = true;
      if (_executor) {
        return _executor;
      }
      return _executor = workload().then(function (data) {
        _resolve(data);
      })["catch"](function (reason) {
        _reject(reason);
      });
    };
  }(workload);
  return {
    get promise() {
      return _p;
    },
    get called() {
      return _called ? true : false;
    },
    trigger: function trigger() {
      var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      executor()["finally"](callback);
    }
  };
}
//# sourceMappingURL=Deferred.js.map