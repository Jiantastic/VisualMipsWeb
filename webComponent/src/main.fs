(* 

Components involved:

Local Storage - store data in JSON Format
Program component - wrapper for entire application
CodeMirror component - code this in JavaScript maybe?
Registers component - wrapper for all registers
Register component - 1 instance of a register, under Registers component
Flags component - MIPS flags. Are there any?


How does RESET work?

Reset simply sets everything to 0, execute gets last value

How does STEP FORWARD, STEP BACKWARD works?

we need to store the states of all steps in HTML5 localStorage


Codemirror todo: https://codemirror.net/doc/manual.html

add sublime code bindings
add search cursor - http://codemirror.net/doc/manual.html#addons

// ADD CODEMIRROR bindings to F#, able to access Codemirror API via F#!

Codemirror.getline -> lex() -> parse() -> execute() -> save state in localStorage

*)
// BROWSER DOCUMENTATION -> https://github.com/fable-compiler/Fable/blob/master/src/fable/Fable.Core/Import/Fable.Import.Browser.fs

module App.Main

open System
open Fable.Core
open Fable.Core.JsInterop
open Fable.Import
open App.CodeMirrorInterface


// load and save data from browser local storage
// example usage : go to https://visualmips.github.io/tests, open dev tools, type this in:
// window.Util.save("hello","world")
// window.Util.load("hello")
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Example_of_using_JSON.stringify()_with_localStorage
module Util =
    let load<'T> key =
        Browser.localStorage.getItem(key) |> unbox
        |> Option.map (JS.JSON.parse >> unbox<'T>)

    let save key (data: 'T) =
        Browser.localStorage.setItem(key, JS.JSON.stringify data)


// getters and setters for HTML5 localStorage
// change this to Option a' type?

// saving data format -> key : string, value : Record OR Union type

// API to save/load to HTML5 localStorage
let save arg1 arg2 = Util.save arg1 arg2

// loading data format -> key : string
let load arg1 = Util.load arg1
let editId = getById<Browser.HTMLTextAreaElement>("editor")

let cmEditor = App.CodeMirrorImports.CodeMirror.fromTextArea(editId, initOptions)

save "hello" "world"


// THIS FUCKING WORKS
// add None handler to complete match statements

let getValue = 
    let q : Option<string> = load "hello"
    match q with 
    | Some x -> x 


// let ff = 
//     let q = f "hello"
//     match q with 
//     | Some f -> f
//     | None -> printfn "hello world"

let z = "MIPSY stuff in here"

cmEditor.setValue z


// TODO : algorithm to traverse code
// go through code line by line while less than or equal to myCodeMirror.lastLine()
// for each line, do lex(), parse(), execute() BASED ON information of previous line, then store result in HTML5 local Storage in the form where key : "line" + <current_line_number>, "value" : registerState Record type
let mm = cmEditor.getLine 0

//printfn "value of first line is %A" mm

// HTML elements
let executeButton = getById<Browser.HTMLButtonElement>("execute")
let resetButton = getById<Browser.HTMLButtonElement>("reset")
let stepBackwardsButton = getById<Browser.HTMLButtonElement>("stepBackwards")
let stepForwardsButton =  getById<Browser.HTMLButtonElement>("stepForwards")
let output = getById<Browser.HTMLDivElement>("output")
let register1 = getById<Browser.HTMLElement>("mipsRegister1")
let register2 = getById<Browser.HTMLElement>("mipsRegister2")
let register3 = getById<Browser.HTMLElement>("mipsRegister3")
let register4 = getById<Browser.HTMLElement>("mipsRegister4")
let register5 = getById<Browser.HTMLElement>("mipsRegister5")
let register6 = getById<Browser.HTMLElement>("mipsRegister6")
let register7 = getById<Browser.HTMLElement>("mipsRegister7")
let register8 = getById<Browser.HTMLElement>("mipsRegister8")
let register9 = getById<Browser.HTMLElement>("mipsRegister9")
let register10 = getById<Browser.HTMLElement>("mipsRegister10")
let register11 = getById<Browser.HTMLElement>("mipsRegister11")
let register12 = getById<Browser.HTMLElement>("mipsRegister12")

// let f() = ""

let modifyRegisterInHTML (register : Fable.Import.Browser.HTMLElement) (registerValue : string) = 
    register.innerHTML <- registerValue

executeButton.addEventListener_click(fun _ -> modifyRegisterInHTML register1 "101010101010101"; null)

// BUTTONS
// EXECUTE immediately executes cmEditor based on saved last line
// STEP FORWARD/BACKWARD gets the cmEditor current line, then calls Util.load "line<either+1or-1forFORWARD/BACKWARD" 

// let q = g "hello" "world"

// let qq x =  
//     match f x with 
//     | Some -> "nice one"
//     | None -> "no value here" 

// let m = "line" + string(1) -> line1, use this as localStorage key value

// lets say I want to execute code starting from line 2, this means I need the previous state -> line 1, so first I use f arg1 to lookup the key "line1", if it isn't there, return None, if it is there return Some x ->


// HOW TO STORE data for STEP FORWARD/BACKWARD
// we take in one line of string input at a time -> so 1st line -> lex() -> parse() -> execute() -> update HTML localStorage, g "line1" Record/Union, we repeat this for each line 




// based on samegame - https://github.com/fable-compiler/Fable/blob/master/samples/browser/samegame/samegame.fsx

(**
The function `updateUi` is responsible for displaying the game and integrating the user interactions. These are the steps for updating the UI:
1. The HTML elements for displaying the board and the score are obtained.
2. A nested function `addListeners` for adding listeners for click events for all table cells is defined. The handlers will play a move and then recursively call `updateUi` again to update the UI with the new game state.
3. A pattern match of the game state is performed. Depending on the state, the board will be updated, event listeners will be added, and the score will be updated.
*)


// function to load data from HTML5 localStorage


// let testingInput = lazy(Browser.myCodeMirror.getValue())

// let decimalButton = getById<Browser.HTMLButtonElement>("register-decimal")
// let binaryButton = getById<Browser.HTMLButtonElement>("register-binary")
// let hexButton = getById<Browser.HTMLButtonElement>("register-hex")


// decimalButton.addEventListener_click(fun _ -> getDecimalValue(); null)
// binaryButton.addEventListener_click(fun _ -> getBinaryValue(); null)
// hexButton.addEventListener_click(fun _ -> getHexValue(); null)



(*
    HTML5 localStorage:
    line1 : MachineState1
    line2 : MachineState2
    line3 : MachineState3
*)