//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";
import {Verifier as CouponVerifier} from "./couponVerifier.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract YourContract is Ownable, ERC721 {

	uint256 public counter; // tokenId > 0
	// eddsa public key
	uint256 public Ax;
	uint256 public Ay;
	mapping (uint256 => uint256) public nullifiers; // nullifier to tokenId 

	constructor(uint256 _Ax, uint256 _Ay) ERC721("ZK_Mint", "ZKM") {
		Ax = _Ax;
		Ay = _Ay;
	}

	function mint(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[4] calldata input // [nullifier, Ax, Ay, receiver]
    ) external {
		require(input[1] == Ax, "incorrect signer");
		require(input[2] == Ay, "incorrect signer");
		require(nullifiers[input[0]] == 0, "nullifier already used");
		require((new CouponVerifier()).verifyProof(a, b, c, input), "invalid proof");
		unchecked {
			counter++;
		}
		_mint(address(uint160(input[3])), counter);
		nullifiers[input[0]] = counter;
	}

	function tokenURI(uint256 tokenId) public view override returns (string memory) {
		require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
		return imageURI2tokenURI(getImageURI(tokenId));
	}

	function getImageURI(uint256 tokenId) public pure returns (string memory) {
		string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(bytes(abi.encodePacked(
				'<svg width="300" height="400" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="400" fill="url(#bg)"/><text x="50%" y="50%" fill="url(#bg)" filter="url(#f1)" dominant-baseline="middle" text-anchor="middle" font-size="100" lengthAdjust="spacing">#',
				Strings.toString(tokenId),
				'</text><defs><linearGradient id="bg" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4dafff"/><stop offset="0.45" stop-color="#00ebcf"/><stop offset="1" stop-color="#fdf30a"/></linearGradient><linearGradient id="v1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="limegreen"/><stop offset="1" stop-color="black"/></linearGradient><filter id="f1" color-interpolation-filters="sRGB"><feColorMatrix in="SourceGraphic" type="hueRotate" values="200" color-interpolation-filters="sRGB"/></filter></defs></svg>'
			)));
        return string(abi.encodePacked(baseURL,svgBase64Encoded));
	}

	function imageURI2tokenURI(string memory imageURI) public pure returns (string memory) {
        return string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"ZK_Mint NFT", "description":"A nft minted using ZK_Mint", "attributes":"", "image":"',imageURI,'"}'
                            )
                        )
                    )
                )
            );
    }
}
