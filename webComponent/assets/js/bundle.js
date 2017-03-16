(function (exports) {
'use strict';

var fableGlobal = function () {
    var globalObj = typeof window !== "undefined" ? window
        : (typeof global !== "undefined" ? global
            : (typeof self !== "undefined" ? self : {}));
    if (typeof globalObj.__FABLE_CORE__ === "undefined") {
        globalObj.__FABLE_CORE__ = {
            types: new Map(),
            symbols: {
                reflection: Symbol("reflection"),
            }
        };
    }
    return globalObj.__FABLE_CORE__;
}();
function setType(fullName, cons) {
    fableGlobal.types.set(fullName, cons);
}

var _Symbol = (fableGlobal.symbols);

var NonDeclaredType = (function () {
    function NonDeclaredType(kind, definition, generics) {
        this.kind = kind;
        this.definition = definition;
        this.generics = generics;
    }
    NonDeclaredType.prototype.Equals = function (other) {
        if (this.kind === other.kind && this.definition === other.definition) {
            return typeof this.generics === "object"
                ? equalsRecords(this.generics, other.generics)
                : this.generics === other.generics;
        }
        return false;
    };
    return NonDeclaredType;
}());
var Any = new NonDeclaredType("Any");
var Unit = new NonDeclaredType("Unit");
function Option(t) {
    return new NonDeclaredType("Option", null, t);
}

function GenericParam(definition) {
    return new NonDeclaredType("GenericParam", definition);
}

function makeGeneric(typeDef, genArgs) {
    return new NonDeclaredType("GenericType", typeDef, genArgs);
}




function getPropertyNames(obj) {
    if (obj == null) {
        return [];
    }
    var propertyMap = typeof obj[_Symbol.reflection] === "function" ? obj[_Symbol.reflection]().properties || [] : obj;
    return Object.getOwnPropertyNames(propertyMap);
}

function getRestParams(args, idx) {
    for (var _len = args.length, restArgs = Array(_len > idx ? _len - idx : 0), _key = idx; _key < _len; _key++)
        restArgs[_key - idx] = args[_key];
    return restArgs;
}
function toString(o) {
    return o != null && typeof o.ToString == "function" ? o.ToString() : String(o);
}

function equals(x, y) {
    if (x === y)
        return true;
    else if (x == null)
        return y == null;
    else if (y == null)
        return false;
    else if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y))
        return false;
    else if (typeof x.Equals === "function")
        return x.Equals(y);
    else if (Array.isArray(x)) {
        if (x.length != y.length)
            return false;
        for (var i = 0; i < x.length; i++)
            if (!equals(x[i], y[i]))
                return false;
        return true;
    }
    else if (ArrayBuffer.isView(x)) {
        if (x.byteLength !== y.byteLength)
            return false;
        var dv1 = new DataView(x.buffer), dv2 = new DataView(y.buffer);
        for (var i = 0; i < x.byteLength; i++)
            if (dv1.getUint8(i) !== dv2.getUint8(i))
                return false;
        return true;
    }
    else if (x instanceof Date)
        return x.getTime() == y.getTime();
    else
        return false;
}
function compare(x, y) {
    if (x === y)
        return 0;
    if (x == null)
        return y == null ? 0 : -1;
    else if (y == null)
        return 1;
    else if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y))
        return -1;
    else if (typeof x.CompareTo === "function")
        return x.CompareTo(y);
    else if (Array.isArray(x)) {
        if (x.length != y.length)
            return x.length < y.length ? -1 : 1;
        for (var i = 0, j = 0; i < x.length; i++)
            if ((j = compare(x[i], y[i])) !== 0)
                return j;
        return 0;
    }
    else if (ArrayBuffer.isView(x)) {
        if (x.byteLength != y.byteLength)
            return x.byteLength < y.byteLength ? -1 : 1;
        var dv1 = new DataView(x.buffer), dv2 = new DataView(y.buffer);
        for (var i = 0, b1 = 0, b2 = 0; i < x.byteLength; i++) {
            b1 = dv1.getUint8(i), b2 = dv2.getUint8(i);
            if (b1 < b2)
                return -1;
            if (b1 > b2)
                return 1;
        }
        return 0;
    }
    else if (x instanceof Date)
        return compare(x.getTime(), y.getTime());
    else
        return x < y ? -1 : 1;
}
function equalsRecords(x, y) {
    if (x === y) {
        return true;
    }
    else {
        var keys = getPropertyNames(x);
        for (var i = 0; i < keys.length; i++) {
            if (!equals(x[keys[i]], y[keys[i]]))
                return false;
        }
        return true;
    }
}
function compareRecords(x, y) {
    if (x === y) {
        return 0;
    }
    else {
        var keys = getPropertyNames(x);
        for (var i = 0; i < keys.length; i++) {
            var res = compare(x[keys[i]], y[keys[i]]);
            if (res !== 0)
                return res;
        }
        return 0;
    }
}
function equalsUnions(x, y) {
    if (x === y) {
        return true;
    }
    else if (x.Case !== y.Case) {
        return false;
    }
    else {
        for (var i = 0; i < x.Fields.length; i++) {
            if (!equals(x.Fields[i], y.Fields[i]))
                return false;
        }
        return true;
    }
}
function compareUnions(x, y) {
    if (x === y) {
        return 0;
    }
    else {
        var res = compare(x.Case, y.Case);
        if (res !== 0)
            return res;
        for (var i = 0; i < x.Fields.length; i++) {
            res = compare(x.Fields[i], y.Fields[i]);
            if (res !== 0)
                return res;
        }
        return 0;
    }
}





function defaultArg(arg, defaultValue, f) {
    return arg == null ? defaultValue : (f != null ? f(arg) : arg);
}

function create(pattern, options) {
    var flags = "g";
    flags += options & 1 ? "i" : "";
    flags += options & 2 ? "m" : "";
    return new RegExp(pattern, flags);
}
function escape(str) {
    return str.replace(/[\-\[\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CodeMirrorState = function () {
    function CodeMirrorState(state) {
        _classCallCheck(this, CodeMirrorState);

        this.State = state;
    }

    _createClass(CodeMirrorState, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "App.CodeMirrorInterface.CodeMirrorState",
                interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                properties: {
                    State: GenericParam("T")
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

    return CodeMirrorState;
}();
setType("App.CodeMirrorInterface.CodeMirrorState", CodeMirrorState);
function DefineCodeMirrorMode(modeName, tokFun, initState) {
    var armCodeMirrorMode = {
        token: function token(delegateArg0, delegateArg1) {
            return tokFun(delegateArg0)(delegateArg1);
        },
        startState: function startState() {
            return new CodeMirrorState({
                contents: initState
            });
        },
        copyState: function copyState(st) {
            return {
                contents: st.contents
            };
        }
    };
    CodeMirror.defineMode(modeName, function (a, b) {
        return armCodeMirrorMode;
    });
}
function optJSBool(x) {
    var matchValue = x;

    if (x === false) {
        return null;
    } else if (x === true) {
        return x;
    } else if (matchValue == null) {
        return null;
    } else {
        return null;
    }
}
function optJSObj(x) {
    var matchValue = x;

    if (matchValue == null) {
        return null;
    } else {
        return x;
    }
}
function RetObj(stream, y) {
    var matchValue = optJSObj(y);

    if (matchValue == null) {
        return null;
    } else {
        return stream;
    }
}
function RetBool(stream, y) {
    var matchValue = optJSBool(y);

    if (matchValue == null) {
        return null;
    } else {
        return stream;
    }
}

function _EatSpace___(stream) {
    var x = stream.eatSpace();
    return function (y) {
        return RetBool(stream, y);
    }(x);
}

function _EatMatch___(regExpStr, stream) {
    var x = stream.match(create(regExpStr), true, false);
    return function (y) {
        return RetObj(stream, y);
    }(x);
}

function _EatLine___(stream) {
    stream.skipToEnd();
    return stream;
}

function tokFunction(stream, state) {
    var ret = void 0;

    var activePatternResult131 = _EatSpace___(stream);

    if (activePatternResult131 != null) {
        ret = "var2";
    } else {
        var activePatternResult130 = function () {
            var regExpStr = "^(ADDI|ADDIU|ANDI|ORI|XORI|BEQ|BGEZAL|BGEZ|BGTZ|BLEZ|BLTZAL|BLTZ|BNE|LB|LBU|LH|LWL|LW|LWR|SB|SH|SW|LUI|SLTI|SLTIU|JAL|J|ADDU|ADD|AND|OR|SRAV|SRA|SRLV|SRL|SLLV|SLL|SUBU|SUB|XOR|SLTU|SLT|DIVU|DIV|MULTU|MULT|JR|JALR|MFHI|MFLO|MTHI|MTLO)";
            return function (stream_1) {
                return _EatMatch___(regExpStr, stream_1);
            };
        }()(stream);

        if (activePatternResult130 != null) {
            ret = "keyword";
        } else {
            var activePatternResult128 = function () {
                var regExpStr_1 = "^[a-zA-Z][a-zA-Z0-9]*";
                return function (stream_2) {
                    return _EatMatch___(regExpStr_1, stream_2);
                };
            }()(stream);

            if (activePatternResult128 != null) {
                ret = "atom";
            } else {
                var $var1 = void 0;

                var activePatternResult125 = function () {
                    var regExpStr_4 = "^#";
                    return function (stream_5) {
                        return _EatMatch___(regExpStr_4, stream_5);
                    };
                }()(stream);

                if (activePatternResult125 != null) {
                    var activePatternResult126 = _EatLine___(activePatternResult125);

                    if (activePatternResult126 != null) {
                        $var1 = [0, activePatternResult126];
                    } else {
                        $var1 = [1];
                    }
                } else {
                    $var1 = [1];
                }

                switch ($var1[0]) {
                    case 0:
                        ret = "comment";
                        break;

                    case 1:
                        var activePatternResult123 = function () {
                            var regExpStr_2 = "^[0-9][0-9]*";
                            return function (stream_3) {
                                return _EatMatch___(regExpStr_2, stream_3);
                            };
                        }()(stream);

                        if (activePatternResult123 != null) {
                            ret = "number";
                        } else {
                            var activePatternResult121 = function () {
                                var regExpStr_3 = "^.";
                                return function (stream_4) {
                                    return _EatMatch___(regExpStr_3, stream_4);
                                };
                            }()(stream);

                            if (activePatternResult121 != null) {
                                ret = "keyword";
                            } else {
                                ret = null;
                            }
                        }

                        break;
                }
            }
        }
    }

    return ret;
}
DefineCodeMirrorMode("arm", function (stream) {
    return function (state) {
        return tokFunction(stream, state);
    };
}, 0);
var initOptions = {
    lineNumbers: true,
    styleActiveLine: "true",
    matchBrackets: "true",
    mode: "arm",
    theme: "monokai"
};
function getById(id) {
    return document.getElementById(id);
}

var Long = (function () {
    function Long(low, high, unsigned) {
        this.eq = this.equals;
        this.neq = this.notEquals;
        this.lt = this.lessThan;
        this.lte = this.lessThanOrEqual;
        this.gt = this.greaterThan;
        this.gte = this.greaterThanOrEqual;
        this.comp = this.compare;
        this.neg = this.negate;
        this.abs = this.absolute;
        this.sub = this.subtract;
        this.mul = this.multiply;
        this.div = this.divide;
        this.mod = this.modulo;
        this.shl = this.shiftLeft;
        this.shr = this.shiftRight;
        this.shru = this.shiftRightUnsigned;
        this.Equals = this.equals;
        this.CompareTo = this.compare;
        this.ToString = this.toString;
        this.low = low | 0;
        this.high = high | 0;
        this.unsigned = !!unsigned;
    }
    Long.prototype.toInt = function () {
        return this.unsigned ? this.low >>> 0 : this.low;
    };
    Long.prototype.toNumber = function () {
        if (this.unsigned)
            return ((this.high >>> 0) * TWO_PWR_32_DBL) + (this.low >>> 0);
        return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
    };
    Long.prototype.toString = function (radix) {
        if (radix === void 0) { radix = 10; }
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
            throw RangeError('radix');
        if (this.isZero())
            return '0';
        if (this.isNegative()) {
            if (this.eq(MIN_VALUE)) {
                var radixLong = fromNumber(radix), div = this.div(radixLong), rem1 = div.mul(radixLong).sub(this);
                return div.toString(radix) + rem1.toInt().toString(radix);
            }
            else
                return '-' + this.neg().toString(radix);
        }
        var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned), rem = this;
        var result = '';
        while (true) {
            var remDiv = rem.div(radixToPower), intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0, digits = intval.toString(radix);
            rem = remDiv;
            if (rem.isZero())
                return digits + result;
            else {
                while (digits.length < 6)
                    digits = '0' + digits;
                result = '' + digits + result;
            }
        }
    };
    Long.prototype.getHighBits = function () {
        return this.high;
    };
    Long.prototype.getHighBitsUnsigned = function () {
        return this.high >>> 0;
    };
    Long.prototype.getLowBits = function () {
        return this.low;
    };
    Long.prototype.getLowBitsUnsigned = function () {
        return this.low >>> 0;
    };
    Long.prototype.getNumBitsAbs = function () {
        if (this.isNegative())
            return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
        var val = this.high != 0 ? this.high : this.low;
        for (var bit = 31; bit > 0; bit--)
            if ((val & (1 << bit)) != 0)
                break;
        return this.high != 0 ? bit + 33 : bit + 1;
    };
    Long.prototype.isZero = function () {
        return this.high === 0 && this.low === 0;
    };
    Long.prototype.isNegative = function () {
        return !this.unsigned && this.high < 0;
    };
    Long.prototype.isPositive = function () {
        return this.unsigned || this.high >= 0;
    };
    Long.prototype.isOdd = function () {
        return (this.low & 1) === 1;
    };
    Long.prototype.isEven = function () {
        return (this.low & 1) === 0;
    };
    Long.prototype.equals = function (other) {
        if (!isLong(other))
            other = fromValue(other);
        if (this.unsigned !== other.unsigned && (this.high >>> 31) === 1 && (other.high >>> 31) === 1)
            return false;
        return this.high === other.high && this.low === other.low;
    };
    Long.prototype.notEquals = function (other) {
        return !this.eq(other);
    };
    Long.prototype.lessThan = function (other) {
        return this.comp(other) < 0;
    };
    Long.prototype.lessThanOrEqual = function (other) {
        return this.comp(other) <= 0;
    };
    Long.prototype.greaterThan = function (other) {
        return this.comp(other) > 0;
    };
    Long.prototype.greaterThanOrEqual = function (other) {
        return this.comp(other) >= 0;
    };
    Long.prototype.compare = function (other) {
        if (!isLong(other))
            other = fromValue(other);
        if (this.eq(other))
            return 0;
        var thisNeg = this.isNegative(), otherNeg = other.isNegative();
        if (thisNeg && !otherNeg)
            return -1;
        if (!thisNeg && otherNeg)
            return 1;
        if (!this.unsigned)
            return this.sub(other).isNegative() ? -1 : 1;
        return (other.high >>> 0) > (this.high >>> 0) || (other.high === this.high && (other.low >>> 0) > (this.low >>> 0)) ? -1 : 1;
    };
    Long.prototype.negate = function () {
        if (!this.unsigned && this.eq(MIN_VALUE))
            return MIN_VALUE;
        return this.not().add(ONE);
    };
    Long.prototype.absolute = function () {
        if (!this.unsigned && this.isNegative())
            return this.negate();
        else
            return this;
    };
    Long.prototype.add = function (addend) {
        if (!isLong(addend))
            addend = fromValue(addend);
        var a48 = this.high >>> 16;
        var a32 = this.high & 0xFFFF;
        var a16 = this.low >>> 16;
        var a00 = this.low & 0xFFFF;
        var b48 = addend.high >>> 16;
        var b32 = addend.high & 0xFFFF;
        var b16 = addend.low >>> 16;
        var b00 = addend.low & 0xFFFF;
        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 + b00;
        c16 += c00 >>> 16;
        c00 &= 0xFFFF;
        c16 += a16 + b16;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c32 += a32 + b32;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c48 += a48 + b48;
        c48 &= 0xFFFF;
        return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };
    Long.prototype.subtract = function (subtrahend) {
        if (!isLong(subtrahend))
            subtrahend = fromValue(subtrahend);
        return this.add(subtrahend.neg());
    };
    Long.prototype.multiply = function (multiplier) {
        if (this.isZero())
            return ZERO;
        if (!isLong(multiplier))
            multiplier = fromValue(multiplier);
        if (multiplier.isZero())
            return ZERO;
        if (this.eq(MIN_VALUE))
            return multiplier.isOdd() ? MIN_VALUE : ZERO;
        if (multiplier.eq(MIN_VALUE))
            return this.isOdd() ? MIN_VALUE : ZERO;
        if (this.isNegative()) {
            if (multiplier.isNegative())
                return this.neg().mul(multiplier.neg());
            else
                return this.neg().mul(multiplier).neg();
        }
        else if (multiplier.isNegative())
            return this.mul(multiplier.neg()).neg();
        if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
            return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);
        var a48 = this.high >>> 16;
        var a32 = this.high & 0xFFFF;
        var a16 = this.low >>> 16;
        var a00 = this.low & 0xFFFF;
        var b48 = multiplier.high >>> 16;
        var b32 = multiplier.high & 0xFFFF;
        var b16 = multiplier.low >>> 16;
        var b00 = multiplier.low & 0xFFFF;
        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 * b00;
        c16 += c00 >>> 16;
        c00 &= 0xFFFF;
        c16 += a16 * b00;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c16 += a00 * b16;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c32 += a32 * b00;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c32 += a16 * b16;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c32 += a00 * b32;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
        c48 &= 0xFFFF;
        return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };
    Long.prototype.divide = function (divisor) {
        if (!isLong(divisor))
            divisor = fromValue(divisor);
        if (divisor.isZero())
            throw Error('division by zero');
        if (this.isZero())
            return this.unsigned ? UZERO : ZERO;
        var approx = 0, rem = ZERO, res = ZERO;
        if (!this.unsigned) {
            if (this.eq(MIN_VALUE)) {
                if (divisor.eq(ONE) || divisor.eq(NEG_ONE))
                    return MIN_VALUE;
                else if (divisor.eq(MIN_VALUE))
                    return ONE;
                else {
                    var halfThis = this.shr(1);
                    var approx_1 = halfThis.div(divisor).shl(1);
                    if (approx_1.eq(ZERO)) {
                        return divisor.isNegative() ? ONE : NEG_ONE;
                    }
                    else {
                        rem = this.sub(divisor.mul(approx_1));
                        res = approx_1.add(rem.div(divisor));
                        return res;
                    }
                }
            }
            else if (divisor.eq(MIN_VALUE))
                return this.unsigned ? UZERO : ZERO;
            if (this.isNegative()) {
                if (divisor.isNegative())
                    return this.neg().div(divisor.neg());
                return this.neg().div(divisor).neg();
            }
            else if (divisor.isNegative())
                return this.div(divisor.neg()).neg();
            res = ZERO;
        }
        else {
            if (!divisor.unsigned)
                divisor = divisor.toUnsigned();
            if (divisor.gt(this))
                return UZERO;
            if (divisor.gt(this.shru(1)))
                return UONE;
            res = UZERO;
        }
        rem = this;
        while (rem.gte(divisor)) {
            approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));
            var log2 = Math.ceil(Math.log(approx) / Math.LN2), delta = (log2 <= 48) ? 1 : pow_dbl(2, log2 - 48), approxRes = fromNumber(approx), approxRem = approxRes.mul(divisor);
            while (approxRem.isNegative() || approxRem.gt(rem)) {
                approx -= delta;
                approxRes = fromNumber(approx, this.unsigned);
                approxRem = approxRes.mul(divisor);
            }
            if (approxRes.isZero())
                approxRes = ONE;
            res = res.add(approxRes);
            rem = rem.sub(approxRem);
        }
        return res;
    };
    Long.prototype.modulo = function (divisor) {
        if (!isLong(divisor))
            divisor = fromValue(divisor);
        return this.sub(this.div(divisor).mul(divisor));
    };
    
    Long.prototype.not = function () {
        return fromBits(~this.low, ~this.high, this.unsigned);
    };
    
    Long.prototype.and = function (other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
    };
    Long.prototype.or = function (other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
    };
    Long.prototype.xor = function (other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
    };
    Long.prototype.shiftLeft = function (numBits) {
        if (isLong(numBits))
            numBits = numBits.toInt();
        numBits = numBits & 63;
        if (numBits === 0)
            return this;
        else if (numBits < 32)
            return fromBits(this.low << numBits, (this.high << numBits) | (this.low >>> (32 - numBits)), this.unsigned);
        else
            return fromBits(0, this.low << (numBits - 32), this.unsigned);
    };
    Long.prototype.shiftRight = function (numBits) {
        if (isLong(numBits))
            numBits = numBits.toInt();
        numBits = numBits & 63;
        if (numBits === 0)
            return this;
        else if (numBits < 32)
            return fromBits((this.low >>> numBits) | (this.high << (32 - numBits)), this.high >> numBits, this.unsigned);
        else
            return fromBits(this.high >> (numBits - 32), this.high >= 0 ? 0 : -1, this.unsigned);
    };
    Long.prototype.shiftRightUnsigned = function (numBits) {
        if (isLong(numBits))
            numBits = numBits.toInt();
        numBits = numBits & 63;
        if (numBits === 0)
            return this;
        else {
            var high = this.high;
            if (numBits < 32) {
                var low = this.low;
                return fromBits((low >>> numBits) | (high << (32 - numBits)), high >>> numBits, this.unsigned);
            }
            else if (numBits === 32)
                return fromBits(high, 0, this.unsigned);
            else
                return fromBits(high >>> (numBits - 32), 0, this.unsigned);
        }
    };
    Long.prototype.toSigned = function () {
        if (!this.unsigned)
            return this;
        return fromBits(this.low, this.high, false);
    };
    Long.prototype.toUnsigned = function () {
        if (this.unsigned)
            return this;
        return fromBits(this.low, this.high, true);
    };
    Long.prototype.toBytes = function (le) {
        return le ? this.toBytesLE() : this.toBytesBE();
    };
    Long.prototype.toBytesLE = function () {
        var hi = this.high, lo = this.low;
        return [
            lo & 0xff,
            (lo >>> 8) & 0xff,
            (lo >>> 16) & 0xff,
            (lo >>> 24) & 0xff,
            hi & 0xff,
            (hi >>> 8) & 0xff,
            (hi >>> 16) & 0xff,
            (hi >>> 24) & 0xff
        ];
    };
    Long.prototype.toBytesBE = function () {
        var hi = this.high, lo = this.low;
        return [
            (hi >>> 24) & 0xff,
            (hi >>> 16) & 0xff,
            (hi >>> 8) & 0xff,
            hi & 0xff,
            (lo >>> 24) & 0xff,
            (lo >>> 16) & 0xff,
            (lo >>> 8) & 0xff,
            lo & 0xff
        ];
    };
    Long.prototype[_Symbol.reflection] = function () {
        return {
            type: "System.Int64",
            interfaces: ["FSharpRecord", "System.IComparable"],
            properties: {
                low: "number",
                high: "number",
                unsigned: "boolean"
            }
        };
    };
    return Long;
}());
var INT_CACHE = {};
var UINT_CACHE = {};
function isLong(obj) {
    return (obj && obj instanceof Long);
}
function fromInt(value, unsigned) {
    if (unsigned === void 0) { unsigned = false; }
    var obj, cachedObj, cache;
    if (unsigned) {
        value >>>= 0;
        if (cache = (0 <= value && value < 256)) {
            cachedObj = UINT_CACHE[value];
            if (cachedObj)
                return cachedObj;
        }
        obj = fromBits(value, (value | 0) < 0 ? -1 : 0, true);
        if (cache)
            UINT_CACHE[value] = obj;
        return obj;
    }
    else {
        value |= 0;
        if (cache = (-128 <= value && value < 128)) {
            cachedObj = INT_CACHE[value];
            if (cachedObj)
                return cachedObj;
        }
        obj = fromBits(value, value < 0 ? -1 : 0, false);
        if (cache)
            INT_CACHE[value] = obj;
        return obj;
    }
}
function fromNumber(value, unsigned) {
    if (unsigned === void 0) { unsigned = false; }
    if (isNaN(value) || !isFinite(value))
        return unsigned ? UZERO : ZERO;
    if (unsigned) {
        if (value < 0)
            return UZERO;
        if (value >= TWO_PWR_64_DBL)
            return MAX_UNSIGNED_VALUE;
    }
    else {
        if (value <= -TWO_PWR_63_DBL)
            return MIN_VALUE;
        if (value + 1 >= TWO_PWR_63_DBL)
            return MAX_VALUE;
    }
    if (value < 0)
        return fromNumber(-value, unsigned).neg();
    return fromBits((value % TWO_PWR_32_DBL) | 0, (value / TWO_PWR_32_DBL) | 0, unsigned);
}
function fromBits(lowBits, highBits, unsigned) {
    return new Long(lowBits, highBits, unsigned);
}
var pow_dbl = Math.pow;
function fromString(str, unsigned, radix) {
    if (unsigned === void 0) { unsigned = false; }
    if (radix === void 0) { radix = 10; }
    if (str.length === 0)
        throw Error('empty string');
    if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
        return ZERO;
    if (typeof unsigned === 'number') {
        radix = unsigned,
            unsigned = false;
    }
    else {
        unsigned = !!unsigned;
    }
    radix = radix || 10;
    if (radix < 2 || 36 < radix)
        throw RangeError('radix');
    var p = str.indexOf('-');
    if (p > 0)
        throw Error('interior hyphen');
    else if (p === 0) {
        return fromString(str.substring(1), unsigned, radix).neg();
    }
    var radixToPower = fromNumber(pow_dbl(radix, 8));
    var result = ZERO;
    for (var i = 0; i < str.length; i += 8) {
        var size = Math.min(8, str.length - i), value = parseInt(str.substring(i, i + size), radix);
        if (size < 8) {
            var power = fromNumber(pow_dbl(radix, size));
            result = result.mul(power).add(fromNumber(value));
        }
        else {
            result = result.mul(radixToPower);
            result = result.add(fromNumber(value));
        }
    }
    result.unsigned = unsigned;
    return result;
}
function fromValue(val) {
    if (val instanceof Long)
        return val;
    if (typeof val === 'number')
        return fromNumber(val);
    if (typeof val === 'string')
        return fromString(val);
    return fromBits(val.low, val.high, val.unsigned);
}
var TWO_PWR_16_DBL = 1 << 16;
var TWO_PWR_24_DBL = 1 << 24;
var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);
var ZERO = fromInt(0);
var UZERO = fromInt(0, true);
var ONE = fromInt(1);
var UONE = fromInt(1, true);
var NEG_ONE = fromInt(-1);
var MAX_VALUE = fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0, false);
var MAX_UNSIGNED_VALUE = fromBits(0xFFFFFFFF | 0, 0xFFFFFFFF | 0, true);
var MIN_VALUE = fromBits(0, 0x80000000 | 0, false);

var fsFormatRegExp = /(^|[^%])%([0+ ]*)(-?\d+)?(?:\.(\d+))?(\w)/;



function toHex(value) {
    return value < 0
        ? "ff" + (16777215 - (Math.abs(value) - 1)).toString(16)
        : value.toString(16);
}
function fsFormat(str) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var _cont;
    function isObject(x) {
        return x !== null && typeof x === "object" && !(x instanceof Number) && !(x instanceof String) && !(x instanceof Boolean);
    }
    function formatOnce(str, rep) {
        return str.replace(fsFormatRegExp, function (_, prefix, flags, pad, precision, format) {
            switch (format) {
                case "f":
                case "F":
                    rep = rep.toFixed(precision || 6);
                    break;
                case "g":
                case "G":
                    rep = rep.toPrecision(precision);
                    break;
                case "e":
                case "E":
                    rep = rep.toExponential(precision);
                    break;
                case "O":
                    rep = toString(rep);
                    break;
                case "A":
                    try {
                        rep = JSON.stringify(rep, function (k, v) {
                            return v && v[Symbol.iterator] && !Array.isArray(v) && isObject(v) ? Array.from(v)
                                : v && typeof v.ToString === "function" ? toString(v) : v;
                        });
                    }
                    catch (err) {
                        rep = "{" + Object.getOwnPropertyNames(rep).map(function (k) { return k + ": " + String(rep[k]); }).join(", ") + "}";
                    }
                    break;
                case "x":
                    rep = toHex(Number(rep));
                    break;
                case "X":
                    rep = toHex(Number(rep)).toUpperCase();
                    break;
            }
            var plusPrefix = flags.indexOf("+") >= 0 && parseInt(rep) >= 0;
            if (!isNaN(pad = parseInt(pad))) {
                var ch = pad >= 0 && flags.indexOf("0") >= 0 ? "0" : " ";
                rep = padLeft(rep, Math.abs(pad) - (plusPrefix ? 1 : 0), ch, pad < 0);
            }
            var once = prefix + (plusPrefix ? "+" + rep : rep);
            return once.replace(/%/g, "%%");
        });
    }
    function makeFn(str) {
        return function (rep) {
            var str2 = formatOnce(str, rep);
            return fsFormatRegExp.test(str2)
                ? makeFn(str2) : _cont(str2.replace(/%%/g, "%"));
        };
    }
    if (args.length === 0) {
        return function (cont) {
            _cont = cont;
            return fsFormatRegExp.test(str) ? makeFn(str) : _cont(str);
        };
    }
    else {
        for (var i = 0; i < args.length; i++) {
            str = formatOnce(str, args[i]);
        }
        return str.replace(/%%/g, "%");
    }
}








function padLeft(str, len, ch, isRight) {
    ch = ch || " ";
    str = String(str);
    len = len - str.length;
    for (var i = -1; ++i < len;)
        str = isRight ? str + ch : ch + str;
    return str;
}




function split$1(str, splitters, count, removeEmpty) {
    count = typeof count == "number" ? count : null;
    removeEmpty = typeof removeEmpty == "number" ? removeEmpty : null;
    if (count < 0)
        throw new Error("Count cannot be less than zero");
    if (count === 0)
        return [];
    splitters = Array.isArray(splitters) ? splitters : getRestParams(arguments, 1);
    splitters = splitters.map(function (x) { return escape(x); });
    splitters = splitters.length > 0 ? splitters : [" "];
    var m;
    var i = 0;
    var splits = [];
    var reg = new RegExp(splitters.join("|"), "g");
    while ((count == null || count > 1) && (m = reg.exec(str)) !== null) {
        if (!removeEmpty || (m.index - i) > 0) {
            count = count != null ? count - 1 : count;
            splits.push(str.substring(i, m.index));
        }
        i = reg.lastIndex;
    }
    if (!removeEmpty || (str.length - i) > 0)
        splits.push(str.substring(i));
    return splits;
}

function ofArray(args, base) {
    var acc = base || new List();
    for (var i = args.length - 1; i >= 0; i--) {
        acc = new List(args[i], acc);
    }
    return acc;
}
var List = (function () {
    function List(head, tail) {
        this.head = head;
        this.tail = tail;
    }
    List.prototype.ToString = function () {
        return "[" + Array.from(this).map(toString).join("; ") + "]";
    };
    List.prototype.Equals = function (x) {
        if (this === x) {
            return true;
        }
        else {
            var iter1 = this[Symbol.iterator](), iter2 = x[Symbol.iterator]();
            for (;;) {
                var cur1 = iter1.next(), cur2 = iter2.next();
                if (cur1.done)
                    return cur2.done ? true : false;
                else if (cur2.done)
                    return false;
                else if (!equals(cur1.value, cur2.value))
                    return false;
            }
        }
    };
    List.prototype.CompareTo = function (x) {
        if (this === x) {
            return 0;
        }
        else {
            var acc = 0;
            var iter1 = this[Symbol.iterator](), iter2 = x[Symbol.iterator]();
            for (;;) {
                var cur1 = iter1.next(), cur2 = iter2.next();
                if (cur1.done)
                    return cur2.done ? acc : -1;
                else if (cur2.done)
                    return 1;
                else {
                    acc = compare(cur1.value, cur2.value);
                    if (acc != 0)
                        return acc;
                }
            }
        }
    };
    Object.defineProperty(List.prototype, "length", {
        get: function () {
            var cur = this, acc = 0;
            while (cur.tail != null) {
                cur = cur.tail;
                acc++;
            }
            return acc;
        },
        enumerable: true,
        configurable: true
    });
    List.prototype[Symbol.iterator] = function () {
        var cur = this;
        return {
            next: function () {
                var tmp = cur;
                cur = cur.tail;
                return { done: tmp.tail == null, value: tmp.head };
            }
        };
    };
    List.prototype[_Symbol.reflection] = function () {
        return {
            type: "Microsoft.FSharp.Collections.FSharpList",
            interfaces: ["System.IEquatable", "System.IComparable"]
        };
    };
    return List;
}());

var GenericComparer = (function () {
    function GenericComparer(f) {
        this.Compare = f || compare;
    }
    GenericComparer.prototype[_Symbol.reflection] = function () {
        return { interfaces: ["System.IComparer"] };
    };
    return GenericComparer;
}());

var Enumerator = (function () {
    function Enumerator(iter) {
        this.iter = iter;
    }
    Enumerator.prototype.MoveNext = function () {
        var cur = this.iter.next();
        this.current = cur.value;
        return !cur.done;
    };
    Object.defineProperty(Enumerator.prototype, "Current", {
        get: function () {
            return this.current;
        },
        enumerable: true,
        configurable: true
    });
    Enumerator.prototype.Reset = function () {
        throw new Error("JS iterators cannot be reset");
    };
    Enumerator.prototype.Dispose = function () { };
    return Enumerator;
}());


function __failIfNone(res) {
    if (res == null)
        throw new Error("Seq did not contain any matching element");
    return res;
}









function compareWith(f, xs, ys) {
    var nonZero = tryFind$1(function (i) { return i != 0; }, map2(function (x, y) { return f(x, y); }, xs, ys));
    return nonZero != null ? nonZero : count(xs) - count(ys);
}
function delay(f) {
    return _a = {},
        _a[Symbol.iterator] = function () { return f()[Symbol.iterator](); },
        _a;
    var _a;
}






function exists$1(f, xs) {
    function aux(iter) {
        var cur = iter.next();
        return !cur.done && (f(cur.value) || aux(iter));
    }
    return aux(xs[Symbol.iterator]());
}



function fold$1(f, acc, xs) {
    if (Array.isArray(xs) || ArrayBuffer.isView(xs)) {
        return xs.reduce(f, acc);
    }
    else {
        var cur = void 0;
        for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
            cur = iter.next();
            if (cur.done)
                break;
            acc = f(acc, cur.value, i);
        }
        return acc;
    }
}


















function count(xs) {
    return Array.isArray(xs) || ArrayBuffer.isView(xs)
        ? xs.length
        : fold$1(function (acc, x) { return acc + 1; }, 0, xs);
}
function map$1(f, xs) {
    return delay(function () { return unfold(function (iter) {
        var cur = iter.next();
        return !cur.done ? [f(cur.value), iter] : null;
    }, xs[Symbol.iterator]()); });
}

function map2(f, xs, ys) {
    return delay(function () {
        var iter1 = xs[Symbol.iterator]();
        var iter2 = ys[Symbol.iterator]();
        return unfold(function () {
            var cur1 = iter1.next(), cur2 = iter2.next();
            return !cur1.done && !cur2.done ? [f(cur1.value, cur2.value), null] : null;
        });
    });
}










function rangeStep(first, step, last) {
    if (step === 0)
        throw new Error("Step cannot be 0");
    return delay(function () { return unfold(function (x) { return step > 0 && x <= last || step < 0 && x >= last ? [x, x + step] : null; }, first); });
}

function range(first, last) {
    return rangeStep(first, 1, last);
}

















function tryFind$1(f, xs, defaultValue) {
    for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
        var cur = iter.next();
        if (cur.done)
            return defaultValue === void 0 ? null : defaultValue;
        if (f(cur.value, i))
            return cur.value;
    }
}







function tryPick$1(f, xs) {
    for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
        var cur = iter.next();
        if (cur.done)
            break;
        var y = f(cur.value, i);
        if (y != null)
            return y;
    }
    return void 0;
}
function pick$1(f, xs) {
    return __failIfNone(tryPick$1(f, xs));
}
function unfold(f, acc) {
    return _a = {},
        _a[Symbol.iterator] = function () {
            return {
                next: function () {
                    var res = f(acc);
                    if (res != null) {
                        acc = res[1];
                        return { done: false, value: res[0] };
                    }
                    return { done: true };
                }
            };
        },
        _a;
    var _a;
}

var MapTree = (function () {
    function MapTree(caseName, fields) {
        this.Case = caseName;
        this.Fields = fields;
    }
    return MapTree;
}());
function tree_sizeAux(acc, m) {
    return m.Case === "MapOne"
        ? acc + 1
        : m.Case === "MapNode"
            ? tree_sizeAux(tree_sizeAux(acc + 1, m.Fields[2]), m.Fields[3])
            : acc;
}
function tree_size(x) {
    return tree_sizeAux(0, x);
}
function tree_empty() {
    return new MapTree("MapEmpty", []);
}
function tree_height(_arg1) {
    return _arg1.Case === "MapOne" ? 1 : _arg1.Case === "MapNode" ? _arg1.Fields[4] : 0;
}
function tree_mk(l, k, v, r) {
    var matchValue = [l, r];
    var $target1 = function () {
        var hl = tree_height(l);
        var hr = tree_height(r);
        var m = hl < hr ? hr : hl;
        return new MapTree("MapNode", [k, v, l, r, m + 1]);
    };
    if (matchValue[0].Case === "MapEmpty") {
        if (matchValue[1].Case === "MapEmpty") {
            return new MapTree("MapOne", [k, v]);
        }
        else {
            return $target1();
        }
    }
    else {
        return $target1();
    }
}

function tree_rebalance(t1, k, v, t2) {
    var t1h = tree_height(t1);
    var t2h = tree_height(t2);
    if (t2h > t1h + 2) {
        if (t2.Case === "MapNode") {
            if (tree_height(t2.Fields[2]) > t1h + 1) {
                if (t2.Fields[2].Case === "MapNode") {
                    return tree_mk(tree_mk(t1, k, v, t2.Fields[2].Fields[2]), t2.Fields[2].Fields[0], t2.Fields[2].Fields[1], tree_mk(t2.Fields[2].Fields[3], t2.Fields[0], t2.Fields[1], t2.Fields[3]));
                }
                else {
                    throw new Error("rebalance");
                }
            }
            else {
                return tree_mk(tree_mk(t1, k, v, t2.Fields[2]), t2.Fields[0], t2.Fields[1], t2.Fields[3]);
            }
        }
        else {
            throw new Error("rebalance");
        }
    }
    else {
        if (t1h > t2h + 2) {
            if (t1.Case === "MapNode") {
                if (tree_height(t1.Fields[3]) > t2h + 1) {
                    if (t1.Fields[3].Case === "MapNode") {
                        return tree_mk(tree_mk(t1.Fields[2], t1.Fields[0], t1.Fields[1], t1.Fields[3].Fields[2]), t1.Fields[3].Fields[0], t1.Fields[3].Fields[1], tree_mk(t1.Fields[3].Fields[3], k, v, t2));
                    }
                    else {
                        throw new Error("rebalance");
                    }
                }
                else {
                    return tree_mk(t1.Fields[2], t1.Fields[0], t1.Fields[1], tree_mk(t1.Fields[3], k, v, t2));
                }
            }
            else {
                throw new Error("rebalance");
            }
        }
        else {
            return tree_mk(t1, k, v, t2);
        }
    }
}
function tree_add(comparer, k, v, m) {
    if (m.Case === "MapOne") {
        var c = comparer.Compare(k, m.Fields[0]);
        if (c < 0) {
            return new MapTree("MapNode", [k, v, new MapTree("MapEmpty", []), m, 2]);
        }
        else if (c === 0) {
            return new MapTree("MapOne", [k, v]);
        }
        return new MapTree("MapNode", [k, v, m, new MapTree("MapEmpty", []), 2]);
    }
    else if (m.Case === "MapNode") {
        var c = comparer.Compare(k, m.Fields[0]);
        if (c < 0) {
            return tree_rebalance(tree_add(comparer, k, v, m.Fields[2]), m.Fields[0], m.Fields[1], m.Fields[3]);
        }
        else if (c === 0) {
            return new MapTree("MapNode", [k, v, m.Fields[2], m.Fields[3], m.Fields[4]]);
        }
        return tree_rebalance(m.Fields[2], m.Fields[0], m.Fields[1], tree_add(comparer, k, v, m.Fields[3]));
    }
    return new MapTree("MapOne", [k, v]);
}
function tree_find(comparer, k, m) {
    var res = tree_tryFind(comparer, k, m);
    if (res != null)
        return res;
    throw new Error("key not found");
}
function tree_tryFind(comparer, k, m) {
    if (m.Case === "MapOne") {
        var c = comparer.Compare(k, m.Fields[0]);
        return c === 0 ? m.Fields[1] : null;
    }
    else if (m.Case === "MapNode") {
        var c = comparer.Compare(k, m.Fields[0]);
        if (c < 0) {
            return tree_tryFind(comparer, k, m.Fields[2]);
        }
        else {
            if (c === 0) {
                return m.Fields[1];
            }
            else {
                return tree_tryFind(comparer, k, m.Fields[3]);
            }
        }
    }
    return null;
}
function tree_mem(comparer, k, m) {
    if (m.Case === "MapOne") {
        return comparer.Compare(k, m.Fields[0]) === 0;
    }
    else if (m.Case === "MapNode") {
        var c = comparer.Compare(k, m.Fields[0]);
        if (c < 0) {
            return tree_mem(comparer, k, m.Fields[2]);
        }
        else {
            if (c === 0) {
                return true;
            }
            else {
                return tree_mem(comparer, k, m.Fields[3]);
            }
        }
    }
    else {
        return false;
    }
}
function tree_mkFromEnumerator(comparer, acc, e) {
    var cur = e.next();
    while (!cur.done) {
        acc = tree_add(comparer, cur.value[0], cur.value[1], acc);
        cur = e.next();
    }
    return acc;
}
function tree_ofSeq(comparer, c) {
    var ie = c[Symbol.iterator]();
    return tree_mkFromEnumerator(comparer, tree_empty(), ie);
}
function tree_collapseLHS(stack) {
    if (stack.tail != null) {
        if (stack.head.Case === "MapOne") {
            return stack;
        }
        else if (stack.head.Case === "MapNode") {
            return tree_collapseLHS(ofArray([
                stack.head.Fields[2],
                new MapTree("MapOne", [stack.head.Fields[0], stack.head.Fields[1]]),
                stack.head.Fields[3]
            ], stack.tail));
        }
        else {
            return tree_collapseLHS(stack.tail);
        }
    }
    else {
        return new List();
    }
}
function tree_mkIterator(s) {
    return { stack: tree_collapseLHS(new List(s, new List())), started: false };
}
function tree_moveNext(i) {
    function current(i) {
        if (i.stack.tail == null) {
            return null;
        }
        else if (i.stack.head.Case === "MapOne") {
            return [i.stack.head.Fields[0], i.stack.head.Fields[1]];
        }
        throw new Error("Please report error: Map iterator, unexpected stack for current");
    }
    if (i.started) {
        if (i.stack.tail == null) {
            return { done: true, value: null };
        }
        else {
            if (i.stack.head.Case === "MapOne") {
                i.stack = tree_collapseLHS(i.stack.tail);
                return {
                    done: i.stack.tail == null,
                    value: current(i)
                };
            }
            else {
                throw new Error("Please report error: Map iterator, unexpected stack for moveNext");
            }
        }
    }
    else {
        i.started = true;
        return {
            done: i.stack.tail == null,
            value: current(i)
        };
    }
    
}
var FableMap = (function () {
    function FableMap() {
    }
    FableMap.prototype.ToString = function () {
        return "map [" + Array.from(this).map(toString).join("; ") + "]";
    };
    FableMap.prototype.Equals = function (m2) {
        return this.CompareTo(m2) === 0;
    };
    FableMap.prototype.CompareTo = function (m2) {
        var _this = this;
        return this === m2 ? 0 : compareWith(function (kvp1, kvp2) {
            var c = _this.comparer.Compare(kvp1[0], kvp2[0]);
            return c !== 0 ? c : compare(kvp1[1], kvp2[1]);
        }, this, m2);
    };
    FableMap.prototype[Symbol.iterator] = function () {
        var i = tree_mkIterator(this.tree);
        return {
            next: function () { return tree_moveNext(i); }
        };
    };
    FableMap.prototype.entries = function () {
        return this[Symbol.iterator]();
    };
    FableMap.prototype.keys = function () {
        return map$1(function (kv) { return kv[0]; }, this);
    };
    FableMap.prototype.values = function () {
        return map$1(function (kv) { return kv[1]; }, this);
    };
    FableMap.prototype.get = function (k) {
        return tree_find(this.comparer, k, this.tree);
    };
    FableMap.prototype.has = function (k) {
        return tree_mem(this.comparer, k, this.tree);
    };
    FableMap.prototype.set = function (k, v) {
        throw new Error("not supported");
    };
    FableMap.prototype.delete = function (k) {
        throw new Error("not supported");
    };
    FableMap.prototype.clear = function () {
        throw new Error("not supported");
    };
    Object.defineProperty(FableMap.prototype, "size", {
        get: function () {
            return tree_size(this.tree);
        },
        enumerable: true,
        configurable: true
    });
    FableMap.prototype[_Symbol.reflection] = function () {
        return {
            type: "Microsoft.FSharp.Collections.FSharpMap",
            interfaces: ["System.IEquatable", "System.IComparable", "System.Collections.Generic.IDictionary"]
        };
    };
    return FableMap;
}());
function from(comparer, tree) {
    var map$$1 = new FableMap();
    map$$1.tree = tree;
    map$$1.comparer = comparer || new GenericComparer();
    return map$$1;
}
function create$3(ie, comparer) {
    comparer = comparer || new GenericComparer();
    return from(comparer, ie ? tree_ofSeq(comparer, ie) : tree_empty());
}
function add$2(k, v, map$$1) {
    return from(map$$1.comparer, tree_add(map$$1.comparer, k, v, map$$1.tree));
}




function find$$1(k, map$$1) {
    return tree_find(map$$1.comparer, k, map$$1.tree);
}









function findKey(f, map$$1) {
    return pick$1(function (kv) { return f(kv[0], kv[1]) ? kv[0] : null; }, map$$1);
}

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Types = function (__exports) {
                var Word = __exports.Word = function () {
                                function Word(caseName, fields) {
                                                _classCallCheck$1(this, Word);

                                                this.Case = caseName;
                                                this.Fields = fields;
                                }

                                _createClass$1(Word, [{
                                                key: _Symbol.reflection,
                                                value: function () {
                                                                return {
                                                                                type: "VisualMIPS.Types.Word",
                                                                                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                                                                                cases: {
                                                                                                Word: ["number"]
                                                                                }
                                                                };
                                                }
                                }, {
                                                key: "Equals",
                                                value: function (other) {
                                                                return equalsUnions(this, other);
                                                }
                                }, {
                                                key: "CompareTo",
                                                value: function (other) {
                                                                return compareUnions(this, other);
                                                }
                                }]);

                                return Word;
                }();

                setType("VisualMIPS.Types.Word", Word);

                var Half = __exports.Half = function () {
                                function Half(caseName, fields) {
                                                _classCallCheck$1(this, Half);

                                                this.Case = caseName;
                                                this.Fields = fields;
                                }

                                _createClass$1(Half, [{
                                                key: _Symbol.reflection,
                                                value: function () {
                                                                return {
                                                                                type: "VisualMIPS.Types.Half",
                                                                                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                                                                                cases: {
                                                                                                Half: ["number"]
                                                                                }
                                                                };
                                                }
                                }, {
                                                key: "Equals",
                                                value: function (other) {
                                                                return equalsUnions(this, other);
                                                }
                                }, {
                                                key: "CompareTo",
                                                value: function (other) {
                                                                return compareUnions(this, other);
                                                }
                                }]);

                                return Half;
                }();

                setType("VisualMIPS.Types.Half", Half);

                var Byte = __exports.Byte = function () {
                                function Byte(caseName, fields) {
                                                _classCallCheck$1(this, Byte);

                                                this.Case = caseName;
                                                this.Fields = fields;
                                }

                                _createClass$1(Byte, [{
                                                key: _Symbol.reflection,
                                                value: function () {
                                                                return {
                                                                                type: "VisualMIPS.Types.Byte",
                                                                                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                                                                                cases: {
                                                                                                Byte: ["number"]
                                                                                }
                                                                };
                                                }
                                }, {
                                                key: "Equals",
                                                value: function (other) {
                                                                return equalsUnions(this, other);
                                                }
                                }, {
                                                key: "CompareTo",
                                                value: function (other) {
                                                                return compareUnions(this, other);
                                                }
                                }]);

                                return Byte;
                }();

                setType("VisualMIPS.Types.Byte", Byte);

                var Register = __exports.Register = function () {
                                function Register(caseName, fields) {
                                                _classCallCheck$1(this, Register);

                                                this.Case = caseName;
                                                this.Fields = fields;
                                }

                                _createClass$1(Register, [{
                                                key: _Symbol.reflection,
                                                value: function () {
                                                                return {
                                                                                type: "VisualMIPS.Types.Register",
                                                                                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                                                                                cases: {
                                                                                                Register: ["number"]
                                                                                }
                                                                };
                                                }
                                }, {
                                                key: "Equals",
                                                value: function (other) {
                                                                return equalsUnions(this, other);
                                                }
                                }, {
                                                key: "CompareTo",
                                                value: function (other) {
                                                                return compareUnions(this, other);
                                                }
                                }]);

                                return Register;
                }();

                setType("VisualMIPS.Types.Register", Register);

                var Memory = __exports.Memory = function () {
                                function Memory(caseName, fields) {
                                                _classCallCheck$1(this, Memory);

                                                this.Case = caseName;
                                                this.Fields = fields;
                                }

                                _createClass$1(Memory, [{
                                                key: _Symbol.reflection,
                                                value: function () {
                                                                return {
                                                                                type: "VisualMIPS.Types.Memory",
                                                                                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                                                                                cases: {
                                                                                                Memory: ["number"]
                                                                                }
                                                                };
                                                }
                                }, {
                                                key: "Equals",
                                                value: function (other) {
                                                                return equalsUnions(this, other);
                                                }
                                }, {
                                                key: "CompareTo",
                                                value: function (other) {
                                                                return compareUnions(this, other);
                                                }
                                }]);

                                return Memory;
                }();

                setType("VisualMIPS.Types.Memory", Memory);

                var Shiftval = __exports.Shiftval = function () {
                                function Shiftval(caseName, fields) {
                                                _classCallCheck$1(this, Shiftval);

                                                this.Case = caseName;
                                                this.Fields = fields;
                                }

                                _createClass$1(Shiftval, [{
                                                key: _Symbol.reflection,
                                                value: function () {
                                                                return {
                                                                                type: "VisualMIPS.Types.Shiftval",
                                                                                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                                                                                cases: {
                                                                                                Shiftval: ["number"]
                                                                                }
                                                                };
                                                }
                                }, {
                                                key: "Equals",
                                                value: function (other) {
                                                                return equalsUnions(this, other);
                                                }
                                }, {
                                                key: "CompareTo",
                                                value: function (other) {
                                                                return compareUnions(this, other);
                                                }
                                }]);

                                return Shiftval;
                }();

                setType("VisualMIPS.Types.Shiftval", Shiftval);

                var Targetval = __exports.Targetval = function () {
                                function Targetval(caseName, fields) {
                                                _classCallCheck$1(this, Targetval);

                                                this.Case = caseName;
                                                this.Fields = fields;
                                }

                                _createClass$1(Targetval, [{
                                                key: _Symbol.reflection,
                                                value: function () {
                                                                return {
                                                                                type: "VisualMIPS.Types.Targetval",
                                                                                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                                                                                cases: {
                                                                                                Targetval: ["number"]
                                                                                }
                                                                };
                                                }
                                }, {
                                                key: "Equals",
                                                value: function (other) {
                                                                return equalsUnions(this, other);
                                                }
                                }, {
                                                key: "CompareTo",
                                                value: function (other) {
                                                                return compareUnions(this, other);
                                                }
                                }]);

                                return Targetval;
                }();

                setType("VisualMIPS.Types.Targetval", Targetval);

                var T = __exports.T = function () {
                                function T() {
                                                _classCallCheck$1(this, T);
                                }

                                _createClass$1(T, [{
                                                key: _Symbol.reflection,
                                                value: function () {
                                                                return {
                                                                                type: "VisualMIPS.Types.T",
                                                                                properties: {}
                                                                };
                                                }
                                }], [{
                                                key: "getValue_0",
                                                value: function (_arg1) {
                                                                return _arg1.Fields[0];
                                                }
                                }, {
                                                key: "getValue_1",
                                                value: function (_arg2) {
                                                                return _arg2.Fields[0];
                                                }
                                }, {
                                                key: "getValue_2",
                                                value: function (_arg3) {
                                                                return _arg3.Fields[0];
                                                }
                                }, {
                                                key: "getValue_3",
                                                value: function (_arg4) {
                                                                return _arg4.Fields[0];
                                                }
                                }, {
                                                key: "getValue_4",
                                                value: function (_arg5) {
                                                                return _arg5.Fields[0];
                                                }
                                }, {
                                                key: "getValue_5",
                                                value: function (_arg6) {
                                                                return _arg6.Fields[0];
                                                }
                                }, {
                                                key: "getValue_6",
                                                value: function (_arg7) {
                                                                return _arg7.Fields[0];
                                                }
                                }]);

                                return T;
                }();

                setType("VisualMIPS.Types.T", T);
                return __exports;
}({});
var Instructions = function (__exports) {
                var Opcode = __exports.Opcode = function () {
                                function Opcode(caseName, fields) {
                                                _classCallCheck$1(this, Opcode);

                                                this.Case = caseName;
                                                this.Fields = fields;
                                }

                                _createClass$1(Opcode, [{
                                                key: _Symbol.reflection,
                                                value: function () {
                                                                return {
                                                                                type: "VisualMIPS.Instructions.Opcode",
                                                                                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                                                                                cases: {
                                                                                                ADD: [],
                                                                                                ADDI: [],
                                                                                                ADDIU: [],
                                                                                                ADDU: [],
                                                                                                AND: [],
                                                                                                ANDI: [],
                                                                                                BEQ: [],
                                                                                                BGEZ: [],
                                                                                                BGEZAL: [],
                                                                                                BGTZ: [],
                                                                                                BLEZ: [],
                                                                                                BLTZ: [],
                                                                                                BLTZAL: [],
                                                                                                BNE: [],
                                                                                                DIV: [],
                                                                                                DIVU: [],
                                                                                                J: [],
                                                                                                JAL: [],
                                                                                                JALR: [],
                                                                                                JR: [],
                                                                                                LB: [],
                                                                                                LBU: [],
                                                                                                LH: [],
                                                                                                LUI: [],
                                                                                                LW: [],
                                                                                                LWL: [],
                                                                                                LWR: [],
                                                                                                MFHI: [],
                                                                                                MFLO: [],
                                                                                                MTHI: [],
                                                                                                MTLO: [],
                                                                                                MULT: [],
                                                                                                MULTU: [],
                                                                                                OR: [],
                                                                                                ORI: [],
                                                                                                SB: [],
                                                                                                SH: [],
                                                                                                SLL: [],
                                                                                                SLLV: [],
                                                                                                SLT: [],
                                                                                                SLTI: [],
                                                                                                SLTIU: [],
                                                                                                SLTU: [],
                                                                                                SRA: [],
                                                                                                SRAV: [],
                                                                                                SRL: [],
                                                                                                SRLV: [],
                                                                                                SUB: [],
                                                                                                SUBU: [],
                                                                                                SW: [],
                                                                                                XOR: [],
                                                                                                XORI: []
                                                                                }
                                                                };
                                                }
                                }, {
                                                key: "Equals",
                                                value: function (other) {
                                                                return equalsUnions(this, other);
                                                }
                                }, {
                                                key: "CompareTo",
                                                value: function (other) {
                                                                return compareUnions(this, other);
                                                }
                                }]);

                                return Opcode;
                }();

                setType("VisualMIPS.Instructions.Opcode", Opcode);
                var IMap = __exports.IMap = create$3(ofArray([["ADDI", new Opcode("ADDI", [])], ["ADDIU", new Opcode("ADDIU", [])], ["ANDI", new Opcode("ANDI", [])], ["ORI", new Opcode("ORI", [])], ["XORI", new Opcode("XORI", [])], ["BEQ", new Opcode("BEQ", [])], ["BGEZ", new Opcode("BGEZ", [])], ["BGEZAL", new Opcode("BGEZAL", [])], ["BGTZ", new Opcode("BGTZ", [])], ["BLEZ", new Opcode("BLEZ", [])], ["BLTZ", new Opcode("BLTZ", [])], ["BLTZAL", new Opcode("BLTZAL", [])], ["BNE", new Opcode("BNE", [])], ["LB", new Opcode("LB", [])], ["LBU", new Opcode("LBU", [])], ["LH", new Opcode("LH", [])], ["LW", new Opcode("LW", [])], ["LWL", new Opcode("LWL", [])], ["LWR", new Opcode("LWR", [])], ["SB", new Opcode("SB", [])], ["SH", new Opcode("SH", [])], ["SW", new Opcode("SW", [])], ["LUI", new Opcode("LUI", [])], ["SLTI", new Opcode("SLTI", [])], ["SLTIU", new Opcode("SLTIU", [])]]), new GenericComparer(compare));
                var JMap = __exports.JMap = create$3(ofArray([["J", new Opcode("J", [])], ["JAL", new Opcode("JAL", [])]]), new GenericComparer(compare));
                var RMap = __exports.RMap = create$3(ofArray([["ADD", new Opcode("ADD", [])], ["ADDU", new Opcode("ADDU", [])], ["AND", new Opcode("AND", [])], ["OR", new Opcode("OR", [])], ["SRA", new Opcode("SRA", [])], ["SRAV", new Opcode("SRAV", [])], ["SRL", new Opcode("SRL", [])], ["SRLV", new Opcode("SRLV", [])], ["SLL", new Opcode("SLL", [])], ["SLLV", new Opcode("SLLV", [])], ["SUB", new Opcode("SUB", [])], ["SUBU", new Opcode("SUBU", [])], ["XOR", new Opcode("XOR", [])], ["SLT", new Opcode("SLT", [])], ["SLTU", new Opcode("SLTU", [])], ["DIV", new Opcode("DIV", [])], ["DIVU", new Opcode("DIVU", [])], ["MULT", new Opcode("MULT", [])], ["MULTU", new Opcode("MULTU", [])], ["JR", new Opcode("JR", [])], ["JALR", new Opcode("JALR", [])], ["MFHI", new Opcode("MFHI", [])], ["MFLO", new Opcode("MFLO", [])], ["MTHI", new Opcode("MTHI", [])], ["MTLO", new Opcode("MTLO", [])]]), new GenericComparer(compare));

                var Instr_Type = __exports.Instr_Type = function () {
                                function Instr_Type(caseName, fields) {
                                                _classCallCheck$1(this, Instr_Type);

                                                this.Case = caseName;
                                                this.Fields = fields;
                                }

                                _createClass$1(Instr_Type, [{
                                                key: _Symbol.reflection,
                                                value: function () {
                                                                return {
                                                                                type: "VisualMIPS.Instructions.Instr_Type",
                                                                                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                                                                                cases: {
                                                                                                I: [],
                                                                                                J: [],
                                                                                                R: []
                                                                                }
                                                                };
                                                }
                                }, {
                                                key: "Equals",
                                                value: function (other) {
                                                                return equalsUnions(this, other);
                                                }
                                }, {
                                                key: "CompareTo",
                                                value: function (other) {
                                                                return compareUnions(this, other);
                                                }
                                }]);

                                return Instr_Type;
                }();

                setType("VisualMIPS.Instructions.Instr_Type", Instr_Type);

                var Instruction = __exports.Instruction = function () {
                                function Instruction(opcode, instr_type, rs, rt, rd, shift, immed, target) {
                                                _classCallCheck$1(this, Instruction);

                                                this.opcode = opcode;
                                                this.instr_type = instr_type;
                                                this.rs = rs;
                                                this.rt = rt;
                                                this.rd = rd;
                                                this.shift = shift;
                                                this.immed = immed;
                                                this.target = target;
                                }

                                _createClass$1(Instruction, [{
                                                key: _Symbol.reflection,
                                                value: function () {
                                                                return {
                                                                                type: "VisualMIPS.Instructions.Instruction",
                                                                                interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                                                                                properties: {
                                                                                                opcode: Opcode,
                                                                                                instr_type: Instr_Type,
                                                                                                rs: Types.Register,
                                                                                                rt: Types.Register,
                                                                                                rd: Types.Register,
                                                                                                shift: Types.Shiftval,
                                                                                                immed: Types.Half,
                                                                                                target: Types.Targetval
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

                                return Instruction;
                }();

                setType("VisualMIPS.Instructions.Instruction", Instruction);
                return __exports;
}({});

var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RunState = function () {
    function RunState(caseName, fields) {
        _classCallCheck$2(this, RunState);

        this.Case = caseName;
        this.Fields = fields;
    }

    _createClass$2(RunState, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "VisualMIPS.MachineState.RunState",
                interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                cases: {
                    RunOK: [],
                    RunTimeErr: ["string"],
                    SyntaxErr: ["string"]
                }
            };
        }
    }, {
        key: "Equals",
        value: function (other) {
            return equalsUnions(this, other);
        }
    }, {
        key: "CompareTo",
        value: function (other) {
            return compareUnions(this, other);
        }
    }]);

    return RunState;
}();
setType("VisualMIPS.MachineState.RunState", RunState);
var MachineState = function () {
    function MachineState(regMap, hi, lo, memMap, state, pc, pcNext, pcNextNext) {
        _classCallCheck$2(this, MachineState);

        this.RegMap = regMap;
        this.Hi = hi;
        this.Lo = lo;
        this.MemMap = memMap;
        this.State = state;
        this.pc = pc;
        this.pcNext = pcNext;
        this.pcNextNext = pcNextNext;
    }

    _createClass$2(MachineState, [{
        key: _Symbol.reflection,
        value: function () {
            return {
                type: "VisualMIPS.MachineState.MachineState",
                interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                properties: {
                    RegMap: makeGeneric(FableMap, {
                        Key: Types.Register,
                        Value: Types.Word
                    }),
                    Hi: Types.Word,
                    Lo: Types.Word,
                    MemMap: makeGeneric(FableMap, {
                        Key: Types.Memory,
                        Value: Types.Word
                    }),
                    State: RunState,
                    pc: Types.Word,
                    pcNext: Types.Word,
                    pcNextNext: Option(Types.Word)
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

    return MachineState;
}();
setType("VisualMIPS.MachineState.MachineState", MachineState);
function getReg(reg, mach) {
    return find$$1(reg, mach.RegMap);
}
function getHi(mach) {
    return mach.Hi;
}
function getLo(mach) {
    return mach.Lo;
}

function getPC(mach) {
    return mach.pc;
}
function getNextPC(mach) {
    return mach.pcNext;
}
function getNextNextPC(mach) {
    return mach.pcNextNext;
}


function setReg(reg, data, mach) {
    var newRegMap = add$2(reg, data, mach.RegMap);
    var newMach = new MachineState(newRegMap, mach.Hi, mach.Lo, mach.MemMap, mach.State, mach.pc, mach.pcNext, mach.pcNextNext);
    return newMach;
}




var initialise = function () {
    var regMap = void 0;
    var reg = Int32Array.from(range(0, 31));
    regMap = create$3(Array.from(map$1(function (i) {
        return [new Types.Register("Register", [i]), new Types.Word("Word", [0])];
    }, reg)), new GenericComparer(function (x, y) {
        return x.CompareTo(y);
    }));
    var memMap = create$3(null, new GenericComparer(compare));
    return new MachineState(regMap, new Types.Word("Word", [0]), new Types.Word("Word", [0]), memMap, new RunState("RunOK", []), new Types.Word("Word", [0]), new Types.Word("Word", [4]), new Types.Word("Word", [8]));
}();

function tokenise(s) {
    return split$1(s, " ", ",", "\t", "\n", "\r", "\f").filter(function () {
        var x = "";
        return function (y) {
            return x !== y;
        };
    }());
}

function parseI_Type(iTokens) {
    var opcode = find$$1(iTokens[0], Instructions.IMap);
    var r_s = new Types.Register("Register", [Number.parseInt(iTokens[1])]);
    var r_t = new Types.Register("Register", [Number.parseInt(iTokens[2])]);
    var immed = new Types.Half("Half", [Number.parseInt(iTokens[3])]);
    return new Instructions.Instruction(opcode, new Instructions.Instr_Type("I", []), r_s, r_t, new Types.Register("Register", [0]), new Types.Shiftval("Shiftval", [0]), immed, new Types.Targetval("Targetval", [0]));
}
function parseJ_Type(jTokens) {
    var opcode = find$$1(jTokens[0], Instructions.JMap);
    var target = new Types.Targetval("Targetval", [Number.parseInt(jTokens[1])]);
    return new Instructions.Instruction(opcode, new Instructions.Instr_Type("J", []), new Types.Register("Register", [0]), new Types.Register("Register", [0]), new Types.Register("Register", [0]), new Types.Shiftval("Shiftval", [0]), new Types.Half("Half", [0]), target);
}
function parseR_Type(rTokens) {
    var opcode = find$$1(rTokens[0], Instructions.RMap);
    var r_s = new Types.Register("Register", [Number.parseInt(rTokens[1])]);
    var r_t = new Types.Register("Register", [Number.parseInt(rTokens[2])]);
    var r_d = new Types.Register("Register", [Number.parseInt(rTokens[3])]);
    var shift = new Types.Shiftval("Shiftval", [Number.parseInt(rTokens[4])]);
    return new Instructions.Instruction(opcode, new Instructions.Instr_Type("R", []), r_s, r_t, r_d, shift, new Types.Half("Half", [0]), new Types.Targetval("Targetval", [0]));
}
function parse$1(tokens) {
    if (Instructions.IMap.has(tokens[0])) {
        return parseI_Type(tokens);
    } else if (Instructions.JMap.has(tokens[0])) {
        return parseJ_Type(tokens);
    } else if (Instructions.RMap.has(tokens[0])) {
        return parseR_Type(tokens);
    } else {
        throw new Error("Invalid Opcode: Does not exist in MIPS I!");
    }
}

function opAND(mach, instr, _arg2, _arg1) {
    return new Types.Word("Word", [_arg2.Fields[0] & _arg1.Fields[0]]);
}
function opOR(mach, instr, _arg2, _arg1) {
    return new Types.Word("Word", [_arg2.Fields[0] | _arg1.Fields[0]]);
}
function opSRAV(mach, instr, _arg2, _arg1) {
    return new Types.Word("Word", [~~_arg1.Fields[0] >> ~~_arg2.Fields[0] >>> 0]);
}



function opXOR(mach, instr, _arg2, _arg1) {
    return new Types.Word("Word", [_arg2.Fields[0] ^ _arg1.Fields[0]]);
}




function opSRA(mach, instr, _arg3, _arg2, _arg1) {
    return new Types.Word("Word", [~~_arg2.Fields[0] >> ~~_arg1.Fields[0] >>> 0]);
}

function processMultDiv(instr, mach) {
    throw new Error("Not Implemented");
}
function processHILO(instr, mach) {
    throw new Error("Not Implemented");
}

function processSimpleR(instr, mach) {
    var localMap = create$3(ofArray([[new Instructions.Opcode("AND", []), function (mach_1) {
        return function (instr_1) {
            return function (arg20_) {
                return function (arg30_) {
                    return opAND(mach_1, instr_1, arg20_, arg30_);
                };
            };
        };
    }], [new Instructions.Opcode("OR", []), function (mach_2) {
        return function (instr_2) {
            return function (arg20__1) {
                return function (arg30__1) {
                    return opOR(mach_2, instr_2, arg20__1, arg30__1);
                };
            };
        };
    }], [new Instructions.Opcode("SRAV", []), function (mach_3) {
        return function (instr_3) {
            return function (arg20__2) {
                return function (arg30__2) {
                    return opSRAV(mach_3, instr_3, arg20__2, arg30__2);
                };
            };
        };
    }], [new Instructions.Opcode("XOR", []), function (mach_4) {
        return function (instr_4) {
            return function (arg20__3) {
                return function (arg30__3) {
                    return opXOR(mach_4, instr_4, arg20__3, arg30__3);
                };
            };
        };
    }]]), new GenericComparer(function (x, y) {
        return x.CompareTo(y);
    }));
    var rs = getReg(instr.rs, mach);
    var rt = getReg(instr.rt, mach);
    var fn = find$$1(instr.opcode, localMap);
    var output = fn(mach)(instr)(rs)(rt);
    return setReg(instr.rd, output, mach);
}
function processShiftR(instr, mach) {
    var localMap = create$3(ofArray([[new Instructions.Opcode("SRA", []), function (mach_1) {
        return function (instr_1) {
            return function (arg20_) {
                return function (arg30_) {
                    return function (arg40_) {
                        return opSRA(mach_1, instr_1, arg20_, arg30_, arg40_);
                    };
                };
            };
        };
    }]]), new GenericComparer(function (x, y) {
        return x.CompareTo(y);
    }));
    var rs = getReg(instr.rs, mach);
    var rt = getReg(instr.rt, mach);
    var fn = find$$1(instr.opcode, localMap);
    var output = fn(mach)(instr)(rs)(rt)(instr.shift);
    return setReg(instr.rd, output, mach);
}
var opTypeMap = create$3(ofArray([[ofArray([new Instructions.Opcode("DIV", []), new Instructions.Opcode("DIVU", []), new Instructions.Opcode("MULT", []), new Instructions.Opcode("MULTU", [])]), function (instr) {
    return function (mach) {
        return processMultDiv(instr, mach);
    };
}], [ofArray([new Instructions.Opcode("MFHI", []), new Instructions.Opcode("MFLO", []), new Instructions.Opcode("MTHI", []), new Instructions.Opcode("MTLO", [])]), function (instr_1) {
    return function (mach_1) {
        return processHILO(instr_1, mach_1);
    };
}], [ofArray([new Instructions.Opcode("AND", []), new Instructions.Opcode("XOR", []), new Instructions.Opcode("OR", [])]), function (instr_2) {
    return function (mach_2) {
        return processSimpleR(instr_2, mach_2);
    };
}], [ofArray([new Instructions.Opcode("SRA", [])]), function (instr_3) {
    return function (mach_3) {
        return processShiftR(instr_3, mach_3);
    };
}]]), new GenericComparer(function (x, y) {
    return x.CompareTo(y);
}));
function executeInstruction(instr, mach) {
    var key = findKey(function (x, _arg1) {
        return exists$1(function (x) {
            return equals(instr.opcode, x);
        }, x);
    }, opTypeMap);
    var fn = find$$1(key, opTypeMap);
    return fn(instr)(mach);
}

var Util = function (__exports) {
    var load = __exports.load = function (key) {
        return defaultArg(localStorage.getItem(key), null, function ($var13) {
            return function (value) {
                return value;
            }(function (arg00) {
                return JSON.parse(arg00);
            }($var13));
        });
    };

    var save = __exports.save = function (key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    };

    return __exports;
}({});
function saveToLocalStorage(arg1, arg2) {
    Util.save(arg1, arg2);
}
function loadFromLocalStorage(arg1) {
    return Util.load(arg1);
}
var editId = getById("editor");
var cmEditor = CodeMirror.fromTextArea(editId, initOptions);
saveToLocalStorage("hello", "world");
var getValue = function () {
    var q = loadFromLocalStorage("hello");

    if (q != null) {
        return q;
    } else {
        throw new Error("/Users/jian/Desktop/Jian/EIE3/Spring/HLP/HLP_Project/src/VisualMipsWeb/webComponent/src/main.fs", 102, 14);
    }
}();
var z = "AND 1,2,3      # this is a comment!\nAND 1,2,4      # this is a comment!\nAND 1,2,5      # this is a comment!\nAND 1,2,6      # this is a comment!\nAND 1,2,7      # this is a comment!";
cmEditor.setValue(z);
var mm = cmEditor.getLine(0);
var executeButton = getById("execute");
var resetButton = getById("reset");
var stepBackwardsButton = getById("stepBackwards");
var stepForwardsButton = getById("stepForwards");
var errorLog = getById("errorLog");
var HTMLRegister0 = getById("mipsRegister0");
var HTMLRegister1 = getById("mipsRegister1");
var HTMLRegister2 = getById("mipsRegister2");
var HTMLRegister3 = getById("mipsRegister3");
var HTMLRegister4 = getById("mipsRegister4");
var HTMLRegister5 = getById("mipsRegister5");
var HTMLRegister6 = getById("mipsRegister6");
var HTMLRegister7 = getById("mipsRegister7");
var HTMLRegister8 = getById("mipsRegister8");
var HTMLRegister9 = getById("mipsRegister9");
var HTMLRegister10 = getById("mipsRegister10");
var HTMLRegister11 = getById("mipsRegister11");
var HTMLRegister12 = getById("mipsRegister12");
function modifyRegisterInHTML(register, registerValue) {
    register.innerHTML = registerValue;
}
function updateRegisterValuesInHTML(mach) {
    var getIDAndUpdateRegisterValue = function getIDAndUpdateRegisterValue(registerNumber) {
        return function (result) {
            fsFormat("debugging this - %A")(function (x) {
                console.log(x);
            })(String(registerNumber));
            var HTMLRegister = getById("mipsRegister" + String(registerNumber));
            HTMLRegister.innerHTML = result;
        };
    };

    for (var i = 0; i <= 31; i++) {
        var matchValue = mach.RegMap.get(new Types.Register("Register", [i]));
        getIDAndUpdateRegisterValue(i)(String(matchValue.Fields[0]));
    }
}
function updateProgramCounterInHTML(mach) {
    var PC = getById("mipsRegister-1");
    var nextPC = getById("mipsRegister-2");
    var nextNextPC = getById("mipsRegister-3");
    PC.innerHTML = String(mach.pc.Fields[0]);
    nextPC.innerHTML = String(mach.pcNext.Fields[0]);

    if (mach.pcNextNext == null) {
        nextNextPC.innerHTML = "null";
    } else {
        nextNextPC.innerHTML = toString(mach.pcNextNext);
    }
}
var globalMachineStates = new Map();
globalMachineStates.set("line-1", setReg(new Types.Register("Register", [2]), new Types.Word("Word", [32]), setReg(new Types.Register("Register", [1]), new Types.Word("Word", [32]), initialise)));
fsFormat("init example - %A")(function (x) {
    console.log(x);
})(initialise);
fsFormat("from dictionary - %A")(function (x) {
    console.log(x);
})(globalMachineStates);
updateRegisterValuesInHTML(globalMachineStates.get("line-1"));
updateProgramCounterInHTML(globalMachineStates.get("line-1"));
function updateGlobalMachineState(currentLine, mach) {
    globalMachineStates.set("line" + String(currentLine), mach);
}
function getCurrentMachineState(currentLineNumber) {
    return globalMachineStates.get("line" + String(currentLineNumber));
}
function printLogAndUpdateRegisters(currentLineNumber) {
    var machStateToString = function machStateToString(mach) {
        if (mach.State.Case === "RunTimeErr") {
            return "RunTimeErr : " + mach.State.Fields[0];
        } else if (mach.State.Case === "SyntaxErr") {
            return "SyntaxErr : " + mach.State.Fields[0];
        } else {
            return "RunOK";
        }
    };

    var hiToString = function hiToString(mach_1) {
        var matchValue = getHi(mach_1);
        return "Hi : " + String(matchValue.Fields[0]);
    };

    var loToString = function loToString(mach_2) {
        var matchValue_1 = getLo(mach_2);
        return "Lo : " + String(matchValue_1.Fields[0]);
    };

    var pcToString = function pcToString(mach_3) {
        var matchValue_2 = getPC(mach_3);
        return "PC : " + String(matchValue_2.Fields[0]);
    };

    var nextPCToString = function nextPCToString(mach_4) {
        var matchValue_3 = getNextPC(mach_4);
        return "nextPC : " + String(matchValue_3.Fields[0]);
    };

    var nextNextPCToString = function nextNextPCToString(mach_5) {
        var matchValue_4 = getNextNextPC(mach_5);

        if (matchValue_4 == null) {
            return "Nothing is here";
        } else {
            return "NextNextPC : " + toString(matchValue_4);
        }
    };

    var registerStateToString = function registerStateToString(mach_6) {
        for (var i = 0; i <= 31; i++) {
            var matchValue_5 = mach_6.RegMap.get(new Types.Register("Register", [i]));
            errorLog.insertAdjacentHTML("beforeend", "R" + String(i) + "=" + String(matchValue_5.Fields[0]) + "   ");
        }
    };

    errorLog.insertAdjacentHTML("beforeend", "<p>Line " + String(currentLineNumber) + ": " + cmEditor.getLine(currentLineNumber) + " " + machStateToString(getCurrentMachineState(currentLineNumber)) + " " + "</p>");
    errorLog.insertAdjacentHTML("beforeend", "<p>" + hiToString(getCurrentMachineState(currentLineNumber)) + " " + loToString(getCurrentMachineState(currentLineNumber)) + " " + pcToString(getCurrentMachineState(currentLineNumber)) + " " + nextPCToString(getCurrentMachineState(currentLineNumber)) + " " + nextNextPCToString(getCurrentMachineState(currentLineNumber)) + "</p>");
    registerStateToString(getCurrentMachineState(currentLineNumber));
}
function executeHandler() {
    var eachLineProcessing = function eachLineProcessing(currentLine) {
        var codeMirrorText = cmEditor.getLine(currentLine);
        var input = tokenise(codeMirrorText);
        var instruction = parse$1(input);

        (function (mach) {
            updateGlobalMachineState(currentLine, mach);
        })(function (mach_1) {
            return executeInstruction(instruction, mach_1);
        }(getCurrentMachineState(currentLine - 1)));

        printLogAndUpdateRegisters(currentLine);
    };

    var processAllCodeMirrorInput = function processAllCodeMirrorInput(startLine) {
        return function (lastLine) {
            if (startLine === lastLine) {
                eachLineProcessing(lastLine);
            } else {
                eachLineProcessing(startLine);
                processAllCodeMirrorInput(startLine + 1)(lastLine);
            }
        };
    };

    processAllCodeMirrorInput(0)(cmEditor.lastLine());
}
function executeButtonHandler() {
    updateRegisterValuesInHTML(getCurrentMachineState(cmEditor.lastLine()));
    updateProgramCounterInHTML(getCurrentMachineState(cmEditor.lastLine()));
}
function resetButtonHandler() {
    modifyRegisterInHTML(HTMLRegister0, "0");
    modifyRegisterInHTML(HTMLRegister1, "0");
    modifyRegisterInHTML(HTMLRegister2, "0");
    modifyRegisterInHTML(HTMLRegister3, "0");
    modifyRegisterInHTML(HTMLRegister4, "0");
    modifyRegisterInHTML(HTMLRegister5, "0");
    modifyRegisterInHTML(HTMLRegister6, "0");
    modifyRegisterInHTML(HTMLRegister7, "0");
    modifyRegisterInHTML(HTMLRegister8, "0");
    modifyRegisterInHTML(HTMLRegister9, "0");
    modifyRegisterInHTML(HTMLRegister10, "0");
    modifyRegisterInHTML(HTMLRegister11, "0");
    modifyRegisterInHTML(HTMLRegister12, "0");
    errorLog.innerHTML = "";
}
function stepBackwardsButtonHandler() {
    var currentLine = cmEditor.getCursor();
    var previousMachineState = globalMachineStates.get("line" + String(currentLine.line - 1));
    updateRegisterValuesInHTML(previousMachineState);
    updateProgramCounterInHTML(previousMachineState);
    currentLine.line = currentLine.line - 1;
    cmEditor.setCursor(currentLine);
}
function stepForwardsButtonHandler() {
    var currentLine = cmEditor.getCursor();
    var nextMachineState = globalMachineStates.get("line" + String(currentLine.line));
    updateRegisterValuesInHTML(nextMachineState);
    updateProgramCounterInHTML(nextMachineState);
    currentLine.line = currentLine.line + 1;
    cmEditor.setCursor(currentLine);
}
executeButton.addEventListener('click', function (_arg1) {
    executeHandler();
    executeButtonHandler();
    return null;
});
resetButton.addEventListener('click', function (_arg2) {
    resetButtonHandler();
    return null;
});
stepBackwardsButton.addEventListener('click', function (_arg3) {
    executeHandler();
    stepBackwardsButtonHandler();
    return null;
});
stepForwardsButton.addEventListener('click', function (_arg4) {
    executeHandler();
    stepForwardsButtonHandler();
    return null;
});

exports.Util = Util;
exports.saveToLocalStorage = saveToLocalStorage;
exports.loadFromLocalStorage = loadFromLocalStorage;
exports.editId = editId;
exports.cmEditor = cmEditor;
exports.getValue = getValue;
exports.z = z;
exports.mm = mm;
exports.executeButton = executeButton;
exports.resetButton = resetButton;
exports.stepBackwardsButton = stepBackwardsButton;
exports.stepForwardsButton = stepForwardsButton;
exports.errorLog = errorLog;
exports.HTMLRegister0 = HTMLRegister0;
exports.HTMLRegister1 = HTMLRegister1;
exports.HTMLRegister2 = HTMLRegister2;
exports.HTMLRegister3 = HTMLRegister3;
exports.HTMLRegister4 = HTMLRegister4;
exports.HTMLRegister5 = HTMLRegister5;
exports.HTMLRegister6 = HTMLRegister6;
exports.HTMLRegister7 = HTMLRegister7;
exports.HTMLRegister8 = HTMLRegister8;
exports.HTMLRegister9 = HTMLRegister9;
exports.HTMLRegister10 = HTMLRegister10;
exports.HTMLRegister11 = HTMLRegister11;
exports.HTMLRegister12 = HTMLRegister12;
exports.modifyRegisterInHTML = modifyRegisterInHTML;
exports.updateRegisterValuesInHTML = updateRegisterValuesInHTML;
exports.updateProgramCounterInHTML = updateProgramCounterInHTML;
exports.globalMachineStates = globalMachineStates;
exports.updateGlobalMachineState = updateGlobalMachineState;
exports.getCurrentMachineState = getCurrentMachineState;
exports.printLogAndUpdateRegisters = printLogAndUpdateRegisters;
exports.executeHandler = executeHandler;
exports.executeButtonHandler = executeButtonHandler;
exports.resetButtonHandler = resetButtonHandler;
exports.stepBackwardsButtonHandler = stepBackwardsButtonHandler;
exports.stepForwardsButtonHandler = stepForwardsButtonHandler;

}((this.files = this.files || {})));

//# sourceMappingURL=bundle.js.map