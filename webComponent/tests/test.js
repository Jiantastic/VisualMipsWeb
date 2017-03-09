var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { setType } from "fable-core/Symbol";
import _Symbol from "fable-core/Symbol";
import { compareRecords, equalsRecords } from "fable-core/Util";
export var ComplexNumberRecord = function () {
  function ComplexNumberRecord(real, imaginary) {
    _classCallCheck(this, ComplexNumberRecord);

    this.real = real;
    this.imaginary = imaginary;
  }

  _createClass(ComplexNumberRecord, [{
    key: _Symbol.reflection,
    value: function () {
      return {
        type: "Test.ComplexNumberRecord",
        interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
        properties: {
          real: "number",
          imaginary: "number"
        }
      };
    }
  }, {
    key: "Equals",
    value: function (other) {
      return equalsRecords(this, other);
    }
  }, {
    key: "CompareTo",
    value: function (other) {
      return compareRecords(this, other);
    }
  }]);

  return ComplexNumberRecord;
}();
setType("Test.ComplexNumberRecord", ComplexNumberRecord);
export var myComplexNumber = new ComplexNumberRecord(1.1, 2.2);