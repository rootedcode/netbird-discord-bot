require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Replies with an invitation link for Netbird VPN.')
        .addStringOption(option =>
            option
                .setName('email')
                .setDescription('Enter your email address.')
                .setRequired(true)
                .setMaxLength(50)
        ),
    async execute(interaction) {
        await interaction.reply({ content: 'Creating invite...', ephemeral: true});

        try {
            const email = interaction.options.getString('email');
            const username = interaction.user.username;
            
            if (!username || username == null) {
                throw new Error('Invalid Discord username.');
            }


            // Set your desired NetBird Group ID below in 'auto_groups'.
            
            const response = await fetch(`${process.env.NETBIRD_URL}/api/users/invites`, {
                method: 'POST', 
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${process.env.NETBIRD_API_TOKEN}`
                },
                body: JSON.stringify({
                    email,
                    name: username,
                    role: 'user',
                    auto_groups: ['d9uc550rsb0s7383870g'],
                    expires_in: 259200
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('NetBird API error: ', data);
                throw new Error(`Netbird API returned ${response.status}`);
            }

            if (!data.invite_token) {
                console.error('Unexpected NetBird response: ', data);
                throw new Error('NetBird did not return an invite token.');
            }

            // Set your url below

            const inviteUrl = `${process.env.NETBIRD_URL}/invite?token=${encodeURIComponent(data.invite_token)}`;
            await interaction.editReply({
                content: `Your NetBird invite is ready:\n[Accept Invite](${inviteUrl})`, ephemeral: true
            });

        } catch (error) {
            console.error('Invite creation failed: ', error)
            await interaction.editReply({
                content: 'Failed to create the NetBird invite.', ephemeral: true
            });
        }
    }
};