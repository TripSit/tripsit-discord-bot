'use strict';

const path = require('path');
const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../../../global/utils/logger');
const template = require('../../utils/embed-template');

const PREFIX = path.parse(__filename).name;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hydrate')
    .setDescription('Remember to hydrate!'),

  async execute(interaction) {
    const output = 'đ§đđ§đđ§đđ§đđ§đđ§đđ§đđ§đ\n\n'
        + 'â ī¸ īŧ¨īŧšīŧ¤īŧ˛īŧĄīŧ´īŧŠīŧ¯īŧŽ īŧ˛īŧĨīŧ­īŧŠīŧŽīŧ¤īŧĨīŧ˛ â ī¸\n\n'
        + 'đ§đđ§đđ§đđ§đđ§đđ§đđ§đđ§đ';
    const embed = template.embedTemplate()
      .setColor('DARK_BLUE')
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
