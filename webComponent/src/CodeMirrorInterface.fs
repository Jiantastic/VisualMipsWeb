module App.CodeMirrorInterface

open Fable.Core
open Fable.Core.JsInterop
open App.CodeMirrorImports

open System.Text.RegularExpressions

/// User-defined mutable state used when tokenise operations require state
type CodeMirrorState<'T> = { State: 'T}

/// Define a new mode controlling highlighting of test
/// This sets up internal mutable state in global CodeMirror object
let DefineCodeMirrorMode modeName tokFun (initState: 'T) =
    let armCodeMirrorMode = 
        [ Token(System.Func<_,_,_>tokFun)
          StartState (fun () -> ({State = ref initState} :> obj))
          CopyState ((fun st -> ref (! st) ) :> (obj) )
        ]
    CodeMirror?defineMode(modeName, System.Func<_,_,_>(fun a -> fun b -> armCodeMirrorMode)) |> ignore
    //printfn "%s mode defined" modeName

/// Turns JS booleans into F# option
/// False and null and undefined all map to None
/// Any other x to to Some(x)
/// Useful when JS return value is interpreted as boolean
let optJSBool x = 
    match box x with 
    | _ when x = false -> None
    | _ when x = true -> Some x
    | null -> None
    | undefined  -> None
    | _ when x = false -> None
    | _  -> Some x

/// Turns JS objects into options, with None for null
let optJSObj x =
    match box x with 
    | null -> None
    | _  -> Some x


/// Used to get active recogniser return values as F# options
///
let RetObj stream y = match optJSObj y with | None -> None | _ -> Some stream

let RetBool stream y = match optJSBool y with | None -> None | _ -> Some stream

/// Active recogniser consumes any amount of leading white space
/// Succeeds if one or more characters are matched.
let (|EatSpace|_|) (stream:CodeMirrorStream) = 
   let x = stream.eatSpace()
   // printfn "Eating spaces...<%A>" x
   x |> RetBool stream

/// Active recogniser matches if regexp succeeds and consumes matches chars
/// Regexp must start with ^ to force matching from start.
let (|EatMatch|_|) (regExpStr:string) (stream:CodeMirrorStream) =
    let x = stream.``match`` (Regex regExpStr, true, false)
    // printfn "Eatmatch: %A" x
    x |> RetObj stream

/// Active recogniser matches if regexp succeeds but does not consume stream
/// Regexp must start with ^ to force matching from start.
let (|PeekMatch|_|) (regExpStr:string) (stream:CodeMirrorStream) =
    let x = stream.``match`` (Regex regExpStr, false, false)
    // printfn "Peekmatch: %A" x
    x |> RetObj stream

/// Active recogniser consumes stream until just before character c.
/// If c does not exist match fails and nothing is consumed
let (|SkipTo|_|) (c:char) (stream:CodeMirrorStream) =
    let x = stream.skipTo(c.ToString())
    let y = optJSObj x
    // printfn "SkipTo:%A %A %A" x y (stream.current())
    x |> RetObj stream
    

/// Active Recogniser always matches and consumes all of line
let (|EatLine|_|) (stream:CodeMirrorStream) = 
    stream.skipToEnd()
    Some(stream)    

/// Called many times from CodeMirror to syntax highlight lines of text
/// State is user-defined and if mutable allows the tokeniser to
/// Keep track of internal state within a line and also across lines
/// The characters read from stream are coloured according to the return value
/// Colors can be adjusted using CodeMirror css file and css themes
/// CodeMirrorStream contains at most one line for given call
/// It is an error if zero characters are read from stream
/// See CodeMirrorSteam interface for details
/// See CodeMirror documentation for further details
let tokFunction  (stream:CodeMirrorStream)  (state:obj) =
    let ret = 
        match stream with 
        | EatSpace _ -> "var2"
        | EatMatch "^(ADDI|ADDIU|ANDI|ORI|XORI|BEQ|BGEZAL|BGEZ|BGTZ|BLEZ|BLTZAL|BLTZ|BNE|LB|LBU|LH|LWL|LW|LWR|SB|SH|SW|LUI|SLTI|SLTIU|JAL|J|ADDU|ADD|AND|OR|SRAV|SRA|SRLV|SRL|SLLV|SLL|SUBU|SUB|XOR|SLTU|SLT|DIVU|DIV|MULTU|MULT|JR|JALR|MFHI|MFLO|MTHI|MTLO)" _ -> "keyword"
        | EatMatch "^[a-zA-Z][a-zA-Z0-9]*" _ -> "atom"
        | EatMatch "^#" (EatLine x) -> "comment"
        | EatMatch "^[0-9][0-9]*" _ -> "number"
        | EatMatch "^." s -> "keyword"
        | _ -> null
    // printfn "Token: <%s '%s'> pos=%f" ret (stream.current()) stream.pos
    ret

/// Sample definition, with trivial state `0` which cannot be mutated
DefineCodeMirrorMode "arm" tokFunction 0

// let initOptions = [Value "" ; Mode "arm"]

// Mode  "javascript"
let initOptions = [LineNumbers ; StyleActiveLine "true" ; MatchBrackets "true" ; Mode  "arm" ; Theme "monokai"]

/// Access given element of DOC selected by its ID
/// Used to find a textArea box which CodeMirror can be added to.
let getById<'T when 'T :> Fable.Import.Browser.HTMLElement> id =
    Fable.Import.Browser.document.getElementById(id) :?> 'T
