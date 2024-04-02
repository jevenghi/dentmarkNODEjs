const path = require('path');
const fs = require('fs');
const { Client } = require('ssh2-sftp-client');

const transferFiles = async () => {
  console.log(__dirname);
  //   const localDirectory = path.join(__dirname, 'public', 'pics', 'tasks');
  //   const remoteDirectory = '/home/tasks';

  //   const config = {
  //     host: process.env.VPS_HOST,
  //     port: process.env.VPS_PORT,
  //     username: process.env.VPS_USERNAME,
  //     password: process.env.VPS_PASSWORD,
  //   };

  //   const client = new Client();

  //   try {
  //     await client.connect(config);
  //     await client.uploadDir(localDirectory, remoteDirectory);
  //     console.log('Files transferred successfully');
  //   } catch (err) {
  //     console.error('Error:', err.message);
  //   } finally {
  //     client.end();
  //   }
};

module.exports = transferFiles;
