'use strict';

const path = require('path');
const { SlashCommandBuilder, time } = require('@discordjs/builders');
const { MessageButton } = require('discord.js');
const paginationEmbed = require('discordjs-button-pagination');
const logger = require('../../utils/logger');
const template = require('../../utils/embed-template');
const { getUserInfo } = require('../../utils/get-user-info');
const { setUserInfo } = require('../../utils/set-user-info');

const PREFIX = path.parse(__filename).name;

const buttonList = [
  new MessageButton().setCustomId('previousbtn').setLabel('Previous').setStyle('DANGER'),
  new MessageButton().setCustomId('nextbtn').setLabel('Next').setStyle('SUCCESS'),
];

async function parseDuration(duration) {
  // Those code inspired by https://gist.github.com/substanc3-dev/306bb4d04b2aad3a5d019052b1a0dec0
  // This is super cool, thanks a lot!
  const supported = 'smhdwmoy';
  const numbers = '0123456789';
  let stage = 1;
  let idx = 0;
  let tempNumber = 0;
  let tempString = '';
  let timeValue = 0;
  while (idx < duration.length) {
    const c = duration[idx];
    switch (stage) {
      default:
        break;
      case 1: // waiting for number
      {
        idx += 1;
        if (numbers.includes(c)) {
          tempString = c.toString();
          stage = 2;
        }
        break;
      }
      case 2: // parsing the number
      {
        if (numbers.includes(c)) {
          tempString += c;
          idx += 1;
        } else {
          logger.debug(`[${PREFIX}] TValue: ${tempString}`);
          tempNumber = Number.parseInt(tempString, 10);
          stage = 3;
        }
        break;
      }
      case 3: // parsing the qualifier
      {
        idx += 1;
        if (c === ' ') { break; } else if (supported.includes(c)) {
          // logger.debug(`[${PREFIX}] Qualifier ${c}`);
          switch (c) {
            default:
              logger.debug(`[${PREFIX}] Unknown qualifier ${c}`);
              break;
            case 'h':
              timeValue += tempNumber * 60 * 60 * 1000;
              break;
            case 'mo':
              timeValue += tempNumber * 30 * 24 * 60 * 60 * 1000;
              break;
            case 'm':
              timeValue += tempNumber * 60 * 1000;
              break;
            case 's':
              timeValue += tempNumber * 1000;
              break;
            case 'd':
              timeValue += tempNumber * 24 * 60 * 60 * 1000;
              break;
            case 'w':
              timeValue += tempNumber * 7 * 24 * 60 * 60 * 1000;
              break;
            case 'y':
              timeValue += tempNumber * 365 * 24 * 60 * 60 * 1000;
              break;
          }
          stage = 1;
          break;
        } else return timeValue;
      }
    }
  }
  return timeValue;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('idose')
    .setDescription('Your personal dosage information!')
    .addSubcommand(subcommand => subcommand
      .setName('set')
      .setDescription('Record when you dosed something')
      .addIntegerOption(option => option.setName('volume')
        .setDescription('How much?')
        .setRequired(true))
      .addStringOption(option => option.setName('units')
        .setDescription('What units?')
        .setRequired(true)
        .addChoice('mg (milligrams)', 'mg (milligrams)')
        .addChoice('ml (milliliters)', 'ml (milliliters)')
        .addChoice('µg (micrograms)', 'µg (micrograms)')
        .addChoice('g (grams)', 'g (grams)')
        .addChoice('oz (ounces)', 'oz (ounces)')
        .addChoice('fl oz (fluid ounces)', 'fl oz (fluid ounces)')
        .addChoice('tabs', 'tabs')
        .addChoice('caps', 'caps')
        .addChoice('pills', 'pills')
        .addChoice('drops', 'drops')
        .addChoice('sprays', 'sprays')
        .addChoice('inhales', 'inhales'))
      .addStringOption(option => option.setName('substance')
        .setDescription('What Substance?')
        .setRequired(true)
        .setAutocomplete(true))
      .addStringOption(option => option.setName('offset')
        .setDescription('How long ago? EG: 4 hours 32 mins ago')))
    .addSubcommand(subcommand => subcommand
      .setName('get')
      .setDescription('Get your dosage records!')),
  // .addSubcommand(subcommand => subcommand
  //   .setName('delete')
  //   .setDescription('Delete your dosage records!')),
  async execute(interaction, parameters) {
    logger.debug(`[${PREFIX}] Starting!`);
    let command = '';
    try {
      command = interaction.options.getSubcommand();
    } catch (err) {
      command = parameters.at(0);
    }
    const embed = template.embedTemplate();
    const book = [];
    // if (command === 'delete') {
    //   const [actorData, actorFbid] = await getUserInfo(interaction.member);
    //   if (userInfo.dosage.length === 0) {
    //     embed.setTitle('No records found!');
    //     embed.setDescription('You have no records to delete!');
    //     interaction.respond(embed);
    //     return;
    //   }
    // }
    logger.debug(`[${PREFIX}] Command: ${command}`);
    if (command === 'get') {
      // Extract actor data
      const [actorData, actorFbid] = await getUserInfo(interaction.member);
      logger.debug(actorFbid);
      // Transform actor data
      const doseData = actorData.dose_log ? actorData.dose_log : [];
      if (doseData) {
        embed.setTitle('Your dosage history');
        // Sort doseData by time
        const sortedDoseData = doseData.sort((a, b) => {
          if (a.time > b.time) return -1;
          if (a.time < b.time) return 1;
          return 0;
        });
        if (sortedDoseData.length > 24) {
          let pageEmbed = template.embedTemplate();
          pageEmbed.setTitle('Your dosage history');
          // Add fields to the pageEmbed until there are 24 fields
          let pageFields = [];
          let pageFieldsCount = 0;
          for (let i = 0; i < sortedDoseData.length; i += 1) {
            const dose = sortedDoseData[i];
            const timeVal = dose.time;
            const substance = dose.substance;
            const volume = dose.volume;
            const units = dose.units;
            const field = {
              name: `${timeVal}`,
              value: `${volume} ${units} of ${substance}`,
              inline: true,
            };
            pageFields.push(field);
            // logger.debug(`[${PREFIX}] Adding field ${field.name}`);
            pageFieldsCount += 1;
            // logger.debug(`[${PREFIX}] pageFieldsCount: ${pageFieldsCount}`);
            if (pageFieldsCount === 24) {
              pageEmbed.setFields(pageFields);
              // logger.debug(`[${PREFIX}] pageEmbed: ${JSON.stringify(pageEmbed)}`);
              book.push(pageEmbed);
              // logger.debug(`[${PREFIX}] book.length: ${book.length}`);
              pageFields = [];
              pageFieldsCount = 0;
              pageEmbed = template.embedTemplate();
            }
          }
          // Add the last pageEmbed
          if (pageFieldsCount > 0) {
            pageEmbed.setFields(pageFields);
            // logger.debug(`[${PREFIX}] pageEmbed: ${JSON.stringify(pageEmbed)}`);
            book.push(pageEmbed);
            // logger.debug(`[${PREFIX}] book.length: ${book.length}`);
          }
        } else {
          Object.keys(sortedDoseData).forEach(key => {
            const timeVal = doseData[key].time;
            const substance = doseData[key].substance;
            const volume = doseData[key].volume;
            const units = doseData[key].units;
            embed.addFields({
              name: `${timeVal}`,
              value: `${volume} ${units} of ${substance}`,
              inline: true,
            });
          });
        }
      } else {
        embed.setTitle('No dose records!');
        embed.setDescription('You have no dose records, use /idose to add some!');
      }
    }
    if (command === 'set') {
      // logger.debug(`[${PREFIX}] Command: ${command}`);
      const substance = interaction.options.getString('substance') || parameters.at(1);
      const volume = interaction.options.getInteger('volume') || parameters.at(2);
      const units = interaction.options.getString('units') || parameters.at(3);
      let offset = '';
      // logger.debug(`[${PREFIX}] option: ${interaction.options.getString('offset')}`);
      // logger.debug(`[${PREFIX}] parameters: ${parameters}`);
      if (interaction.options.getString('offset')) {
        offset = interaction.options.getString('offset');
      } else if (parameters) {
        offset = parameters.at(4);
      } else {
        offset = '';
      }
      // logger.debug(`[${PREFIX}] offset: ${offset}`);
      logger.debug(`[${PREFIX}] ${volume} ${units} ${substance} ${offset}`);

      // Make a new variable that is the current time minus the out variable
      const date = new Date();
      if (offset) {
        const out = await parseDuration(offset);
        // logger.debug(`[${PREFIX}] out: ${out}`);
        date.setTime(date.getTime() - out);
      }
      // logger.debug(`[${PREFIX}] date: ${date}`);

      const timeString = time(date);
      // logger.debug(`[${PREFIX}] timeString: ${timeString}`);
      const relative = time(date, 'R');
      // logger.debug(`[${PREFIX}] relative: ${relative}`);

      const doseObj = {
        volume,
        units,
        substance,
        time: timeString,
      };

      const embedField = {
        name: `You dosed ${volume} ${units} of ${substance}`,
        value: `${relative} on ${timeString}`,
      };
      embed.setColor('DARK_BLUE');
      embed.setTitle('New iDose entry:');
      embed.addFields(embedField);

      // Extract actor data
      const [actorData, actorFbid] = await getUserInfo(interaction.member);

      // Transform actor data
      if ('dose_log' in actorData) {
        logger.debug(`[${PREFIX}] Updating dose_log info!`);
        logger.debug(`[${PREFIX}] dose_log: ${JSON.stringify(embedField)}`);
        actorData.dose_log.push(doseObj);
      } else {
        logger.debug(`[${PREFIX}] Creating dose_log info!`);
        actorData.dose_log = [doseObj];
      }

      // Load actor data
      await setUserInfo(actorFbid, actorData);
    }

    // logger.debug(`[${PREFIX}] book.length: ${book.length}`);
    if (book.length > 1) {
      paginationEmbed(interaction, book, buttonList);
    } else if (!interaction.replied) {
      interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
      interaction.member.send({ embeds: [embed], ephemeral: false });
    } else {
      interaction.followUp({
        embeds: [embed],
        ephemeral: false,
      });
    }

    logger.debug(`[${PREFIX}] Finsihed!`);
  },
};