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

(*
    UI TODO:
    Program counter 
    PCNext
    multiple tabs for registers - follow this example probably http://rivoire.cs.sonoma.edu/cs351/wemips/
    speed slider for execute, slowly go step by step (highlight registers that are being changed)

    step forward for jumps might be complicated

    More TODOS:

    Ben and Tom will show errors in its code if there is an error


    Codemirror TODO:
    How to highlight current line / any given line when an error happens
    Syntax highlighting
    Autocompletion
*)
namespace VisualMIPS

// web-based 

open System
open Fable.Core
open Fable.Core.JsInterop
open Fable.Import
open App.CodeMirrorInterface

// MIPS-specific

open Types
open Instructions
open Parser
open Tokeniser

module main = 

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

    // HTML elements definitions
    let executeButton = getById<Browser.HTMLButtonElement>("execute")
    let resetButton = getById<Browser.HTMLButtonElement>("reset")
    let stepBackwardsButton = getById<Browser.HTMLButtonElement>("stepBackwards")
    let stepForwardsButton =  getById<Browser.HTMLButtonElement>("stepForwards")
    let errorLog = getById<Browser.HTMLDivElement>("errorLog")
    let HTMLRegister0 = getById<Browser.HTMLElement>("mipsRegister0")
    let HTMLRegister1 = getById<Browser.HTMLElement>("mipsRegister1")
    let HTMLRegister2 = getById<Browser.HTMLElement>("mipsRegister2")
    let HTMLRegister3 = getById<Browser.HTMLElement>("mipsRegister3")
    let HTMLRegister4 = getById<Browser.HTMLElement>("mipsRegister4")
    let HTMLRegister5 = getById<Browser.HTMLElement>("mipsRegister5")
    let HTMLRegister6 = getById<Browser.HTMLElement>("mipsRegister6")
    let HTMLRegister7 = getById<Browser.HTMLElement>("mipsRegister7")
    let HTMLRegister8 = getById<Browser.HTMLElement>("mipsRegister8")
    let HTMLRegister9 = getById<Browser.HTMLElement>("mipsRegister9")
    let HTMLRegister10 = getById<Browser.HTMLElement>("mipsRegister10")
    let HTMLRegister11 = getById<Browser.HTMLElement>("mipsRegister11")
    let HTMLRegister12 = getById<Browser.HTMLElement>("mipsRegister12")



    let modifyRegisterInHTML (register : Fable.Import.Browser.HTMLElement) (registerValue : string) = 
        register.innerHTML <- registerValue


    // update based on match statements, if register 1 -> ...., if register 2 -> ......
    // if match statement returns an error, show an error popup

    // IMPORTANT : write 2 helper functions
    // 1. get all lines, one line at a time
    // 2. code to parse MachineState

    // use a map function, call executeHandler(input :string) for each line
    

    (*
    type RunState = 
        | RunOK
        | RunTimeErr of string
        | SyntaxErr of string
        
    type MachineState = 
        { 
        RegMap : Map<Register, uint32>
        Hi : uint32
        Lo : uint32
        MemMap : Map<Memory, uint32> 
        State : RunState
        pc : uint32
        pcNext : uint32
        }
    *)

    // MAIN FUNCTION : feed inputs line by line codeMirror.getLine, all buttonHandlers call the executeHandler(), calls lex() -> calls parse() -> calls execute() -> save in HTML5 local Storage
    let executeHandler() = 
        // main code body which holds the lex() -> parse() -> execute() stage, return MachineState
        let eachLineProcessing = fun currentLine -> 
            let codeMirrorText = cmEditor.getLine currentLine;
            let input = tokenise codeMirrorText;
            if codeMirrorText <> "" then printfn "Instr: %A" (checkType input)
        let rec processAllCodeMirrorInput (startLine : int) (lastLine : int) = if startLine=lastLine then eachLineProcessing lastLine else eachLineProcessing startLine; processAllCodeMirrorInput (startLine+1) lastLine
        processAllCodeMirrorInput 0 (cmEditor.lastLine())
        
    
    // executeButtonHandler calls executeHandler() starts from the first line
    let executeButtonHandler() = "0"
    // just set all registers to 0 graphically
    let resetButtonHandler() = "1"
    // checks if executeHandler() has been called considering that current CodeMirror text editor content has not change,if changed, call execute
    let stepBackwardsButtonHandler() = "2"
    // checks if executeHandler() has been called considering that current CodeMirror text editor content has not change
    let stepForwardsButtonHandler() = "3"

    // final result : each of these buttons will call a function like : executeButtonHandler(), resetButtonHandler(), stepBackwardsButtonHandler() and stepForwardsButtonHandler()

    // how to convert string / types to HTMLRegister0 , use match x with "register0" -> HTMLRegister0
    executeButton.addEventListener_click(fun _ -> executeHandler(); null)
    resetButton.addEventListener_click(fun _ -> modifyRegisterInHTML HTMLRegister1 "101010101010101"; null)
    stepBackwardsButton.addEventListener_click(fun _ -> modifyRegisterInHTML HTMLRegister2 "101010101010101"; null)
    stepForwardsButton.addEventListener_click(fun _ -> modifyRegisterInHTML HTMLRegister3 "101010101010101"; null)


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