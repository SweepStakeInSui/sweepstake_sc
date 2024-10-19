import { HardhatUserConfig, vars } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-ignition-ethers';

const PRIVATE_KEY = vars.get('PRIVATE_KEY');
const API_POLYGONSCAN = vars.get('API_POLYGONSCAN');

const config: HardhatUserConfig = {
  solidity: '0.8.15',
  networks: {
    amoy: {
      url: 'https://frequent-crimson-sound.matic-amoy.quiknode.pro/d1c9b783388cb314524b8993816a42233b9d577d',
      chainId: 80002,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    customChains: [{
      network: 'amoy',
      chainId: 80002,
      urls: {
        apiURL: 'https://api-amoy.polygonscan.com/api',
        browserURL: 'https://amoy.polygonscan.com',
      },
    }],
    apiKey: API_POLYGONSCAN,
  },
  sourcify: {
    enabled: true,
  }
};

export default config;