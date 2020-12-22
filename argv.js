const parse = require('pdfjs-dist')
const fs = require('fs')

let pdf = process.argv[2];
if (!fs.existsSync(pdf)) {
    console.log("Please include a valid link.");
} else {
    // parse.getDocument()
    console.log('boom')
}