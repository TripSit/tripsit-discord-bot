const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const PREFIX = require('path').parse(__filename).name;

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const ts_icon_url = process.env.ts_icon_url;
const disclaimer = process.env.disclaimer;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Shows information about this bot!'),
    async execute(interaction, logger) {
        const username = `${interaction.member.user.username}#${interaction.member.user.discriminator}`;
        const channel = interaction.channel.name;
        const guild = interaction.guild.name;
        logger.info(
            `[${PREFIX}] Initialized by ${username} in ${channel} on ${guild}!`,
        );
        const embed = new MessageEmbed()
            .setAuthor({
                name: 'TripSit.Me',
                iconURL: ts_icon_url,
                url: 'http://www.tripsit.me',
            })
            .setColor('DARK_BLUE')
            .setTitle('About TripSit')
            .setURL('https://tripsit.me/about/')
            .setDescription(
                'This app is created by TripSit, an organisation which helps to provide factual information about \
            drugs and how to reduce the harms involved in using them.',
            )
            .addFields(
                {
                    name: 'disclaimer',
                    value: 'Although we have a team dedicated to keeping the information on this app up to date, it is not \
                always possible to provide entirely accurate information on the safety level of drugs. The \
                information here should be used as guidelines only, and it is important to do your own research from \
                multiple sources before ingesting a substance. We also strongly advise using a testing kit and scales \
                to ensure you are taking the correct dosage. These can both be bought online for reasonable prices.',
                },
                {
                    name: 'Support TripSit',
                    value: 'TripSit is a completely free service run by volunteers. If you wish to help out, feel free to \
                join the IRC or the Discord, follow and share our content on social media, or make a donation to keep \
                the servers running.',
                },
                {
                    name: 'Feedback',
                    value: 'We would love to hear your feedback on this bot, please join discord.gg / TripSit \
                and talk with Moonbear!',
                },
                {
                    name: 'Add me to your server!',
                    value: 'If you want to add this bot to your server, click the link here: <TBD>',
                },
            )
            .setFooter({ text: disclaimer, iconURL: ts_icon_url });
        return interaction.reply({ embeds: [embed] });
    },
};
