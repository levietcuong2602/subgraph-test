const GravatarRegistry = artifacts.require("./Gravity.sol");

module.exports = async function(deployer) {
  const registry = await GravatarRegistry.deployed();
  console.log("Account address:", registry.address);
  let accounts = await web3.eth.getAccounts();
  console.log(registry);
  await registry.createGravatar(
    "Kahnhnt",
    "https://thegraph.com/img/team/team_04.png",
    {
      from: accounts[6],
    }
  );
  // await registry.createGravatar(
  //   "ManhVd",
  //   "https://thegraph.com/img/team/bw_Lucas.jpg",
  //   {
  //     from: accounts[4],
  //   }
  // );
};
