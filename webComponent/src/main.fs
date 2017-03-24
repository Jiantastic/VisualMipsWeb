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


// two main sections in this file
// 1. Logic to render output to HTML
// 2. Core logic that interacts with F# modules

module main = 

    let editId = getById<Browser.HTMLTextAreaElement>("editor")
    let executeButton = getById<Browser.HTMLButtonElement>("execute")
    let resetButton = getById<Browser.HTMLButtonElement>("reset")
    let stepBackwardsButton = getById<Browser.HTMLButtonElement>("stepBackwards")
    let stepForwardsButton =  getById<Browser.HTMLButtonElement>("stepForwards")
    let errorLog = getById<Browser.HTMLDivElement>("errorLog")

    // CodeMirror Editor initialisation
    let cmEditor = App.CodeMirrorImports.CodeMirror.fromTextArea(editId, initOptions)
    cmEditor.setSize("100%","45%")          // CodeMirror editor with 100% width, 45% height
    let initialValue = "ADDI 5,6,50	    # move 50 to register 5\nADDI 12,6,77    # move 77 to register 12\nSB 5,1,1   		# store data from register 5 into memory\nLB 15,1,1		# load data in memory into register 15\n"
    cmEditor.setValue initialValue

    let getIDAndUpdateRegisterValue (registerNumber : int) (result : string) =
        let HTMLRegister = getById<Browser.HTMLElement>("mipsRegister"+string(registerNumber))
        HTMLRegister.innerHTML <- result

    let updateRegisterValuesInHTML (mach : MachineState) =
        for i in 0..31 do
            match mach.RegMap.[Register(i)] with 
            | Word m -> getIDAndUpdateRegisterValue i (string(int(m)))
            | _ -> failwithf "unknown value"
        
    let updateProgramCounterInHTML (mach : MachineState) = 
        let PC = getById<Browser.HTMLElement>("mipsRegister-1")
        let nextPC = getById<Browser.HTMLElement>("mipsRegister-2")
        let hi = getById<Browser.HTMLElement>("mipsRegister-3")
        let lo = getById<Browser.HTMLElement>("mipsRegister-4")
        
        match mach.pc with
        | Word x -> PC.innerHTML <- string(int(x))

        match mach.pcNext with 
        | Word x -> nextPC.innerHTML <- string(int(x))

        match mach.Hi with 
        | Word x -> hi.innerHTML <- string(int(x))

        match mach.Lo with 
        | Word x -> lo.innerHTML <- string(int(x))

    let updateMemoryInHTML (mach : MachineState) = 
        let memoryTable = getById<Browser.HTMLElement>("addMoreMemory")
        
        let mutable str : string = ""
        for i in 0..1023 do
            match mach.MemMap.[Memory(uint32(i*3+i))] with 
            | Byte b -> str <- ("<tr><td>"+string( (i+i*3) ) + "</td><td>" + string(b) + "</td>") 
            
            match mach.MemMap.[Memory(uint32(i+i*3+1))] with
            | Byte b -> str <- str + ("<td>" + string(b) + "</td>")

            match mach.MemMap.[Memory(uint32(i+i*3+2))] with
            | Byte b -> str <- str + ("<td>" + string(b) + "</td>")

            match mach.MemMap.[Memory(uint32(i+i*3+3))] with
            | Byte b -> str <- str + ("<td>" + string(b) + "</td>")

            memoryTable.insertAdjacentHTML("beforeend",str)


    let mutable currentMachineState : MachineState = initialise
        
    let setCurrentMachineState (mach : MachineState) = 
        currentMachineState <- mach

    // HTML displaying MachineState initialisation 
    updateRegisterValuesInHTML currentMachineState
    updateProgramCounterInHTML currentMachineState
        
    // error handler, print to Log 
    let fail (msg: string) (line: int) =
        let msgs = msg.Split('\n')
        let found = msgs.[0].IndexOf(": ");
        let message = msgs.[0].Substring(found+2)
        printfn "Line %i: %s" line message
        errorLog.innerHTML <- "<p>Line " + string(line+1) + ": " + message + "</p>"

        failwith "Parser Error!" 

    // Core F# logic - all of MIPS code is within this function
    // How this works:
    // We have a tail recursive function -> processAllCodeMirrorInput which calls eachLineProcessing for every line in the CodeMirror text editor
    let eachLineProcessing (mach : MachineState) (currentLine : int)  =
        let codeMirrorText = cmEditor.getLine currentLine
        let checkForRunTimeError = 
            match (getState mach) with
            | RunTimeErr stringError -> errorLog.innerHTML <- "<p>Line " + string(currentLine) + " : " + "RunTimeError : " + stringError + "</p>"  //print stringerror + abort execution
            | SyntaxErr stringError -> errorLog.innerHTML <- "<p>Line " + string(currentLine) + " : " + "SyntaxError : " + stringError + "</p>"
            | _ -> ()

        if codeMirrorText = "" then ()

        else

        let input = tokenise codeMirrorText
        let instruction = 
            try parse input
            with | msg -> fail (string msg) currentLine

        mach
        |> executeInstruction instruction
        |> setCurrentMachineState
        |> ignore

        checkForRunTimeError
    let rec processAllCodeMirrorInput (startLine : int) (lastLine : int) = if startLine=lastLine then eachLineProcessing currentMachineState lastLine else eachLineProcessing currentMachineState startLine; processAllCodeMirrorInput (startLine+1) lastLine

    
    // Everything below this details the logic for handling button events, ie: what happens when you press the execute button?
    // Simply executes the entire MIPS program -> displays results in HTML
    let executeButtonHandler() = 
        setCurrentMachineState initialise 
        processAllCodeMirrorInput 0 (cmEditor.lastLine())
        updateRegisterValuesInHTML currentMachineState 
        updateProgramCounterInHTML currentMachineState
        updateMemoryInHTML currentMachineState
        errorLog.innerHTML <- ""


    // just set all registers/PC to 0 graphically, clears log
    let resetButtonHandler() = 
        let currentLine  = cmEditor.getCursor()
        currentLine.line <- 0
        cmEditor.setCursor currentLine
        for i in -4..31 do
            getIDAndUpdateRegisterValue i "0"
        errorLog.innerHTML <- ""

    // handle the step backwards button, for better user experience -> decided to allow immediate code change + step backwards (unlike VisUAL), this is reflected is the code below
    let stepBackwardsButtonHandler() = 
        setCurrentMachineState initialise
        let currentLine  = cmEditor.getCursor()

        match currentLine.line with 
        | 0 -> resetButtonHandler()
        | _ -> processAllCodeMirrorInput 0 (currentLine.line-1)

        updateRegisterValuesInHTML currentMachineState
        updateProgramCounterInHTML currentMachineState
        updateMemoryInHTML currentMachineState
        currentLine.line <- currentLine.line - 1
        cmEditor.setCursor currentLine
            

    // handle the step forward button, for better user experience -> decided to allow immediate code change + step forward (unlike VisUAL), this is reflected is the code below
    let stepForwardsButtonHandler() = 
        setCurrentMachineState initialise 
        let currentLine  = cmEditor.getCursor()
        processAllCodeMirrorInput 0 (currentLine.line)

        updateRegisterValuesInHTML currentMachineState
        updateProgramCounterInHTML currentMachineState
        updateMemoryInHTML currentMachineState
    
        currentLine.line <- currentLine.line + 1
        cmEditor.setCursor currentLine

    executeButton.addEventListener_click(fun _ -> executeButtonHandler(); null)
    resetButton.addEventListener_click(fun _ -> resetButtonHandler(); null)
    stepBackwardsButton.addEventListener_click(fun _ -> stepBackwardsButtonHandler(); null)
    stepForwardsButton.addEventListener_click(fun _ -> stepForwardsButtonHandler(); null)