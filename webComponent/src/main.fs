(* 

// BUGS TO FIX:

Wei: bug report; stepping forwards 3 times and then backwards 3 times does not lead output to be as expected.

Empty line results in error


// TODO:

1. Code point on line = for step forward/backward
2. Hi and Lo for PC



add sublime code bindings



*)
// BROWSER DOCUMENTATION -> https://github.com/fable-compiler/Fable/blob/master/src/fable/Fable.Core/Import/Fable.Import.Browser.fs

(*
    // More optional features (time permitting):
    1. Save Codemirror text data in HTML5 local Storage
    2. Input forms for Register values so user can manipulate them freely

    UI TODO:
    speed slider for execute, slowly go step by step (highlight registers that are being changed)

    step forward for jumps might be complicated

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

    // API to save/load to HTML5 localStorage - use key : string , value : string ONLY
    // Util.save arg1 arg2
    // Util.load arg1

    let editId = getById<Browser.HTMLTextAreaElement>("editor")
    let executeButton = getById<Browser.HTMLButtonElement>("execute")
    let resetButton = getById<Browser.HTMLButtonElement>("reset")
    let stepBackwardsButton = getById<Browser.HTMLButtonElement>("stepBackwards")
    let stepForwardsButton =  getById<Browser.HTMLButtonElement>("stepForwards")
    let errorLog = getById<Browser.HTMLDivElement>("errorLog")
    let cmEditor = App.CodeMirrorImports.CodeMirror.fromTextArea(editId, initOptions)


    cmEditor.setSize("100%","45%")
    // saveToLocalStorage "hello" "world"



    // add None handler to complete match statements
    // let getValue = 
    //     let q : Option<string> = loadFromLocalStorage "hello"
    //     match q with 
    //     | Some x -> x 


    // let ff = 
    //     let q = f "hello"
    //     match q with 
    //     | Some f -> f
    //     | None -> printfn "hello world"

    let initialValue = "ADDI 5,6,11	   # this is a comment!\nAND 1,2,3      # this is a comment!\nAND 1,2,4      # this is a comment!\nAND 1,2,5      # this is a comment!\nAND 1,2,6      # this is a comment!\nAND 1,2,7      # this is a comment!"

    cmEditor.setValue initialValue

    let getIDAndUpdateRegisterValue (registerNumber : int) (result : string) =
        let HTMLRegister = getById<Browser.HTMLElement>("mipsRegister"+string(registerNumber))
        HTMLRegister.innerHTML <- result

    let updateRegisterValuesInHTML (mach : MachineState) =
        for i in 0..31 do
            match mach.RegMap.[Register(i)] with 
            | Word m -> getIDAndUpdateRegisterValue i (string(m))
            | _ -> failwithf "unknown value"
        
    let updateProgramCounterInHTML (mach : MachineState) = 
        let PC = getById<Browser.HTMLElement>("mipsRegister-1")
        let nextPC = getById<Browser.HTMLElement>("mipsRegister-2")
        let nextNextPC = getById<Browser.HTMLElement>("mipsRegister-3")
        
        match mach.pc with
        | Word x -> PC.innerHTML <- string(x)

        match mach.pcNext with 
        | Word x -> nextPC.innerHTML <- string(x)

        match mach.pcNextNext with
        | Some x -> nextNextPC.innerHTML <- string(x)
        | None -> nextNextPC.innerHTML <- "null"


    let mutable currentMachineState : MachineState = initialise

    updateRegisterValuesInHTML currentMachineState
    updateProgramCounterInHTML currentMachineState

    let printLogAndUpdateRegisters (currentLineNumber : int) =
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
            

        errorLog.insertAdjacentHTML ("beforeend","<p>Line " + string(currentLineNumber+1) + ": " + (cmEditor.getLine currentLineNumber) + " " + machStateToString currentMachineState + " " + "</p>")
        errorLog.insertAdjacentHTML ("beforeend","<p>" + (hiToString currentMachineState) + " " + (loToString currentMachineState) + " " + (pcToString currentMachineState) + " " + (nextPCToString currentMachineState) + " " + (nextNextPCToString currentMachineState) + "</p>")

        registerStateToString currentMachineState
        
    let setCurrentMachineState (mach : MachineState) = 
        currentMachineState <- mach
        

    // error handler, print to Log 
    let fail (msg: string) (line: int) =
        let msgs = msg.Split('\n')
        let found = msgs.[0].IndexOf(": ");
        let message = msgs.[0].Substring(found+2)
        printfn "Line %i: %s" line message
        errorLog.insertAdjacentHTML("beforeend","<p>Line " + string(line+1) + ": " + message + "</p>")
        failwith "Parser Error!" // Replace with whatever should come up in JS Console

    let eachLineProcessing (mach : MachineState) (currentLine : int)  =
        let codeMirrorText = cmEditor.getLine currentLine

        if codeMirrorText = "" then ()

        else

        let input = tokenise codeMirrorText
        let instruction = 
            try parse input
            with | msg -> fail (string msg) currentLine


        /// Prints Parser Error message before ending program


        mach
        |> executeInstruction instruction
        |> setCurrentMachineState
        |> ignore

        printLogAndUpdateRegisters currentLine
    let rec processAllCodeMirrorInput (startLine : int) (lastLine : int) = if startLine=lastLine then eachLineProcessing currentMachineState lastLine else eachLineProcessing currentMachineState startLine; processAllCodeMirrorInput (startLine+1) lastLine

    
    // TODO: update register/PC values according to the lastLine
    // PROBLEM : if last line is an empty line - doesn't work
    let executeButtonHandler() = 
        setCurrentMachineState initialise 
        processAllCodeMirrorInput 0 (cmEditor.lastLine())
        updateRegisterValuesInHTML currentMachineState 
        updateProgramCounterInHTML currentMachineState

    // just set all registers/PC to 0 graphically, clears log
    let resetButtonHandler() = 
        for i in -5..31 do
            getIDAndUpdateRegisterValue i "0"
        errorLog.innerHTML <- ""
    // checks if executeHandler() has been called considering that current CodeMirror text editor content has not change,if changed, call execute


    // logic - 1. getCurrentLine 2. get dict from previous line 3. update HTML 4. move cursor to one line back
    let stepBackwardsButtonHandler() = 
        setCurrentMachineState initialise 
        let currentLine  = cmEditor.getCursor()
        currentLine.line <- cmEditor.getCursor().line
        

        match currentLine.line with 
        | 0 -> resetButtonHandler()
        | _ -> processAllCodeMirrorInput 0 (currentLine.line-1)

        updateRegisterValuesInHTML currentMachineState
        updateProgramCounterInHTML currentMachineState
        currentLine.line <- currentLine.line - 1

        cmEditor.setCursor currentLine

        printfn "what is the current line number Step back - %A" currentLine.line
        

    let stepForwardsButtonHandler() = 
        setCurrentMachineState initialise 
        let currentLine  = cmEditor.getCursor()
        cmEditor.setCursor currentLine

        processAllCodeMirrorInput 0 (currentLine.line)

        updateRegisterValuesInHTML currentMachineState
        updateProgramCounterInHTML currentMachineState
        
        if currentLine.line = 0 
        then
            currentLine.line <- currentLine.line + 1
        else
            cmEditor.setCursor currentLine 
            currentLine.line <- currentLine.line + 1
            
        printfn "what is the current line number Step forward - %A" currentLine.line


    // let stepBackwardsButtonHandler() = 
    //     setCurrentMachineState (initialise |> setReg (Register 1) (Word 32u)|> setReg (Register 2) (Word 32u))
    //     let currentLine  = cmEditor.getCursor()
    //     // printfn "value of asdasdsadsadas %A" currentLine.line
    //     // let myObject = {ch = 0;line = 1}
    //     // cmEditor.setCursor myObject
    //     match currentLine.line with 
    //     | 0 -> resetButtonHandler()
    //     | _ -> processAllCodeMirrorInput 0 (currentLine.line-1)

    //     updateRegisterValuesInHTML currentMachineState
    //     updateProgramCounterInHTML currentMachineState
    //     currentLine.line <- currentLine.line - 1
    //     cmEditor.setCursor currentLine
            


    // let stepForwardsButtonHandler() = 
    //     setCurrentMachineState (initialise |> setReg (Register 1) (Word 32u)|> setReg (Register 2) (Word 32u))
    //     let currentLine  = cmEditor.getCursor()
    //     processAllCodeMirrorInput 0 (currentLine.line)

    //     updateRegisterValuesInHTML currentMachineState
    //     updateProgramCounterInHTML currentMachineState
    
    //     currentLine.line <- currentLine.line + 1
    //     cmEditor.setCursor currentLine

    // final result : each of these buttons will call a function like : executeButtonHandler(), resetButtonHandler(), stepBackwardsButtonHandler() and stepForwardsButtonHandler()

    // how to convert string / types to HTMLRegister0 , use match x with "register0" -> HTMLRegister0
    executeButton.addEventListener_click(fun _ -> executeButtonHandler(); null)
    resetButton.addEventListener_click(fun _ -> resetButtonHandler(); null)
    stepBackwardsButton.addEventListener_click(fun _ -> stepBackwardsButtonHandler(); null)
    stepForwardsButton.addEventListener_click(fun _ -> stepForwardsButtonHandler(); null)


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