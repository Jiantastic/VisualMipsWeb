// NOTES: extended CodeMirror APIs to support functionality that I require

module App.CodeMirrorImports

open System
open System.Text.RegularExpressions
open Fable.Core
open Fable.Import.JS
open Fable.Import.Node
open Fable.Import.Browser

// These type definitions form interfaces to the CodeMirror objects
// Note that some property names are non-standard for F#
// Where property names collide with F# keywords ``name`` is used

type [<AllowNullLiteral>] CodeMirrorScrollInfo =
    abstract x: float with get, set
    abstract y: float with get, set
    abstract width: float with get, set
    abstract height: float with get, set

and [<KeyValueList>] CodeMirrorOptionNames =
    | Value of string
    | Mode of string
    | Them of string 
    | IndentUnit of float 
    | SmartIndend of float 
    | TabSize of float 
    | IndentWithTabs
    | ElectricsChars
    | AutoClearEmptyLines
    | KeyMap of string 
    | ExtraKeys of obj 
    | LineWrapping
    | LineNumbers
    | FirstLineNumber 
    | LineNumberFormatter of Function 
    | Gutter
    | FixedGutter
    | ReadOnly
    | OnChange of CodeMirrorChangeListener 
    | OnCursorActivity of Function 
    | OnViewportChange of CodeMirrorViewPortChangeListener
    | StyleActiveLine of string
    | MatchBrackets of string
    | Theme of string

and [<AllowNullLiteral>] CodeMirrorCoords =
    abstract x: float with get, set
    abstract y: float with get, set
    abstract yBot: float with get, set

and [<AllowNullLiteral>] CodeMirrorPosition =
    abstract line: int with get, set
    abstract ch: int with get, set

and [<AllowNullLiteral>] CodeMirrorHistorySize =
    abstract undo: float with get, set
    abstract redo: float with get, set

and [<AllowNullLiteral>] CodeMirrorToken =
    abstract start: float with get, set
    abstract ``end``: float with get, set
    abstract string: string with get, set
    abstract className: string with get, set
    abstract state: obj with get, set

and [<AllowNullLiteral>] CodeMirrorMarkTextOptions =
    abstract inclusiveLeft: bool with get, set
    abstract inclusiveRight: bool with get, set
    abstract startStype: string with get, set
    abstract endStyle: string with get, set

and [<AllowNullLiteral>] CodeMirrorBookMark =
    abstract clear: unit -> unit
    abstract find: unit -> CodeMirrorPosition

and [<AllowNullLiteral>] CodeMirrorLineHandle =
    interface end

and [<AllowNullLiteral>] CodeMirrorLineInfo =
    abstract line: float with get, set
    abstract handler: CodeMirrorLineHandle with get, set
    abstract text: string with get, set
    abstract markerText: string with get, set
    abstract markerClass: string with get, set
    abstract lineClass: string with get, set
    abstract bgClass: string with get, set

and [<AllowNullLiteral>] CodeMirrorViewPort =
    abstract from: float with get, set
    abstract ``to``: float with get, set

and [<AllowNullLiteral>] CodeMirrorChange =
    abstract from: CodeMirrorPosition with get, set
    abstract ``to``: CodeMirrorPosition with get, set
    abstract text: ResizeArray<string> with get, set
    abstract next: CodeMirrorChange with get, set

and [<AllowNullLiteral>] CodeMirrorChangeListener =
    [<Emit("$0($1...)")>] abstract Invoke: editor: CodeMirrorEditor * change: CodeMirrorChange -> unit

and [<AllowNullLiteral>] CodeMirrorViewPortChangeListener =
    [<Emit("$0($1...)")>] abstract Invoke: editor: CodeMirrorEditor * from: CodeMirrorPosition * ``to``: CodeMirrorPosition -> unit

and [<AllowNullLiteral>] CodeMirrorStream =
    abstract string: string with get,set
    abstract  pos: float with get,set
    abstract eol: unit->bool
    abstract sol: unit -> bool
    abstract peek: unit -> string
    abstract next: unit -> string
    abstract eat: ``match``: (obj -> bool) -> bool
    abstract eatWhile: ``match``: obj -> bool
    abstract eatSpace: unit -> bool
    abstract skipToEnd: unit -> unit
    abstract skipTo: ch: string -> bool
    abstract ``match``: pattern: Regex * consume: bool * caseFold: bool -> obj
    abstract backUp: n: float -> unit
    abstract column: unit -> float
    abstract indentation: unit -> float
    abstract current: unit -> string

and [<KeyValueList>] CodeMirrorModeNames =
    | ElectricChars of string
    | StartState of (unit -> obj)
    | Token of obj
    | BlankLine of (obj -> string)
    | CopyState of obj
    | Indent of ((obj * string * string)-> float)

and CodeMirrorMode = CodeMirrorModeNames list

and [<AllowNullLiteral>] CodeMirrorEditor =
    abstract getLineTokens: line: int -> Array<CodeMirrorToken>
    abstract getValue: unit -> string
    abstract setValue: valu: string -> unit
    abstract getSelection: unit -> string
    abstract replaceSelection: value: string -> unit
    abstract setSize: width: string * height: string -> unit
    abstract focus: unit -> unit
    abstract scrollTo: x: float * y: float -> unit
    abstract getScrollInfo: unit -> CodeMirrorScrollInfo
    abstract setOption: option: string * value: obj -> obj
    abstract getOption: option: string -> obj
    abstract getMode: unit -> CodeMirrorMode
    abstract cursorCoords: start: bool * mode: string -> CodeMirrorCoords
    abstract charCoords: pos: CodeMirrorPosition * mode: string -> CodeMirrorCoords
    abstract undo: unit -> unit
    abstract redo: unit -> unit
    abstract historySize: unit -> CodeMirrorHistorySize
    abstract clearHistory: unit -> unit
    abstract getHistory: unit -> obj
    abstract setHistory: history: obj -> obj
    abstract indentLine: line: float * ?dir: bool -> obj
    abstract getTokenAt: pos: CodeMirrorPosition -> CodeMirrorToken
    abstract markText: from: CodeMirrorPosition * ``to``: CodeMirrorPosition * className: string * ?option: CodeMirrorMarkTextOptions -> CodeMirrorBookMark
    abstract setBookmark: pos: CodeMirrorPosition -> CodeMirrorBookMark
    abstract findMarksAt: pos: CodeMirrorPosition -> ResizeArray<CodeMirrorBookMark>
    abstract setMarker: line: float * text: string * className: string -> CodeMirrorLineHandle
    abstract clarMarker: line: float -> unit
    abstract setLineClass: line: float * className: string * backgroundClassName: string -> CodeMirrorLineHandle
    abstract hideLine: line: float -> CodeMirrorLineHandle
    abstract showLine: line: float -> CodeMirrorLineHandle
    abstract onDeleteLine: line: float * callBack: Function -> obj
    abstract lineInfo: line: float -> CodeMirrorLineInfo
    abstract getLineHandler: line: float -> CodeMirrorLineHandle
    abstract getViewPort: unit -> CodeMirrorViewPort
    abstract addWidget: pos: CodeMirrorPosition * node: Node * scrollIntoView: bool -> obj
    abstract matchBrackets: unit -> unit
    abstract lineCount: unit -> float
    abstract getCursor: ?start: bool -> CodeMirrorPosition
    abstract somethingSelected: unit -> bool
    abstract setCursor: pos: CodeMirrorPosition -> unit
    abstract setSelection: start: CodeMirrorPosition * ``end``: CodeMirrorPosition -> unit
    abstract getLine: n: int -> string
    abstract setLine: n: string * text: string -> unit
    abstract removeLine: n: float -> unit
    abstract getRange: from: CodeMirrorPosition * ``to``: CodeMirrorPosition -> string
    abstract replaceRange: text: string * from: CodeMirrorPosition * ?``to``: CodeMirrorPosition -> unit
    abstract posFromIndex: index: float -> CodeMirrorPosition
    abstract indexFromPos: pos: CodeMirrorPosition -> float
    abstract operation: func: Function -> obj
    abstract compundChange: func: Function -> obj
    abstract refresh: unit -> unit
    abstract getInputField: unit -> HTMLTextAreaElement
    abstract getWrapperElement: unit -> HTMLElement
    abstract getScrollerElement: unit -> HTMLElement
    abstract getGutterElement: unit -> HTMLElement
    abstract getStateAfter: line: obj -> obj
    abstract lastLine: unit -> int
    

and CodeMirrorOptions = CodeMirrorOptionNames list
   

and [<AllowNullLiteral>] CodeMirrorType =
    abstract version: string with get, set
    abstract defaults: CodeMirrorOptions with get, set
    abstract commands: obj with get, set
    [<Emit("$0($1...)")>] abstract Invoke: element: HTMLElement * options: CodeMirrorOptions -> CodeMirrorEditor
    abstract fromTextArea: textArea: HTMLTextAreaElement * options: CodeMirrorOptions -> CodeMirrorEditor
    abstract defineMode: name: string * func: obj -> CodeMirrorMode
    abstract defineMIME: mime: string * mode: string -> obj
    abstract connect: target: EventTarget * ``event``: string * func: Function -> obj


/// Object from which CodeMirror editor components can be created
/// See type definitions for documentation, refer to Codemirror manual for furtehr details
/// This requires CodeMirror JS module is referenced in HTML file.
[<Global>]
let CodeMirror: CodeMirrorType = jsNative
