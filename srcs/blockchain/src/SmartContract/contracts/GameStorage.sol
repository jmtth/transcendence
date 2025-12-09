// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract GameStorage is Ownable {
    constructor(address initialOwner) Ownable(initialOwner) {}

    struct Tournament {
        uint8 player1;
        uint8 player2;
        uint8 player3;
        uint8 player4;
        uint32 timestamp;
    }

    mapping(uint8 => Tournament) public tournaments;

    event TournamentStored(uint8 match_id, uint8 player1, uint8 player2, uint8 player3, uint8 player4);

    function storeTournament(uint8 id, uint8 p1, uint8 p2, uint8 p3, uint8 p4) external onlyOwner {
        require(tournaments[id].timestamp == 0, "ID already used");
        tournaments[id] = Tournament(p1, p2, p3, p4, uint32(block.timestamp));
        emit TournamentStored(id, p1, p2, p3, p4);
    }

    function getTournament(uint8 id) external view returns (Tournament memory){
        require(tournaments[id].timestamp != 0, "Tournament does not exist");
        return tournaments[id];
    }
}
