// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IGasback} from "./interfaces/IGasback.sol";

import {TokenURI} from "./helpers/TokenURI.sol";

import {Dungeon} from "./Token/Gametoken.sol";

contract DarkestDungeon is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Pausable, Ownable, ERC721Burnable {
   uint256 private _nextTokenId;

    IGasback public gasback;

    Dungeon public dungeonToken; // Reference to the Dungeon token contract



    mapping(address => PlayRecord[]) public playRecords;

    mapping(string => RoundTime[]) public roundTimes;

    mapping(address => uint256) public tokenIdForPlayer;



    struct RoundTime {

        uint256 startTime;

        uint256 endTime;

        uint256 round;

    }



    struct PlayRecord {

        string id;

        uint256 timestamp;

        uint256 totalRounds;

        uint256 totalScore;

    }



    struct PlayRecordWithTimes {

        string id;

        PlayRecord record;

        RoundTime[] times;

    }



    event PlayRecordAdded(PlayRecord record, RoundTime[] times, address player);

    event TokensMinted(address player, uint256 amount);



    constructor(address initialOwner, address _gasback, address _dungeonToken)

        ERC721("Darkest Dungeon", "DUNGEON")

        Ownable(initialOwner)

    {

        gasback = IGasback(_gasback);

        dungeonToken = Dungeon(_dungeonToken); // Set the Dungeon token contract address

    }



    function addPlayScore(PlayRecord memory record, RoundTime[] memory times, address player) public {

        updateOrMint(player, record.totalScore, record.totalRounds);

        playRecords[player].push(record);



        for (uint256 i = 0; i < times.length; i++) {

            roundTimes[record.id].push(times[i]);

        }



        // Mint Dungeon tokens based on score

        uint256 tokensToMint = calculateTokenReward(record.totalScore);

        dungeonToken.mintToken(player,record.totalScore); // Mint Dungeon tokens

        emit TokensMinted(player, tokensToMint);



        emit PlayRecordAdded(record, times, player);

    }



    function calculateTokenReward(uint256 score) internal pure returns (uint256) {

        return score * 1; // Example: 1 score = 1 DGN tokens

    }

    function getPlayRecords(address player) public view returns (PlayRecordWithTimes[] memory) {
        PlayRecord[] memory records = playRecords[player];

        PlayRecordWithTimes[] memory recordsWithTimes = new PlayRecordWithTimes[](records.length);

        for (uint256 i = 0; i < records.length; i++) {
            recordsWithTimes[i] =
                PlayRecordWithTimes({id: records[i].id, record: records[i], times: roundTimes[records[i].id]});
        }

        return recordsWithTimes;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 score, uint256 level) internal {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        string memory uri = TokenURI.getTokenURI(tokenId, score, level);
        tokenIdForPlayer[to] = tokenId;
        _setTokenURI(tokenId, uri);
    }

    function updateOrMint(address player, uint256 score, uint256 level) internal {
        if (balanceOf(player) == 0) {
            mint(player, score, level);
        } else {
            uint256 tokenId = tokenIdForPlayer[player];
            // Update Token URI
            string memory uri = TokenURI.getTokenURI(tokenId, score, level);
            _setTokenURI(tokenId, uri);
        }
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
