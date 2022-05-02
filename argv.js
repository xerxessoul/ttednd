const fs = require('fs');
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
const enc = require('encoding-japanese') //for testing purposes, remove from final version
const utf8 = require('utf8');//find fix for broken unicode characters
const def = require('./definition');

let spellList = {};

function spellBuilder(obj, descr, info = null) {
    let regType = /-level (\w+) \(|-level (\w+)|(\w+) cantrip/;
    let spellType = descr.match(regType) ? descr.match(regType) : null;
    if (descr.includes("-level") && spellType) {
        obj.level = descr.match(/(.+l?) /)[1];
        if (spellType[1])
            obj.ritual = true;
        obj.spellType = spellType[1] || spellType[2]  
    } else if (descr.includes("cantrip") && spellType) {
            obj.level = "cantrip";
            obj.spellType =  spellType[3];
    } else if (obj.hasOwnProperty(descr)) 
        obj[descr] = info;
     else if (descr.includes("casting time")) 
        obj.castingTime = info;
     else if (descr.includes("higher levels")) 
        obj.upCast = info;
     else 
        obj.description = obj.description === "" ? obj.description.concat( '', info.str ) : obj.description.concat( ' ', info.str )
}

function toSpellList (list = spellList, spell) {
    console.log(spell)
    let {spellName, ...spellInfo} = spell;
    list[spellName] = spellInfo;
}

let pdfPath = process.argv[2] || "./COFSA.pdf";
const task = pdfjs.getDocument(pdfPath)
task.promise
    .then((doc) => {
        doc.getPage(parseInt(process.argv[3]))
            .then((page) => {
                page.getTextContent()
                    .then((content) => {
                        let list = content.items;
                        let spell = new def.Spell;
                        let debt = 0;
                        const string = list.map( (item, loc) => {
                            let prev = loc - 1;
                            let next = loc + 1;
                            if (debt != 0){
                                console.log("skipped: ", item.str)
                                debt--;
                                return;
                            } else if (loc === 0) {
                                return;
                            } else if (item.fontName === "g_d0_f1" && item.hasEOL === false) {
                                console.log(item.str)
                                spell = new def.Spell;
                                spell.spellName = item.str;
                            } else if(item.fontName === "g_d0_f1" && list[Object.keys(list)[prev]].fontName != "g_d0_f1") {
                                toSpellList(spellList, spell);
                            } else {
                                if (list[Object.keys(list)[prev]].hasEOL === false) {
                                } else {
                                    let info;
                                    if (item.str.includes(":")) {
                                        let dif = 2;
                                        if ((list[Object.keys(list)[loc]].str === "Components:") || (list[Object.keys(list)[loc]].str.includes("Higher Levels:"))) {
                                            info = list[Object.keys(list)[loc + dif]].str;
                                            while (list[Object.keys(list)[loc + dif]].hasEOL === true) {
                                                dif++;
                                                info = info.concat( ' ', list[Object.keys(list)[loc + dif]].str);
                                            }
                                        } else {
                                            info = list[Object.keys(list)[loc + dif]].str
                                        }
                                        debt = dif;
                                        spellBuilder(spell, item.str.toLowerCase().replace(":", ""), info);
                                        if (!list[Object.keys(list)[next + dif]]) {
                                            toSpellList(spellList, spell);
                                        }
                                    }else {
                                        spellBuilder(spell, item.str.toLowerCase(), item);
                                    }
                                }
                            }
                            if (!list[Object.keys(list)[next]] || !item) {
                                toSpellList(spellList, spell);
                            }
                        })
                        let spellJson = JSON.stringify(spellList);
                        const fs = require('fs');
                        fs.writeFile(process.argv[4], spellJson, function(err, result) {
                            if(err) console.log('error', err);
                        });
                    })
            })
    })