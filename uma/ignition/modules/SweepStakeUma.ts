import { buildModule} from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SweepstakeUma", (m) => {
  const sweepstakeUma = m.contract("SweepstakeUma");
  return { sweepstakeUma }
});