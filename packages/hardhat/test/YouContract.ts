import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";

describe("YourContract", function () {
  // get a sample Ax,Ay,a,b,c & publicSignals from a proof using the circuit test script
  const Ax = "6206222307877163528701434562321698643060586383502246505953983862309093220743";
  const Ay = "7854363688339436229335755526929688218776181432470416857939802248501764367416";
  const a = [
    "16426418302375628529119834699566744026489678281524903557958227175304601439600",
    "13932310551330927957857497352157282118961904613061180268461684714774183978658",
  ];
  const b = [
    [
      "21675847511463934980435931901320763001244915517166979944585266078415815325705",
      "4828923730428163844701028067827034813559532685823178432909737226362580193714",
    ],
    [
      "7527525864306701483857063026959106646021755332095224682677473542930210366318",
      "13350587351450713670759116439985312781001206711646497740720996704942527085310",
    ],
  ];
  const c = [
    "16045266923166384507982547139031430995209929182257610378174871436248258742980",
    "6345386967103653283911262975049094959016388230623674847456030436248656966473",
  ];
  const publicSignals = [
    "20939944772862212056901513676198071344967939830535768699650473521506229221946",
    "6206222307877163528701434562321698643060586383502246505953983862309093220743",
    "7854363688339436229335755526929688218776181432470416857939802248501764367416",
    "205438856290388851560088700199990273911648759155",
  ];
  let yourContract: YourContract;
  before(async () => {
    const yourContractFactory = await ethers.getContractFactory("YourContract");
    yourContract = (await yourContractFactory.deploy(Ax, Ay)) as YourContract;
    await yourContract.deployed();
  });

  it("should not mint with invalid Proof", async function () {
    // tamper with proof
    const modifiedPublicSignals = [...publicSignals];
    modifiedPublicSignals[3] = "123";
    await expect(yourContract.mint(a, b, c, modifiedPublicSignals)).to.be.revertedWith("invalid proof");
  });

  it("should not mint with invalid signer addr", async function () {
    // tamper with proof
    const modifiedPublicSignals = [...publicSignals];
    modifiedPublicSignals[1] = "123";
    await expect(yourContract.mint(a, b, c, modifiedPublicSignals)).to.be.revertedWith("incorrect signer");
  });

  it("should mint with valid proof", async function () {
    await expect(yourContract.mint(a, b, c, publicSignals)).to.be.not.reverted;
    const receiverAddr = "0x" + BigInt(publicSignals[3]).toString(16);
    expect(await yourContract.balanceOf(receiverAddr)).to.equal(1);
    expect((await yourContract.ownerOf(1)).toLowerCase()).to.equal(receiverAddr.toLowerCase());
  });

  it("should not mint with same nullifier", async function () {
    await expect(yourContract.mint(a, b, c, publicSignals)).to.be.revertedWith("nullifier already used");
  });
});
