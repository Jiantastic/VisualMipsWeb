(* 

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
    // More optional features (time permitting):
    1. Save Codemirror text data in HTML5 local Storage
    2. Input forms for Register values so user can manipulate them freely

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
open MachineState
open Executor

// Dictionaries
open System.Collections.Generic

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
    let saveToLocalStorage arg1 arg2 = Util.save arg1 arg2

    // loading data format -> key : string
    let loadFromLocalStorage arg1 = Util.load arg1
    let editId = getById<Browser.HTMLTextAreaElement>("editor")

    let cmEditor = App.CodeMirrorImports.CodeMirror.fromTextArea(editId, initOptions)

    saveToLocalStorage "hello" "world"


    // THIS FUCKING WORKS
    // add None handler to complete match statements
    let getValue = 
        let q : Option<string> = loadFromLocalStorage "hello"
        match q with 
        | Some x -> x 


    // let ff = 
    //     let q = f "hello"
    //     match q with 
    //     | Some f -> f
    //     | None -> printfn "hello world"

    let z = "AND 1,2,3      # this is a comment!"

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

    // initialisation of non-mutable initial machineState

    let mutable globalMachineStates= new Dictionary<string, MachineState>()
    globalMachineStates.["line-1"] <- initialise

    printfn "init example - %A" initialise
    printfn "from dictionary - %A" globalMachineStates

    
    let updateGlobalMachineState (currentLine : int) (mach : MachineState) =
        globalMachineStates.["line"+string(currentLine)] <- mach

    // returns the current machineState for a given line number
    // use map instead of HTML5 localStorage probs? - more transferable
    // let getCurrentMachineState (currentLineNumber : int) =
    //     printfn "wtf is going on here"
    //     match loadFromLocalStorage ("line"+string(currentLineNumber)) with 
    //     | Some x -> x
    //     | _ -> failwithf "error loading machine state from HTML5 localStorage"

    let getCurrentMachineState (currentLineNumber : int) =

        globalMachineStates.["line"+string(currentLineNumber)]


    let printLogAndUpdateRegisters (currentLineNumber : int) =
        // let getPCValue = getPC globalMachineState
        // match 
        let machStateToString (mach:MachineState) = 
            match mach.State with 
            | RunOK -> "RunOK"
            | RunTimeErr i -> "RunTimeErr : " + i
            | SyntaxErr i -> "SyntaxErr : " + i
        
        let hiToString (mach:MachineState) = 
            match (getHi mach) with 
            | Word x -> "Hi : " + string(x)
            
        let loToString (mach:MachineState) = 
            match (getLo mach) with
            | Word x -> "Lo : " + string(x)
        
        let pcToString (mach:MachineState) = 
            match (getPC mach) with
            | Word x -> "PC : " + string(x)
        
        let nextPCToString (mach:MachineState) = 
            match (getNextPC mach) with 
            | Word x -> "nextPC : " + string(x)

        let nextNextPCToString (mach:MachineState) = 
            match (getNextNextPC mach) with 
            | Some x -> "NextNextPC : " + string(x)
            | None -> "Nothing is here"

        // TODO : MemMAP

        let registerStateToString (mach:MachineState) = 
            // change this to more functional style?

            for i in 0..31 do
                match mach.RegMap.[Register(i)] with 
                | Word m -> errorLog.insertAdjacentHTML("beforeend","R"+string(i) + "=" + string(m) + "   ")
            

        errorLog.insertAdjacentHTML ("beforeend","<p>Line " + string(currentLineNumber) + ": " + (cmEditor.getLine currentLineNumber) + " " + machStateToString (getCurrentMachineState currentLineNumber) + " " + "</p>")
        errorLog.insertAdjacentHTML ("beforeend","<p>" + (hiToString (getCurrentMachineState currentLineNumber)) + " " + (loToString (getCurrentMachineState currentLineNumber)) + " " + (pcToString (getCurrentMachineState currentLineNumber)) + " " + (nextPCToString (getCurrentMachineState currentLineNumber)) + " " + (nextNextPCToString (getCurrentMachineState currentLineNumber)) + "</p>")

        registerStateToString (getCurrentMachineState currentLineNumber)
        
    let executeHandler() = 
        // NOTE : there probably has to be a global machine state that I must reference, I should probably instantiate that global MachineState here
        // main code body which holds the lex() -> parse() -> execute() stage, return MachineState
        // TODO : saving MachineState into HTML5 localStorage via saveToLocalStorage and loadToLocalStorage methods

        // eachLineProcessing returns a machine state that is used as the next input

        // when executeHandler is called, we save the content of the text editor to HTML5 localStorage

        // let eachLineProcessing (currentLine : int) (currentMachineState : MachineState) =
        //     printfn "wtf is going on here 2 - %A" currentMachineState
        //     let codeMirrorText = cmEditor.getLine currentLine;
        //     let input = tokenise codeMirrorText;
        //     let instruction = parse input
        //     printfn "aaaa"
        //     currentMachineState 
        //     |> setReg (Register 1) (Word 32u)
        //     |> setReg (Register 2) (Word 32u)
        //     |> executeInstruction instruction
        //     |> saveToLocalStorage "line1"

        //     printfn "after this?"
        //     printLogAndUpdateRegisters currentLine

        //     // if codeMirrorText <> "" then printfn "Instr: %A" (checkType input)
        // let rec processAllCodeMirrorInput (startLine : int) (lastLine : int) = if startLine=lastLine then eachLineProcessing lastLine (getCurrentMachineState lastLine) else eachLineProcessing startLine (getCurrentMachineState startLine); processAllCodeMirrorInput (startLine+1) lastLine
        // processAllCodeMirrorInput 0 (cmEditor.lastLine())


        let eachLineProcessing (currentLine : int) =
            let codeMirrorText = cmEditor.getLine currentLine
            let input = tokenise codeMirrorText
            let instruction = parse input
            (getCurrentMachineState (currentLine-1))
            |> setReg (Register 1) (Word 32u)
            |> setReg (Register 2) (Word 32u)
            |> executeInstruction instruction
            |> updateGlobalMachineState currentLine

            printLogAndUpdateRegisters currentLine


            // if codeMirrorText <> "" then printfn "Instr: %A" (checkType input)
        let rec processAllCodeMirrorInput (startLine : int) (lastLine : int) = if startLine=lastLine then eachLineProcessing lastLine else eachLineProcessing startLine; processAllCodeMirrorInput (startLine+1) lastLine
        processAllCodeMirrorInput 0 (cmEditor.lastLine())

        // TODO: update register values according to the lastLine

    
    // executeButtonHandler calls executeHandler() starts from the first line
    // this might be redundant / add logic to modify register HTML
    let executeButtonHandler() = "0"

    // just set all registers to 0 graphically, set machine state to initialise?
    let resetButtonHandler() = 
        modifyRegisterInHTML HTMLRegister0 "0"
        modifyRegisterInHTML HTMLRegister1 "0"
        modifyRegisterInHTML HTMLRegister2 "0"
        modifyRegisterInHTML HTMLRegister3 "0"
        modifyRegisterInHTML HTMLRegister4 "0"
        modifyRegisterInHTML HTMLRegister5 "0"
        modifyRegisterInHTML HTMLRegister6 "0"
        modifyRegisterInHTML HTMLRegister7 "0"
        modifyRegisterInHTML HTMLRegister8 "0"
        modifyRegisterInHTML HTMLRegister9 "0"
        modifyRegisterInHTML HTMLRegister10 "0"
        modifyRegisterInHTML HTMLRegister11 "0"
        modifyRegisterInHTML HTMLRegister12 "0"
        errorLog.innerHTML <- ""
    // checks if executeHandler() has been called considering that current CodeMirror text editor content has not change,if changed, call execute
    let stepBackwardsButtonHandler() = "2"
    // checks if executeHandler() has been called considering that current CodeMirror text editor content has not change
    let stepForwardsButtonHandler() = "3"

    // final result : each of these buttons will call a function like : executeButtonHandler(), resetButtonHandler(), stepBackwardsButtonHandler() and stepForwardsButtonHandler()

    // how to convert string / types to HTMLRegister0 , use match x with "register0" -> HTMLRegister0
    executeButton.addEventListener_click(fun _ -> executeHandler(); null)
    resetButton.addEventListener_click(fun _ -> resetButtonHandler(); null)
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


    // function to load data from HTML5 localStorage


    // let testingInput = lazy(Browser.myCodeMirror.getValue())




    (*
        HTML5 localStorage:
        line1 : MachineState1
        line2 : MachineState2
        line3 : MachineState3
    *)