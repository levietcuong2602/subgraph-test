const GravatarRegistry = artifacts.require("./Gravity.sol");

module.exports = async function(deployer) {
  await deployer.deploy(GravatarRegistry);
};
