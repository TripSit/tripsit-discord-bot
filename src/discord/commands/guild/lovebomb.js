'use strict';

const path = require('path');
const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../../../global/utils/logger');

const PREFIX = path.parse(__filename).name;

const heartEmojis = [
  'โค', '๐งก', '๐', '๐', '๐', '๐',
  '๐', '๐', '๐', '๐', '๐', '๐', '๐', '๐', 'โฃ',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lovebomb')
    .setDescription('Spread some love'),

  async execute(interaction) {
    const message = `${heartEmojis.sort(() => 0.5 - Math.random()).slice(0, 30).join(' ')}`;
    interaction.reply(message);

    logger.debug(`[${PREFIX}] finished!`);
  },
};
