'use strict';

const path = require('path');
const Fuse = require('fuse.js');
const _ = require('underscore'); // TODO: underscore.js
const logger = require('./logger');
const pillColors = require('../assets/data/pill_colors.json');
const pillShapes = require('../assets/data/pill_shapes.json');
const drugDataAll = require('../assets/data/drug_db_combined.json');
const drugDataTripsit = require('../assets/data/drug_db_tripsit.json');
const timezones = require('../assets/data/timezones.json');
const unitsOfMeasurement = require('../assets/data/units_of_measurement.json');

const PREFIX = path.parse(__filename).name;

const timezoneNames = [];
for (let i = 0; i < timezones.length; i += 1) {
  timezoneNames.push(timezones[i].label);
}

const measurementNames = [];
for (let i = 0; i < unitsOfMeasurement.length; i += 1) {
  measurementNames.push(unitsOfMeasurement[i].abbr);
}

const pillColorNames = [];
for (let i = 0; i < pillColors.length; i += 1) {
  pillColorNames.push(Object.keys(pillColors[i])[0]);
}
const defaultColors = pillColorNames.slice(0, 25);
// logger.debug(`[${PREFIX}] pill_color_names: ${pill_color_names}`);

const pillShapeNames = [];
for (let i = 0; i < pillShapes.length; i += 1) {
  pillShapeNames.push(Object.keys(pillShapes[i])[0]);
}
const defaultShapes = pillShapeNames.slice(0, 25);
// logger.debug(`[${PREFIX}] pill_shape_names: ${pill_shape_names}`);

// The following code came from the benzo_convert tool in the github
const drugCache = drugDataTripsit;
// Filter any drug not containing the dose_to_diazepam property
let benzoCache = _.filter((drugCache), dCache => _.has(dCache.properties, 'dose_to_diazepam'));

_.each(benzoCache, benzo => {
  _.each(benzo.aliases, alias => {
    benzoCache.push({
      // Add used aliases to new objects
      name: alias,
      pretty_name: alias.charAt(0).toUpperCase() + alias.slice(1),
      properties: benzo.properties,
      formatted_dose: benzo.formatted_dose,
    });
  });
});

benzoCache = _.sortBy(benzoCache, 'name');
const regex = /\d+\.?\d?/;
benzoCache = _.each(benzoCache, bCache => {
  bCache.diazvalue = regex.exec(bCache.properties.dose_to_diazepam); // eslint-disable-line
});
// End borrowed code, thanks bjorn!

const benzoDrugNames = benzoCache.map(d => d.name);
const defaultBenzoNames = benzoDrugNames.slice(0, 25);

module.exports = {
  async execute(interaction) {
    logger.debug(`[${PREFIX}] Autocomplete requested for: ${interaction.commandName}`);
    // if (interaction.commandName === 'ems') {
    //   const emsData = Object.keys(emergency).map(key => ({
    //   country: key, data: emergency[key]
    // }));
    //   // logger.debug(`[${PREFIX}] emsData: ${JSON.stringify(emsData, null, 2)}`);
    //   const options = {
    //     shouldSort: true,
    //     keys: [
    //       'country',
    //     ],
    //   };
    //   const fuse = new Fuse(emsData, options);
    //   // logger.debug(`[${PREFIX}] fuse: ${JSON.stringify(fuse, null, 2)}`);
    //   const focusedValue = interaction.options.getFocused();
    //   logger.debug(`[${PREFIX}] focusedValue: ${focusedValue}`);
    //   const results = fuse.search(focusedValue);
    //   // logger.debug(`[${PREFIX}] Autocomplete results: ${results}`);
    //   if (results.length > 0) {
    //     const top25 = results.slice(0, 25);
    //     const listResults = top25.map(choice => ({
    //       name: choice.item.country,
    //       value: choice.item.country,
    //     }));
    //     // logger.debug(`[${PREFIX}] list_results1: ${listResults}`);
    //     interaction.respond(listResults);
    //   } else {
    //     const defaultEms = Object.keys(emergency).slice(0, 25);
    //     const listResults = defaultEms.map(choice => ({ name: choice, value: choice }));
    //     // logger.debug(`[${PREFIX}] list_results2: ${listResults}`);
    //     interaction.respond(listResults);
    //   }
    // } else
    if (interaction.commandName === 'pill-id') {
      const focusedOption = interaction.options.getFocused(true).name;
      const options = {
        shouldSort: true,
        keys: [
          'name',
        ],
      };

      if (focusedOption === 'color') {
        const fuse = new Fuse(pillColorNames, options);
        const focusedValue = interaction.options.getFocused();
        const results = fuse.search(focusedValue);
        if (results.length > 0) {
          const top25 = results.slice(0, 25);
          const listResults = top25.map(choice => ({ name: choice.item, value: choice.item }));
          interaction.respond(listResults);
        } else {
          interaction.respond(defaultColors.map(choice => ({ name: choice, value: choice })));
        }
      }
      if (focusedOption === 'shape') {
        const fuse = new Fuse(pillShapeNames, options);
        const focusedValue = interaction.options.getFocused();
        const results = fuse.search(focusedValue);
        if (results.length > 0) {
          const top25 = results.slice(0, 25);
          const listResults = top25.map(choice => ({ name: choice.item, value: choice.item }));
          interaction.respond(listResults);
        } else {
          interaction.respond(defaultShapes.map(choice => ({ name: choice, value: choice })));
        }
      }
    } else if (interaction.commandName === 'calc-benzo') {
      const options = {
        shouldSort: true,
        keys: [
          'name',
          'aliasesStr',
        ],
      };
      // eslint-disable-next-line
      // logger.debug(`[${PREFIX}] benzo_drug_names: ${JSON.stringify(benzo_drug_names, null, 2)}`);
      const fuse = new Fuse(benzoDrugNames, options);
      const focusedValue = interaction.options.getFocused();
      logger.debug(`[${PREFIX}] focusedValue: ${focusedValue}`);
      const results = fuse.search(focusedValue);
      logger.debug(`[${PREFIX}] results: ${JSON.stringify(results, null, 2)}`);
      if (results.length > 0) {
        const top25 = results.slice(0, 25);
        interaction.respond(top25.map(choice => ({ name: choice.item, value: choice.item })));
      } else {
        interaction.respond(defaultBenzoNames.map(choice => ({ name: choice, value: choice })));
      }
    } else if (interaction.commandName === 'time') {
      const options = {
        shouldSort: true,
        keys: [
          'label',
        ],
      };

      const fuse = new Fuse(timezones, options);
      const focusedValue = interaction.options.getFocused();
      // logger.debug(`[${PREFIX}] focusedValue: ${focusedValue}`);
      const results = fuse.search(focusedValue);
      // logger.debug(`[${PREFIX}] Autocomplete results: ${results}`);
      if (results.length > 0) {
        const top25 = results.slice(0, 25);
        const listResults = top25.map(choice => ({
          name: choice.item.label,
          value: choice.item.label,
        }));
        // logger.debug(`[${PREFIX}] list_results: ${listResults}`);
        interaction.respond(listResults);
      } else {
        const defaultTimezones = timezoneNames.slice(0, 25);
        const listResults = defaultTimezones.map(choice => ({ name: choice, value: choice }));
        // logger.debug(`[${PREFIX}] list_results: ${listResults}`);
        interaction.respond(listResults);
      }
    } else if (interaction.commandName === 'convert') {
      const firstUnit = interaction.options.data[1].value;
      const focusedOption = interaction.options.data[1].focused;

      let displayUnits = [];
      let measure = '';
      if (firstUnit !== '' && !focusedOption) {
        logger.debug(`[${PREFIX}] firstUnit: ${firstUnit}`);
        // eslint-disable-next-line
        for (const i in unitsOfMeasurement) {
          if (unitsOfMeasurement[i].abbr.toLowerCase() === firstUnit.toLowerCase()) {
            measure = unitsOfMeasurement[i].measure;
            logger.debug(`[${PREFIX}] First unit measure: ${measure}`);
          }
        }
        // eslint-disable-next-line
        for (const i in unitsOfMeasurement) {
          if (unitsOfMeasurement[i].measure.toLowerCase() === measure.toLowerCase()) {
            displayUnits.push(unitsOfMeasurement[i]);
            logger.debug(`[${PREFIX}] Added: ${unitsOfMeasurement[i].plural}`);
          }
        }
      } else {
        displayUnits = unitsOfMeasurement;
      }

      const options = {
        shouldSort: true,
        keys: [
          'plural',
          'singular',
          'abbr',
        ],
      };

      const fuse = new Fuse(displayUnits, options);
      const focusedValue = interaction.options.getFocused();
      // logger.debug(`[${PREFIX}] focusedValue: ${focusedValue}`);
      const results = fuse.search(focusedValue);
      // logger.debug(`[${PREFIX}] Autocomplete results: ${results}`);
      if (results.length > 0) {
        const top25 = results.slice(0, 25);
        const listResults = top25.map(choice => ({
          name: choice.item.abbr,
          value: choice.item.abbr,
        }));
        // logger.debug(`[${PREFIX}] list_results: ${listResults}`);
        interaction.respond(listResults);
      } else {
        if (measure !== '') {
          const top25 = displayUnits.slice(0, 25);
          const listResults = top25.map(choice => ({
            name: choice.abbr,
            value: choice.abbr,
          }));
          // logger.debug(`[${PREFIX}] list_results: ${listResults}`);
          interaction.respond(listResults);
          return;
        }
        const defaultMeasurements = measurementNames.slice(0, 25);
        const listResults = defaultMeasurements.map(choice => ({ name: choice, value: choice }));
        // logger.debug(`[${PREFIX}] list_results: ${listResults}`);
        interaction.respond(listResults);
      }
    } else { // If you don't need a specific autocomplete, return a list of drug names
      const options = {
        shouldSort: true,
        threshold: 0.2,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
          'name',
          'aliases',
        ],
      };
      const fuse = new Fuse(drugDataAll, options);
      const focusedValue = interaction.options.getFocused();
      const results = fuse.search(focusedValue);
      let top25 = [];
      if (results.length > 0) {
        top25 = results.slice(0, 25);
        interaction.respond(top25.map(choice => (
          { name: choice.item.name, value: choice.item.name })));
      } else {
        const TOP_PSYCHS = ['Cannabis', 'MDMA', 'LSD', 'DMT', 'Mushrooms'];
        const TOP_DISSOS = ['Zolpidem', 'Ketamine', 'DXM', 'PCP', 'Salvia'];
        const TOP_OPIATE = ['Alcohol', 'Hydrocodone', 'Oxycodone', 'Tramadol', 'Heroin'];
        const TOP_BENZOS = ['Alprazolam', 'Clonazepam', 'Diazepam', 'Lorazepam', 'Flunitrazepam'];
        const TOP_SPEEDS = ['Nicotine', 'Amphetamine', 'Cocaine', 'Methamphetamine', 'Methylphenidate'];
        const TOP_DRUGS = TOP_PSYCHS.concat(TOP_DISSOS, TOP_OPIATE, TOP_BENZOS, TOP_SPEEDS);
        interaction.respond(TOP_DRUGS.map(choice => ({ name: choice, value: choice })));
      }
    }
    logger.debug(`[${PREFIX}] finished!`);
  },
};
