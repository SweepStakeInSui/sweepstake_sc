import hre from 'hardhat';
import { expect } from 'chai';

describe('SweepstakeUma', function() {
  let sweepstakeUma: any;
  beforeEach(async function() {
    sweepstakeUma = await hre.ethers.deployContract('SweepstakeUma');
  });

  it('Check deployed', async function() {
    expect(await sweepstakeUma.liveness()).to.equal(30);
  });
});