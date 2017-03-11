/**
* Convert From/To Binary/Decimal/Hexadecimal in JavaScript
* https://gist.github.com/faisalman
*
* Copyright 2012-2015, Faisalman <fyzlman@gmail.com>
* Licensed under The MIT License
* http://www.opensource.org/licenses/mit-license
*/

var ConvertBase = function (num) {
    return {
        from : function (baseFrom) {
            return {
                to : function (baseTo) {
                    return parseInt(num, baseFrom).toString(baseTo);
                }
            };
        }
    };
};
    
// binary to decimal
ConvertBase.bin2dec = function (num) {
    return ConvertBase(num).from(2).to(10);
};

// binary to hexadecimal
ConvertBase.bin2hex = function (num) {
    return ConvertBase(num).from(2).to(16);
};

// decimal to binary
ConvertBase.dec2bin = function (num) {
    return ConvertBase(num).from(10).to(2);
};

// decimal to hexadecimal
ConvertBase.dec2hex = function (num) {
    return ConvertBase(num).from(10).to(16);
};

// hexadecimal to binary
ConvertBase.hex2bin = function (num) {
    return ConvertBase(num).from(16).to(2);
};

// hexadecimal to decimal
ConvertBase.hex2dec = function (num) {
    return ConvertBase(num).from(16).to(10);
};

this.ConvertBase = ConvertBase;
    


/*
* Usage example:
* ConvertBase.bin2dec('111'); // '7'
* ConvertBase.dec2hex('42'); // '2a'
* ConvertBase.hex2bin('f8'); // '11111000'
* ConvertBase.dec2bin('22'); // '10110'
*/

// Current state : Binary
// Binary -> Hex
// on button press && state === Binary
function mipsRegisterBinary2Hex(registerNumber){
    var mipsRegister = document.getElementById("mipsRegister"+registerNumber)
    var mipsRegisterBinaryButton = document.getElementById("mipsRegister"+registerNumber+"BinaryButton")
    var mipsRegisterHexButton = document.getElementById("mipsRegister"+registerNumber+"HexButton")
    var mipsRegisterDecimalButton = document.getElementById("mipsRegister"+registerNumber+"DecimalButton")

    mipsRegister.innerHTML = (ConvertBase.bin2hex(mipsRegister.innerHTML)).toUpperCase()
    
    mipsRegisterBinaryButton.className = "btn waves-effect waves-light black"
    mipsRegisterHexButton.className = "btn waves-effect waves-light red"
}

// Binary -> Decimal
function mipsRegisterBinary2Decimal(registerNumber){
    var mipsRegister = document.getElementById("mipsRegister"+registerNumber)
    var mipsRegisterBinaryButton = document.getElementById("mipsRegister"+registerNumber+"BinaryButton")
    var mipsRegisterHexButton = document.getElementById("mipsRegister"+registerNumber+"HexButton")
    var mipsRegisterDecimalButton = document.getElementById("mipsRegister"+registerNumber+"DecimalButton")

    mipsRegister.innerHTML = ConvertBase.bin2dec(mipsRegister.innerHTML)
    
    mipsRegisterBinaryButton.className = "btn waves-effect waves-light black"
    mipsRegisterDecimalButton.className = "btn waves-effect waves-light red"
}


// Current state : Hex
// Hex -> Binary
function mipsRegisterHex2Binary(registerNumber){
    var mipsRegister = document.getElementById("mipsRegister"+registerNumber)
    var mipsRegisterBinaryButton = document.getElementById("mipsRegister"+registerNumber+"BinaryButton")
    var mipsRegisterHexButton = document.getElementById("mipsRegister"+registerNumber+"HexButton")
    var mipsRegisterDecimalButton = document.getElementById("mipsRegister"+registerNumber+"DecimalButton")

    mipsRegister.innerHTML = ConvertBase.hex2bin(mipsRegister.innerHTML)
    
    mipsRegisterHexButton.className = "btn waves-effect waves-light black"
    mipsRegisterBinaryButton.className = "btn waves-effect waves-light red"
}
// Hex -> Decimal
function mipsRegisterHex2Decimal(registerNumber){
    var mipsRegister = document.getElementById("mipsRegister"+registerNumber)
    var mipsRegisterBinaryButton = document.getElementById("mipsRegister"+registerNumber+"BinaryButton")
    var mipsRegisterHexButton = document.getElementById("mipsRegister"+registerNumber+"HexButton")
    var mipsRegisterDecimalButton = document.getElementById("mipsRegister"+registerNumber+"DecimalButton")

    mipsRegister.innerHTML = ConvertBase.hex2dec(mipsRegister.innerHTML)
    
    mipsRegisterHexButton.className = "btn waves-effect waves-light black"
    mipsRegisterDecimalButton.className = "btn waves-effect waves-light red"
}


// Current state : Decimal
// Decimal -> Binary
function mipsRegisterDecimal2Binary(registerNumber){
    var mipsRegister = document.getElementById("mipsRegister"+registerNumber)
    var mipsRegisterBinaryButton = document.getElementById("mipsRegister"+registerNumber+"BinaryButton")
    var mipsRegisterHexButton = document.getElementById("mipsRegister"+registerNumber+"HexButton")
    var mipsRegisterDecimalButton = document.getElementById("mipsRegister"+registerNumber+"DecimalButton")

    mipsRegister.innerHTML = ConvertBase.dec2bin(mipsRegister.innerHTML)
    
    mipsRegisterDecimalButton.className = "btn waves-effect waves-light black"
    mipsRegisterBinaryButton.className = "btn waves-effect waves-light red"
}
// Decimal -> Hex
function mipsRegisterDecimal2Hex(registerNumber){
    var mipsRegister = document.getElementById("mipsRegister"+registerNumber)
    var mipsRegisterBinaryButton = document.getElementById("mipsRegister"+registerNumber+"BinaryButton")
    var mipsRegisterHexButton = document.getElementById("mipsRegister"+registerNumber+"HexButton")
    var mipsRegisterDecimalButton = document.getElementById("mipsRegister"+registerNumber+"DecimalButton")

    mipsRegister.innerHTML = (ConvertBase.dec2hex(mipsRegister.innerHTML)).toUpperCase()
    
    mipsRegisterDecimalButton.className = "btn waves-effect waves-light black"
    mipsRegisterHexButton.className = "btn waves-effect waves-light red"
}

var mipsRegister0Active = "binary"
var mipsRegister1Active = "binary"
var mipsRegister2Active = "binary"
var mipsRegister3Active = "binary"
var mipsRegister4Active = "binary"
var mipsRegister5Active = "binary"
var mipsRegister6Active = "binary"
var mipsRegister7Active = "binary"
var mipsRegister8Active = "binary"
var mipsRegister9Active = "binary"
var mipsRegister10Active = "binary"
var mipsRegister11Active = "binary"
var mipsRegister12Active = "binary"

function subButtonLogicHandler(registerNumber,currentActiveState){

    switch(registerNumber){
        case 0:
            mipsRegister0Active = currentActiveState; break;
        case 1:
            mipsRegister1Active = currentActiveState; break;
        case 2:
            mipsRegister2Active = currentActiveState; break;
        case 3:
            mipsRegister3Active = currentActiveState; break;
        case 4:
            mipsRegister4Active = currentActiveState; break;
        case 5:
            mipsRegister5Active = currentActiveState; break;
        case 6:
            mipsRegister6Active = currentActiveState; break;
        case 7:
            mipsRegister7Active = currentActiveState; break;
        case 8:
            mipsRegister8Active = currentActiveState; break;
        case 9:
            mipsRegister9Active = currentActiveState; break;
        case 10:
            mipsRegister10Active = currentActiveState; break;
        case 11:
            mipsRegister11Active = currentActiveState; break;
        case 12:
            mipsRegister12Active = currentActiveState; break;
        default: 
            break;
    }
}

function getMIPSRegisterLogicHandler(registerNumber){
    switch(registerNumber){
        case 0:
            return mipsRegister0Active
        case 1:
            return mipsRegister1Active
        case 2:
            return mipsRegister2Active
        case 3:
            return mipsRegister3Active
        case 4:
            return mipsRegister4Active
        case 5:
            return mipsRegister5Active
        case 6:
            return mipsRegister6Active
        case 7:
            return mipsRegister7Active
        case 8:
            return mipsRegister8Active
        case 9:
            return mipsRegister9Active
        case 10:
            return mipsRegister10Active
        case 11:
            return mipsRegister11Active
        case 12:
            return mipsRegister12Active
        default: 
            break;
    }
}

function buttonLogicHandler(registerNumber,buttonPressed){
    var x = getMIPSRegisterLogicHandler(registerNumber)

    if(x === "binary"){
        if(buttonPressed === "hex"){
            mipsRegisterBinary2Hex(registerNumber)
            subButtonLogicHandler(registerNumber,"hex")
        }
        else if(buttonPressed === "decimal"){
            mipsRegisterBinary2Decimal(registerNumber)
            subButtonLogicHandler(registerNumber,"decimal")
        }
    }
    else if(x === "hex"){
        if(buttonPressed === "decimal"){
            mipsRegisterHex2Decimal(registerNumber)
            subButtonLogicHandler(registerNumber,"decimal")
        }
        else if(buttonPressed === "binary"){
            mipsRegisterHex2Binary(registerNumber)
            subButtonLogicHandler(registerNumber,"binary")
        }
    }
    else if(x === "decimal"){
        if(buttonPressed === "hex"){
            mipsRegisterDecimal2Hex(registerNumber)
            subButtonLogicHandler(registerNumber,"hex")
        }
        else if(buttonPressed === "binary"){
            mipsRegisterDecimal2Binary(registerNumber)
            subButtonLogicHandler(registerNumber,"binary")
        }
    }
}