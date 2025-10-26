// ColorQL
// v. 1.0.0
// Author: Drake Boley
// Copyright 2025

//Reserved Colors:
// #FFFFFF - Start data block (statement, string, promise)
// #000000 - End statement, string, promise

export const colorBindings = new WeakMap();
export const rValues = new Array();

function hexToRgb(hex: string) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return { r , g , b };
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

//Check to see if requested color is in the rValues array (for paramFns)

const checkRValue = (color: string) => {
    const rgb = hexToRgb(color);
    return rValues.indexOf(rgb.r) > -1
}

//Bind a value to a color.

export const bindValue = (color: string, value: any) => {
    const restrictedR = checkRValue(color);
    if (!restrictedR) {
        colorBindings.set({color}, value)
    } else {
        return Error("rValue already registered");
    }
}

//Bind a function to a color.

export const bindFn = (color: string, fn: Function) => {
    colorBindings.set({color}, fn);
}

//Get a binding by color

export const getBinding = (color: string) => {
    const binding = colorBindings.get({color});
    if (!binding) {
        throw new Error("No binding for " + color);
    }
    return binding;
}

//Remove a binding by color. Will fail if binding is a paramFn binding and request you to use removeParamFn.

export const removeBinding = (color: string) => {
    const restrictedR = checkRValue(color);
    if (!restrictedR) {
        colorBindings.delete({color});
    } else {
        return Error("Binding is a paramFn rValue. Use removeParamFn");
    }
}

//Create a paramFn, which is a function that is declared across all G and B channels of a single R channel, and provides the G and B values as parameters.

export const createParamFn = (rValue: number, fn: Function) => {
    if (rValues.indexOf(rValue) === -1) {
        for (let g = 0; g < 256; g++) {
            for (let b = 0; b < 256; b++) {
                colorBindings.set({color: rgbToHex(rValue, g, b)}, () => {
                    fn(g, b)
                })
            }
        }
    } else {
        return Error("rValue already registered");
    }
}

//Remove a paramFn

export const removeParamFn = (rValue: number) => {
    for (let g = 0; g < 256; g++) {
        for (let b = 0; b < 256; b++) {
            colorBindings.delete({color: rgbToHex(rValue, g, b)})
        }
    }
    const index = rValues.indexOf(rValue);
    if (index > -1) {
        rValues.splice(rValues.indexOf(rValue), 1);
    }
}

// Reads an array of colors and runs all bound functions in parallel
// Declare functions within your colorArray with this pattern: #000000, Fn, [any number of params], #FFFFFF

export const readColors = async (colorArray: Array<string>, isAsync: boolean) => {
    const execArray: Array<Function> = [];
    let exec: Array<any> = [];
    let isExec = false;
    colorArray.forEach(async (color) => {
        if (color === '#FFFFFF') {
            isExec = true;
            exec = [];
        }
        if (isExec === true && color !== '#FFFFFF' && color !== '#000000') {
            const item = getBinding(color)
            exec.push(item as never);
        }
        if (color === '#000000') {
            const fn = exec.shift() || function() {};
            const boundFn = fn.bind(this, ...exec.slice(0));
            if (isAsync) {
                execArray.push(await boundFn());
            } else {
                boundFn()
            }
            isExec = false;
        }
    })
    if (isAsync) {
        return Promise.all(execArray);
    } else {
        return true;
    }
}

export default { 
    getBinding, removeBinding, bindFn, bindValue, readColors, removeParamFn, createParamFn
}