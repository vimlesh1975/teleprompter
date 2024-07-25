// lib/udpPort.js
const osc = require('osc');
let udpPort;
const initializeUdpPort = () => {
  if (!udpPort) {
    udpPort = new osc.UDPPort({
      localAddress: '127.0.0.1',
      localPort: 6250,
      metadata: true,
    });
    udpPort.open();
    udpPort.on('ready', () => {
      console.log('UDP port is ready and listening.');
    });

    udpPort.on('error', (err) => {
      console.error('Error with UDP port:', err);
    });
  }
  return udpPort;
};

module.exports = { initializeUdpPort, getUdpPort: () => udpPort };
