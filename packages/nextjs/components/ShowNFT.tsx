import { useEffect, useState } from "react";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

export const ShowNFT = ({ tokenId }: { tokenId: undefined | bigint }) => {
  const [data, setData] = useState(undefined as undefined | any);
  const { data: tokenURI } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "tokenURI",
    args: [tokenId],
  });
  useEffect(() => {
    // decode Base64 string to get nft metadata
    if (tokenURI) {
      const metaData = JSON.parse(atob(tokenURI.split(",")[1]));
      setData(metaData);
    }
  }, [tokenURI]);
  return (
    <div>
      {data && (
        <>
          <img src={data.image} />
        </>
      )}
      {tokenId == undefined && (
        <div className="w-full h-full flex flex-col items-center justify-between">
          <span className="loading loading-spinner w-36" />
        </div>
      )}
    </div>
  );
};
