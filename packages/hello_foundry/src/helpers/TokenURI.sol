// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

library TokenURI {
    using Base64 for bytes;
    using Strings for uint256;

    function getTokenURI(uint256 tokenId, uint256 maxScore, uint256 maxLevel) public pure returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            "{",
            '"name": "Dungeon Crawler #',
            tokenId.toString(),
            '",',
            '"description": "Dungeon Crawler is a unique Character NFT representing a character from the Darkest Dungeon game.",',
            '"image": "https://darkest-dungeons.vercel.app/nft.png",',
            '"attributes": [',
            '{"trait_type": "Max Score", "value": ',
            maxScore.toString(),
            "},",
            '{"trait_type": "Max Level", "value": ',
            maxLevel.toString(),
            "}",
            "]",
            "}"
        );
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(dataURI)));
    }
}
