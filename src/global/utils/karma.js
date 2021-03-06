'use strict';

const path = require('path');
const logger = require('./logger');
const template = require('../../discord/utils/embed-template');
const { getGuildInfo, setGuildInfo } = require('../services/firebaseAPI');

const PREFIX = path.parse(__filename).name;

const {
  discordGuildId,
} = require('../../../env');

module.exports = {
  async karma(message) {
    // Check if '++' is in the message
    if (message.cleanContent.includes('++')) {
      logger.debug(`[${PREFIX}] Found ++ in message`);
      // Find the word directly before the ++
      const wordBeforePlus = message.cleanContent.split('++')[0];
      logger.debug(`[${PREFIX}] Word before ++: ${wordBeforePlus}`);

      // If the word is blank, ignore it
      if (wordBeforePlus === null
        || wordBeforePlus === undefined
        || wordBeforePlus.length === 0
      ) { return; }

      // If the user is typing "C++", ignore it
      if (wordBeforePlus === 'C') { return; }

      // Extract guild data
      const tripsitGuild = message.client.guilds.resolve(discordGuildId);
      const [targetData, targetFbid] = await getGuildInfo(tripsitGuild);

      let karmaValue = 1;
      // Transform guild data
      if (targetData.karma) {
        // Get karma value
        karmaValue = (targetData.karma[wordBeforePlus] || 0) + karmaValue;
        targetData.karma[wordBeforePlus] = karmaValue;
      } else {
        targetData.karma = { [wordBeforePlus]: karmaValue };
      }

      setGuildInfo(targetFbid, targetData);
      const embed = template
        .embedTemplate()
        .setDescription(`'${wordBeforePlus}' karma increased to ${karmaValue}!`);
      message.channel.send({
        embeds: [embed],
        ephemeral: false,
      });
    }

    if (message.cleanContent.includes('--')) {
      logger.debug(`[${PREFIX}] Found -- in message`);
      // Find the word directly before the --
      const wordBeforePlus = message.cleanContent.split('--')[0];
      logger.debug(`[${PREFIX}] Word before --: ${wordBeforePlus}`);

      // Extract guild data
      const tripsitGuild = message.client.guilds.resolve(discordGuildId);
      const [targetData, targetFbid] = await getGuildInfo(tripsitGuild);

      let karmaValue = 1;
      // Transform guild data
      if (targetData.karma) {
        // Get karma value
        karmaValue = (targetData.karma[wordBeforePlus] || 0) - karmaValue;
        targetData.karma[wordBeforePlus] = karmaValue;
      } else {
        targetData.karma = { [wordBeforePlus]: karmaValue };
      }

      setGuildInfo(targetFbid, targetData);
      const embed = template
        .embedTemplate()
        .setDescription(`'${wordBeforePlus}' karma decreased to ${karmaValue}!`);
      message.channel.send({ embeds: [embed], ephemeral: false });
    }
  },
};
