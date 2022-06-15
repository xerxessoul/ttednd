const fs = require('fs');
const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
// const pdfjs = require('pdfjs-dist');
// const bereich = require('bereich');
const enc = require('encoding-japanese') //for testing purposes, remove from final version
const utf8 = require('utf8');//find fix for broken unicode characters
const def = require('./definition');
const Spells = require('./types/spells.js');

let spellCompendium = [];
const path = process.argv[2];
const jsonName = process.argv[3];
const fPage = parseInt(process.argv[4]);
const lPage = parseInt(process.argv[5]) || undefined;


async function spellBuilder(obj, descr, info = null) {
  let regType = /-level (\w+) \(|-level (\w+)|(\w+) cantrip/;
  let spellType = descr.match(regType) ? descr.match(regType) : null;
  if (descr.includes("-level") && spellType) {
    obj.level = descr.match(/(.+l?) /)[1];
    if (spellType[1])
      obj.isRitual = true;
    obj.spellType = spellType[1] || spellType[2]
  } else if (descr.includes("cantrip") && isSpellType(spellType)) {
    obj.level = "cantrip";
    obj.spellType = spellType[3];
  } else if (obj.hasOwnProperty(descr))
    obj[descr] = info;
  else if (descr.includes("casting time") && obj.castingTime === "")
    obj.castingTime = info;
  else if (descr.includes("higher levels"))
    obj.upCast = info;
  else
    obj.description = obj.description === "" ? obj.description.concat('', info.str) : obj.description.concat(' ', info.str)
}

function isSpellType (istype) {
  let types = def.spellType
  for(let i = 0; i <= types.length - 1; i++) {
    if (istype[3].toLowerCase() === types[i].toLowerCase()){
      return true
    }
  }
  return false
}

function isSpellDecription (line) {
  let descr = def.spellComp;
  for(let i = 0; i <= descr.length - 1; i++) {
    if (line.includes(descr[i])){
      return true
    }
  }
  return false
}

async function toFile(name, list) {
  // console.log(name, list)
  // if (fs.existsSync(name)) {
  //     fs.appendFile(name, list, function(err, result) {
  //         if(err) console.log('error', err);
  //     });
  // } else {
  fs.writeFile(name, list, function (err, result) {
    if (err) console.log('error', err);
  });
  // }
}


async function addSpells(page) {
  let spellList = [];
  let list = page.items;
  let spell = new Spells;
  console.Console.log(spell)
  let debt = 0;
  list.map((item, loc) => {
    let prev = loc - 1;
    let next = loc + 1;
    console.log(loc, item.str, item.fontName)
    if (debt != 0) {
      debt--;
      return;
    } else if (loc === 0) {
      return;
    } else if ((item.fontName === "g_d0_f1" || item.fontName === "g_d0_f5") && item.hasEOL === false) {
      spell = new Spells;
      spell.spellName = item.str;
      // console.log(item.str)
    } else if ((item.fontName === "g_d0_f1" || item.fontName === "g_d0_f5") && (list[Object.keys(list)[prev]].fontName != "g_d0_f1" || list[Object.keys(list)[prev]].fontName != "g_d0_f5")) {
      // console.log(spell)
      spellList.push(spell);
    } else {
      let info;
      if (isSpellDecription(item.str)) {
        let dif = 2;
        if ((item.str === "Components:") || (item.str.includes("Higher Levels:"))) {
          info = list[Object.keys(list)[loc + dif]].str;
          while (list[Object.keys(list)[loc + dif]].hasEOL === true) {
            dif++;
            info = info.concat(' ', list[Object.keys(list)[loc + dif]].str);
          }
        } else {
          info = list[Object.keys(list)[loc + dif]].str
        }
        debt = dif;
        spellBuilder(spell, item.str.toLowerCase().replace(":", ""), info);
        if (!list[Object.keys(list)[next + dif]]) {
          // console.log(spell)
          spellList.push(spell);
        }
      } else {
        spellBuilder(spell, item.str.toLowerCase(), item);
      }
    }
    if (!list[Object.keys(list)[next]] || !item) {
      // console.log(spell)
      spellList.push(spell);
    }
  })
  return spellList      
}

let condenseSpells = async (spellList) => {
  let newList = spellList.filter((spell, loc) => {
    if (spell.spellName === "" || spell.level === ""){
      for (const prop in spellList[loc-1]){
        if(prop === 'isRitual') {
          spellList[loc-1][prop] = spell.isRitual;
        } else {
          spellList[loc-1][prop] = `${spellList[loc-1][prop]}`.concat('', spell[prop])
          spellList[loc-1][prop] = spellList[loc-1][prop].replace(/\s+/g,' ').trim();
        }
      }
      return false;
    }
    for (const prop in spell){
      if(prop != 'isRitual'){
        spell[prop] = spell[prop].replace(/\s+/g,' ').trim();
      }
    }
    return true
  })
  console.log(newList.length)
  return toFile(jsonName, JSON.stringify((newList)));
}

let isLastPage = async (pageNo, list = spellCompendium) => {
  let dif = (lPage - fPage) + 1;
  if (list.length === dif){
    let sorted = list.sort(function (a, b) {
      if(a[0] < b[0]){
        return -1
      }
      if(a[0] > b[0]){
        return 1
      }
    })
    for (i = 0; i < sorted.length; i++) {
      sorted[i].shift();
    }
    console.log(`spell list sorted`)
    return await condenseSpells(sorted.flat());
  } else {
    return `${pageNo} done`
  }
}

let single = async () => {
  let pdfPath = path || "./COFSA.pdf";
  const spellList = pdfjs.getDocument(pdfPath)
  spellList.promise
    .then((doc) => {
      doc.getPage(fPage)
        .then((page) => {
          page.getTextContent()
            .then((content) => {
              addSpells(content)
                .then((list) => {
                  // console.log(list)
                  let result = toFile(jsonName, JSON.stringify((list)))
                  return result
                })
            })
        })
    })
  // console.log(spellList);
}

let multiplePages = async () => {
  let pages = [];
  let result;
  let pdfPath = path || "./COFSA.pdf";
  const pdf = pdfjs.getDocument(pdfPath);

  let pageNum = [];
  for(var i = fPage; i <= lPage; i++){
    pageNum.push(i);
  }
  console.log(pageNum)
  const promises = pageNum.map(pageNo => 
    pdf.promise
      .then((doc) => {
        doc.getPage(pageNo)
          .then((page) => {
            page.getTextContent()
              .then((content) => {
                addSpells(content)
                  .then((list) => {
                    list.unshift(pageNo);
                    spellCompendium.push(list);
                    // console.log(spellCompendium)
                    // return`${pageNo} done`;
                    isLastPage(pageNo)
                      .then(done => {
                        // console.log(done)
                        return done
                      })
                  })
              })
          })
      })
    )
  
  return promises;
}
if (lPage){
  multiplePages()
}else {
  single();
}
