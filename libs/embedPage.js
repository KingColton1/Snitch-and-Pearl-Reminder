const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = async (interaction, pages, ephemeral = false, time = 30 * 1000) => {
    try {
        if (!interaction || !pages || !pages > 0) throw new Error('[EmbedPages] Invalid args');

        await interaction.deferReply({ ephemeral });

        if (pages.length === 1) {
            return await interaction.editReply({ embeds: pages, components: [], ephemeral, fetchReply: true });
        }

        var index = 0;

        const firstPage = new ButtonBuilder()
            .setCustomId('firstpage')
            .setEmoji('⏪')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)

        const prevPage = new ButtonBuilder()
            .setCustomId('prevpage')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
        
        const pageCount = new ButtonBuilder()
            .setCustomId('pagecount')
            .setLabel(`${index + 1}/${pages.length}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)

        const nextPage = new ButtonBuilder()
            .setCustomId('nextpage')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Primary)

        const lastPage = new ButtonBuilder()
            .setCustomId('lastpage')
            .setEmoji('⏩')
            .setStyle(ButtonStyle.Primary)

        const buttons = new ActionRowBuilder().addComponents([firstPage, prevPage, pageCount, nextPage, lastPage]);
        const msg = await interaction.editReply({ embeds: [pages[index]], components: [buttons], ephemeral, fetchReply: true });

        const collector = await msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time
        });

        collector.on('collect', async i => {
            // Just in case if someone try to use your embed pages, it will stop others from using it and allow only you can use it.
            if (i.user.id !== interaction.user.id) return await i.reply({ content: `Only **${interaction.user.username}** can use these buttons!`, ephemeral: true });

            await i.deferUpdate();

            if (i.customId === 'firstpage') {
                index = 0;
                pageCount.setLabel(`${index + 1}/${pages.length}`);
            }

            if (i.customId === 'prevpage') {
                if (index > 0) index--;
                pageCount.setLabel(`${index + 1}/${pages.length}`);
            }
            else if (i.customId === 'nextpage') {
                if (index < pages.length - 1) {
                    index++;
                    pageCount.setLabel(`${index + 1}/${pages.length}`);
                }
            }
            else if (i.customId === 'lastpage') {
                index = pages.length - 1;
                pageCount.setLabel(`${index + 1}/${pages.length}`);
            }

            // Check if a page is at either end sides, otherwise keep buttons enabled.
            firstPage.setDisabled(index === 0);
            prevPage.setDisabled(index === 0);
            nextPage.setDisabled(index === pages.length - 1);
            lastPage.setDisabled(index === pages.length - 1);

            await msg.edit({ embeds: [pages[index]], components: [buttons] }).catch(err => {});
            collector.resetTimer();
        });

        collector.on('end', async () => {
            await msg.edit({ embeds: [pages[index]], components: [] }).catch(err => {});
        });

        return msg;
    }
    catch (err) {
        console.error(`[EmbedPages Error] - ${err}`);
    }
}