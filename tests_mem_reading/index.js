const memoryjs = require('memoryjs');
const os = require('os')


function convert(Uint8Arr, offset, length) {
    let buffer = Buffer.from(Uint8Arr);
    if (os.endianness() == "BE") {
        var result = buffer.readUIntBE(offset, length);
    } else {
        var result = buffer.readUIntLE(offset, length);
    }

    return result;
}


const process = memoryjs.openProcess("League of Legends.exe")
console.log(process);

const mngrVal = memoryjs.readMemory(process.handle, process.modBaseAddr + 24247192, "int32")
console.log(mngrVal);

const arr = Uint8Array.from(memoryjs.readBuffer(process.handle, mngrVal, 100))
console.log(arr);

console.log(convert(arr, 40, 4));

var queue = [];
var visited = [];
let read = 0;
let objNr = 0;
let pointers = new Array(500);
queue.push(convert(arr, 40, 4));

while (queue.length > 0 && read < 500) {
    let toRead = queue.shift();
    if (!visited.includes(toRead)) {
        read++;
        visited.push(toRead);

        let buff = Uint8Array.from(memoryjs.readBuffer(process.handle, toRead, 48));
        queue.push(convert(buff, 0, 4));
        queue.push(convert(buff, 4, 4));
        queue.push(convert(buff, 8, 4));

        if (convert(buff, 16, 4) - 1073741824 <= 1048576) {
            if (convert(buff, 20, 4) != 0) {
                pointers[objNr++] = convert(buff, 20, 4);
            }
        }

    }
}

console.log(pointers)