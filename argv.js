const fs = require('fs');
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
const enc = require('encoding-japanese') //for testing purposes, remove from final version
const utf8 = require('utf8');//find fix for broken unicode characters
const def = require('./definition');

function addToSpell(arr, descr, info) {
    // console.log(descr)
    if (descr.includes("-level")) {
        // console.log("type ", descr.match(/vel (.+)/)[1]);
        // console.log("level", descr.match(/(.+l?) /)[1])
        arr.spellType = descr.match(/vel (.+)/)[1];
        arr.level = descr.match(/(.+l?) /)[1]
    } /* else if (descr.includes("Higher Levels:")) {
        // arr[upCast] =*+*
    } */
}

let pdfPath = process.argv[2] || "./COFSA.pdf";
// console.log(pdfPath);
let pg = [];
const task = pdfjs.getDocument(pdfPath)
task.promise
    .then((doc) => {
        // console.log(enc.detect(doc));
        doc.getPage(9)
            .then((page) => {
                page.getTextContent()
                    .then((content) => {
                        // console.log(content.items[Object.keys(content.items)[6]])
                        let list = content.items;
                        let tmp = new def.Spell;
                        let tmpArr = [];
                        let debt = 0;
                        const string = list.map( (item, loc) => {
                            let prev = loc - 1;
                            let ind = tmpArr.length - 1;
                            if (debt != 0){
                                debt--;
                                return;
                            } else if (loc === 0 ) {
                                return;
                            }/* else if(loc >= 50) {
                                return;
                            } */ else if (tmpArr.length === 0) {
                                tmpArr.push(item.str)
                                tmp.spellName = item.str;
                            } else if(item.fontName === "g_d0_f1" && list[Object.keys(list)[prev]].fontName != "g_d0_f1") {
                                // console.log(tmpArr)
                                console.log(tmp)
                                tmpArr = []
                                // obj.spellName = tmpArr[0];
                                // tmpArr.shift();
                                // obj.info.push(...tmpArr);
                                // console.log(obj.info)
                                // console.log(obj)
                                // pg.push(obj);
                                // obj.info = []
                                // tmpArr = []
                            } else {
                                // console.log(item)
                                // console.log(item.str)
                                // console.log((isNaN(list[Object.keys(list)[loc]].str)))
                                if (list[Object.keys(list)[prev]].hasEOL === false) {
                                    // console.log('has EOl', item.str)
                                    tmpArr.push(item.str)  
                                } else {
                                    // console.log("Considered for concat", item.str)
                                    tmpArr[ind] ? tmpArr[ind] = tmpArr[ind].concat( ' ', item.str ) : tmpArr[ind] = item.str
                                    if ((item.str.includes(":")) || (item.str.includes("-level"))) {
                                        let info = list[Object.keys(list)[loc + 2]]
                                        // console.log(info)
                                        addToSpell(tmp, item.str.toLowerCase(), info.str);
                                        debt = 2;
                                        tmpArr[ind] = tmpArr[ind].concat( ' ', list[Object.keys(list)[loc + 2]].str );
                                    }
                                }
                            }
                            if (!list[Object.keys(list)[loc + 1]]) {
                                // console.log(tmpArr)
                            }
                        })
                        pg.forEach(spell => {
                            console.log(spell.spell)
                            console.log(spell.info)
                        })
                    })
            })
    })