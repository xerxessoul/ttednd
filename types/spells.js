const spellParts = require('../definition').Spell

class Spells {

  constructor() {
    this.spellName = '',
    this.level = '',
    this.spellType = '';
    this.castingTime = '',
    this.range = '',
    this.components = '',
    this.duration = '',
    this.description = '',
    this.classes = '',
    this.upCast = '',
    this.isRitual = false;
  }
  
  // async function condenseSpells (spellList) {
  //   let newList = spellList.filter((spell, loc) => {
  //     if (spell.spellName === "" || spell.level === ""){
  //       for (const prop in spellList[loc-1]){
  //         if(prop === 'isRitual') {
  //           spellList[loc-1][prop] = spell.isRitual;
  //         } else {
  //           spellList[loc-1][prop] = `${spellList[loc-1][prop]}`.concat('', spell[prop])
  //           spellList[loc-1][prop] = spellList[loc-1][prop].replace(/\s+/g,' ').trim();
  //         }
  //       }
  //       return false;
  //     }
  //     for (const prop in spell){
  //       if(prop != 'isRitual'){
  //         spell[prop] = spell[prop].replace(/\s+/g,' ').trim();
  //       }
  //     }
  //     return true
  //   })
  //   console.log(newList.length)
  //   return toFile(jsonName, JSON.stringify((newList)));
  // }
}
module.exports = {Spells};