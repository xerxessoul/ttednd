function Spell() {
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

let spellTypes = [
    'Conjuration',
    'Necromancy',
    'Evocation',
    'Abjuration',
    'Transmutation',
    'Divination',
    'Enchantment',
    'Illusion'
]

let spellComponents = [
    'Casting Time',
    'Range',
    'Components',
    'Duration',
    'Higher Levels'
]

module.exports = { Spell: Spell, spellType: spellTypes, spellComp: spellComponents }