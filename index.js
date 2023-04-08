// index.js
import dotenv from 'dotenv';
dotenv.config();
import Discord from 'discord.js';
const { Client, GatewayIntentBits } = Discord;
import fetch from 'node-fetch';

const client = new Client({
  intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.MessageContent,
  ],
});


const BOT_TOKEN = process.env.BOT_TOKEN;
client.login(BOT_TOKEN);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}! User ID: ${client.user.id}`);
});

client.on('messageCreate', async (message) => {
    console.log(`Received message: ${message.content}`);
    if (message.content.trim().startsWith('!findVariants')) {
        console.log('Processing !findVariants command');
    const degenID = message.content.split(' ')[1];
    const contractAddress = '0x19b86299c21505cdf59cE63740B240A9C822b5E4';
    const detonatedToonzCollectionSlug = 'Detonated Toonz by Degen Toonz';
    

    console.log('Getting NFT data for Degen ID:', degenID);
    const degenData = await getNFTData(contractAddress, degenID);

    if (degenData) {
        console.log('Degen data found');
      const attributesToMatch = degenData.attributes.map((attr) => ({
        trait_type: attr.trait_type,
        value: attr.value,
      }));
      
      console.log('Searching for matching Detonated and Radioactive Toonz');
      const matchingDetonated = await searchNFTs(detonatedToonzCollectionSlug, attributesToMatch, 'D');
      const matchingRadioactive = await searchNFTs(detonatedToonzCollectionSlug, attributesToMatch, 'R');

      let responseMessage = `Original Degen Toonz ID: ${degenID}\n`;

      if (matchingDetonated) {
        responseMessage += `Matching Detonated Toonz ID: ${matchingDetonated.token_id}\n`;
      } else {
        responseMessage += 'No matching Detonated Toonz found.\n';
      }

      if (matchingRadioactive) {
        responseMessage += `Matching Radioactive Toonz ID: ${matchingRadioactive.token_id}`;
      } else {
        responseMessage += 'No matching Radioactive Toonz found.';
      }
      
      console.log('Sending response message:', responseMessage);
      message.channel.send(responseMessage);
    } else {
      message.channel.send('Invalid Degen Toonz ID.');
    }
  } else {
    console.log('Message did not start with !findVariants');
  }
});

async function getNFTData(contractAddress, tokenID) {
  const response = await fetch(`https://api.opensea.io/api/v1/asset/${contractAddress}/${tokenID}`);
  if (response.ok) {
    const data = await response.json();
    console.log('NFT data retrieved:', data);
    return data;
  } else {
    console.log('Failed to retrieve NFT data. Response status:', response.status);
    return null;
  }
}

async function searchNFTs(collectionSlug, attributes, variant) {
  const query = attributes
    .map((attr) => `${encodeURIComponent(attr.trait_type)}:${encodeURIComponent(`${variant}-${attr.value}`)}`)
    .join(' ');

    const response = await fetch(
      `https://api.opensea.io/api/v1/assets?collection=${collectionSlug}&search=${encodeURIComponent(query)}&order_by=token_id&order_direction=asc&limit=1`,
    );
  
    if (response.ok) {
      const data = await response.json();
      if (data.assets.length > 0) {
        return data.assets[0];
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  
