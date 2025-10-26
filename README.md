**ColorQL**

**Author: Drake Boley**

**License:MIT**

This library is for binding data and functions to colors to create color-sequenced execution maps. This will potentially aid optical computing development in the future by providing an easy way to pre-declare JavaScript functions and values that can be called using different color values in real time.

Example simple usage:

```
import {bindFn, bindValue, readColors} from 'colorql';

//sample function
const fn = (param1, param2) => {
  console.log(param1, param2)
}

const param1 = "sample paramter"
const param2 = {
  property: "Example Json Value"
}

bindFn('#FF0011', fn);
bindValue('#FF0022', param1);
bindValue('#FF0033', param2);

//Use #FFFFFF (white) and #000000 (black) to control start and stop of a function declaration
readColors(['#FFFFFF', '#FF0011', '#FF0022', '#FF0033', '#000000']);

```

Also available is createParamFn, which takes an rValue and declares functions across that entire channel passing the G and B values to the bound function

```
import {createParamFn} from 'colorql'

const paramFn = (g, b) => {
  console.log(g, b)
}

createParamFn(200, paramFn)

```

To retrieve a binding manually for execution without using a color sequence, you can use `getBinding(color)`

To delete bindings, use either `removeBinding(color)` or `removeParamFn(color)`
