'use strict';

/* eslint-disable global-require */

const { Composer } = require('telegraf');

module.exports = Composer.compose([
  require('./t.start'),
  require('./t.drug'),
  require('./t.topic'),
  require('./t.combo'),
  require('./t.breathe'),
  require('./t.combochart'),
  require('./t.irc'),
]);
