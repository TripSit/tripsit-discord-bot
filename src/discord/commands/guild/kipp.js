'use strict';

const path = require('path');
const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../../../global/utils/logger');
const template = require('../../utils/embed-template');

const PREFIX = path.parse(__filename).name;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kipp')
    .setDescription('Keep it positive please!'),

  async execute(interaction) {
    const happyEmojis = [
      'ð', 'ð', 'ð', 'ð', 'ð', 'ð¥°', 'ð', 'ð', 'ð', 'ð¤£',
      'ð', 'ð', 'ð', 'ð', 'ð', 'ð', 'ð¤ª', 'ð', 'ð¤', 'ð¤­',
      'ð', 'ðº', 'ð¸', 'ð¹', 'ð»', 'ð', 'â'];

    // Get 10 random happy emojis from the list above
    const rowA = happyEmojis.sort(() => 0.5 - Math.random()).slice(0, 8);
    logger.debug(`[${PREFIX}] Row A: ${rowA}`);
    const rowB = '\nðKeep It Positive Please!ð\n';
    logger.debug(`[${PREFIX}] Row B: ${rowB}`);
    const rowC = happyEmojis.sort(() => 0.5 - Math.random()).slice(0, 8);
    logger.debug(`[${PREFIX}] Row C: ${rowC}`);
    const output = rowA.join(' ') + rowB + rowC.join(' ');
    logger.debug(`[${PREFIX}] Output: ${output}`);

    const embed = template.embedTemplate()
      .setDescription(output)
      .setAuthor(null)
      .setFooter(null);

    if (!interaction.replied) {
      interaction.reply({
        embeds: [embed],
        ephemeral: false,
      });
    } else {
      interaction.followUp({
        embeds: [embed],
        ephemeral: false,
      });
    }

    logger.debug(`[${PREFIX}] finished!`);
  },
};
