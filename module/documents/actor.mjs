/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class StardrifterActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.stardrifter || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  _conHPMod = [
    0, 0, 0,-2,-1, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 2, 3, 4];
  
  _conStaminaMod = [
    0, 0, 0,-5,-4,-3,-2,-1, 0, 0,
    0, 1, 2, 3, 4, 5, 6, 7, 8];

  _backgroundHPMod = {
    "spacer": 2,
    "stationer": 1,
    "xmil": 1,
    "groundpounder": 0,
    "drifter": 1
  };
  
  _backgroundStaminaMod = {
    "spacer": 0,
    "stationer": 1,
    "xmil": 1,
    "groundpounder": 2,
    "drifter": 1
  };
    
      /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    const actorAbilities = systemData.abilities;
    const actorAttributes = systemData.attributes;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(actorAbilities)) {
      // Calculate the modifier using d20 rules.
      ability.mod = 20 - ability.value;
    }
    actorAttributes.save.mental = Math.ceil((
      actorAbilities.wis.value +
      actorAbilities.int.value +
      actorAbilities.cha.value) / 3
    );
    actorAttributes.save.physical = Math.ceil((
      actorAbilities.str.value +
      actorAbilities.dex.value +
      actorAbilities.con.value) / 3
    );

    const conValue = parseInt(actorAbilities.con.value);
    const bgValue = systemData.attributes.background;

    systemData.stamina.max = (
      8 + this._conStaminaMod[conValue] + this._backgroundStaminaMod[bgValue]);
    systemData.health.max = (
      8  + this._conHPMod[conValue] + this._backgroundHPMod[bgValue]);
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    systemData.xp = (systemData.cr * systemData.cr) * 100;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.attributes.level) {
      data.lvl = data.attributes.level.value ?? 0;
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

}