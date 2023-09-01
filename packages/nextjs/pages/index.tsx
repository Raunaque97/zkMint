import { useState } from "react";
import type { NextPage } from "next";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";

const Home: NextPage = () => {
  const [couponUrl, setCouponUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  function generateUrl() {
    setIsGenerating(true);
    setTimeout(() => {
      const coupon = "https://zk-mint.vercel.app/coupon/" + Math.floor(Math.random() * 1000000);
      setCouponUrl(coupon.toString());
    }, 3000);
  }

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 w-full">
          <h1 className="text-center mb-8">
            <span className="block text-8xl mb-2">Zk-Mint</span>
            <span className="block text-l">Unlock new possibilities through shareable Links</span>
          </h1>
        </div>

        <div className="flex flex-nowrap overflow-x-auto snap-mandatory gap-5 px-5 pb-8 md:overflow-x-hidden w-full md:justify-evenly">
          <div className="card bg-secondary text-primary-content w-11/12 flex-shrink-0 snap-always shadow-xl md:w-1/4">
            <div className="card-body py-0">
              <p>This is revolutionary, I can send NFTs to my target audience with just links !!!</p>
            </div>
          </div>
          <div className="card bg-secondary text-primary-content w-11/12 flex-shrink-0 snap-always shadow-xl md:w-1/4">
            <div className="card-body py-0">
              <p>
                The hassle of collecting and managing addresses for whitelist sales was a real headache.
                <br />
                Thanks to Zk-Mint, I can effortlessly airdrop NFTs to specific individuals without the need for any
                address collection. It is a game-changer !
              </p>
            </div>
          </div>
          <div className="card bg-secondary text-primary-content w-11/12 flex-shrink-0 snap-always shadow-xl md:w-1/4">
            <div className="card-body py-0">
              <p>
                The flexibility to use any traditional channels for promotion and allow users to mint with their
                preferred addresses opens up endless possibilities.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-base-300 w-full md:flex md:mt-10 md:px-5">
          <div className="m-8 md:w-1/2">
            <h1 className="text-2xl font-bold mb-8"> How it works ? </h1>
            <div className="flex my-3">
              <a className="text-2xl mx-2"> 1 </a>A issuer/project owner creates the links to be shared. Each links
              contain a secret coupon code encoded in it.
            </div>
            <div className="flex my-3">
              <a className="text-2xl mx-2"> 2 </a>The link directs users to a minting page where they can specify their
              preferred address to receive the NFT. Each link/coupon can be used only once.
            </div>
            <div className="flex my-3">
              <a className="text-2xl mx-2"> 3 </a>The coupon code in not published on chain (to prevent frontrunning)
              instead a zk-proof of &quot;a valid coupon code&quot; is used{"  "}
            </div>
          </div>
          <div className="divider divider-horizontal"></div>
          <div className="m-8 md:w-1/2">
            <h1 className="text-2xl font-bold mb-8"> Demo </h1>
            <div className="flex flex-wrap my-3 justify-end">
              <div className="bg-secondary border border-gray-500 flex-grow h-7 my-3 min-w-[200px] md:h-12 md:mr-4">
                {couponUrl}
              </div>
              <button className="btn my-3 w-[25ch]" disabled={isGenerating} onClick={generateUrl}>
                {couponUrl.length > 0 ? (
                  <>
                    <Cog6ToothIcon className="w-6 h-6" />
                    Generated
                  </>
                ) : isGenerating ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Generating . . .
                  </>
                ) : (
                  <>
                    <Cog6ToothIcon className="w-6 h-6" /> Generate Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
