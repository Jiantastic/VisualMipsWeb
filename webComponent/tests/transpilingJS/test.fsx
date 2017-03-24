// *** FABLE Test 1 - FUNCTIONS, to access this, on the last line change to })(this), then call window.x()
// let x = fun() -> 3



// *** FABLE Test 2 - RECORDS, converting Records into JSON value stores -> let f = JSON.stringify(window.myComplexNumber) -> let ff = JSON.parse(f) -> ff["imaginary"] (it's in JSON format now!)
// type ComplexNumberRecord = { real: float; imaginary: float }
// let myComplexNumber = { real = 1.1; imaginary = 2.2 } // use equals!


// *** FABLE Test 3 - UNIONS
// type IntOrBool = I of int | B of bool
// let i  = I 99 



// *** FABLE Test 4 - TYPE TEST WITH RECORDS / UNIONS - refer to http://fable.io/docs/interacting.html#JSON-serialization
// do this when you need it
