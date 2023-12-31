import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Header } from "~~/components/Header";
import { MetaHeader } from "~~/components/MetaHeader";
import { ShowNFT } from "~~/components/ShowNFT";
import { Card3d } from "~~/components/card3d/card3d";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { calcNullifier, fromHexString, generateProof, verifySign } from "~~/utils/helpers";

const MintPage: NextPage = () => {
  const [receiverAddr, setReceiverAddr] = useState("");
  const [isLinkValid, setIsLinkValid] = useState(undefined as undefined | boolean);
  const [generatingProof, setGeneratingProof] = useState(false);
  const [proof, setProof] = useState(undefined as undefined | { a: any; b: any; c: any; publicSignals: any });
  const [mintConfirmation, setMintConfirmation] = useState(false);
  const [nullifier, setNullifier] = useState(undefined as undefined | bigint);
  // TODO check nullifier to see already minted
  const { data: Ax } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "Ax",
  });
  const { data: Ay } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "Ay",
  });
  const { data: fetchedTokenId } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "nullifiers",
    args: [nullifier],
  });
  const { writeAsync: mintAsync, isLoading: isMinting } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "mint",
    args: [proof?.a, proof?.b, proof?.c, proof?.publicSignals],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
      setMintConfirmation(true);
    },
  });

  useEffect(() => {
    if (Ax && Ay) {
      checkLink();
    }
  }, [Ax, Ay]);

  useEffect(() => {
    if (!generatingProof && receiverAddr && receiverAddr.length == 42 && receiverAddr.startsWith("0x")) {
      setGeneratingProof(true);
      generateAndSetProof().finally(() => {
        setGeneratingProof(false);
      });
    }
  }, [receiverAddr]);

  function checkLink() {
    try {
      const url = new URL(window.location.href);
      const data = url.searchParams.get("data");
      if (data == null || Ax == undefined || Ay == undefined) {
        setIsLinkValid(false);
        return;
      }
      const { code, R8: R8hex, S: Shex } = JSON.parse(data);
      const R8 = [fromHexString(R8hex[0]), fromHexString(R8hex[1])];
      verifySign(code, R8, BigInt("0x" + Shex), Ax, Ay).then(res => {
        console.log("checkLink: verifySign: ", res);
        setIsLinkValid(res);
        // check if already minted
        if (res) {
          calcNullifier(code).then(nullifier => {
            console.log("nullifier", nullifier);
            setNullifier(nullifier);
          });
        }
      });
    } catch (e) {
      console.error("checkLink: ", e);
      setIsLinkValid(false);
    }
  }

  async function generateAndSetProof() {
    console.log("generatingProof");
    const t = Date.now();
    const url = new URL(window.location.href);
    const data = url.searchParams.get("data");
    if (data == null || Ax == undefined || Ay == undefined) {
      setIsLinkValid(false);
      return;
    }
    const { code, R8: R8hex, S: Shex } = JSON.parse(data);
    const R8 = [fromHexString(R8hex[0]), fromHexString(R8hex[1])];
    const proof = await generateProof(receiverAddr, code, R8, BigInt("0x" + Shex), Ax, Ay);
    console.log("generated  Proof in", (Date.now() - t) / 1000);
    setProof(proof);
  }

  function mintNFT() {
    console.log("mint");
    mintAsync();
  }

  return (
    <>
      <MetaHeader title="Zk-Mint" description="mint NFT">
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <Header />
      <div className="flex w-full flex-grow justify-center">
        <div className="flex flex-col items-center justify-start w-1/3 min-w-[400px] mt-36">
          {isLinkValid == undefined && (
            <div className="m-5 flex">
              <span className="text-lg mr-3">Verifying validity of link </span>
              <span className="loading loading-dots loading-sm self-end"></span>
            </div>
          )}
          {isLinkValid == false && (
            <div className="m-5">
              <span className="text-red-500 text-3xl">Invalid link !!!</span>
            </div>
          )}
          {isLinkValid && (fetchedTokenId == undefined || fetchedTokenId == 0n) && (
            <>
              <div className="text-xl mx-10 text-center">Enter your address where you would like to receive it</div>
              <div className="m-5">
                <AddressInput placeholder="Address or ENS" value={receiverAddr} onChange={setReceiverAddr} />
              </div>
            </>
          )}
          {fetchedTokenId !== undefined && fetchedTokenId > 0n && receiverAddr == "" && (
            <div>
              <div className="text-lg mb-5">Already Minted</div>
              <Card3d
                content={
                  <div className="h-full flex flex-col items-center justify-between">
                    <ShowNFT tokenId={fetchedTokenId} />
                  </div>
                }
              />
            </div>
          )}
          {mintConfirmation && (
            <div>
              <div className="text-lg mb-5">Minted !!!</div>
              <Card3d
                content={
                  <div className="h-full flex flex-col items-center justify-between">
                    <ShowNFT tokenId={fetchedTokenId} />
                  </div>
                }
              />
            </div>
          )}
          {!mintConfirmation && receiverAddr.length == 42 && receiverAddr.startsWith("0x") && (
            <div className="mt-5">
              <Card3d
                content={
                  <div className="h-full flex flex-col items-center justify-between">
                    <div className="text-4xl">
                      <p>Zk-Mint</p>
                    </div>
                    {isMinting && <span className="loading loading-dots w-36" />}
                    {!isMinting && !mintConfirmation && (
                      <>
                        <p className="text-9xl">?</p>
                        <div className="relative group">
                          <button
                            className="bg-yellow-500 mb-3 relative py-1 px-4 border-2 border-yellow-950 text-black font-bold strong rounded-lg text-lg active:brightness-90 active:scale-90 z-50"
                            onClick={mintNFT}
                          >
                            {generatingProof || proof == undefined ? (
                              <span className="loading loading-dots loading-md" />
                            ) : (
                              "MINT"
                            )}
                          </button>
                          {proof && (
                            <div className="absolute rounded-lg top-0 left-0 w-full h-full bg-[#ffffff70] group-hover:bg-transparent animate-ping z-40" />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                }
              />
            </div>
          )}
          {generatingProof && <div>Wait for zk-Proof generation to complete</div>}
        </div>
      </div>
    </>
  );
};

export default MintPage;
