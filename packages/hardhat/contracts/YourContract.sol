//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";
import {Verifier as CouponVerifier} from "./couponVerifier.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract YourContract is Ownable, ERC721 {

	uint256 public counter;
	// eddsa public key
	uint256 public Ax;
	uint256 public Ay;
	mapping (uint256 => bool) public nullifiers; // use bitMap for better gas efficiency

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
		require(!nullifiers[input[0]], "nullifier already used");
		require((new CouponVerifier()).verifyProof(a, b, c, input), "invalid proof");
		_mint(address(uint160(input[3])), counter);
		counter++;
		nullifiers[input[0]] = true;
	}

	function tokenURI(uint256 tokenId) public view override returns (string memory) {
		require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
		return string(abi.encodePacked("ipfs://bafybeiey5p7cj4bla7cp5zp6wzmcac4hdxyfywrbi7f6kktd25lbaftsb4/"));
	}
}
