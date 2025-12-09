// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// import "forge-std/Test.sol";
import { Test } from "forge-std/Test.sol";
import {GameStorage} from "./GameStorage.sol";

contract GameStorageTest is Test{
    GameStorage game;
    address OWNER = address(0xAAA);
    address ATTACKER = address(0xBEEF);
    //on passe l'owner au constructeur
    //excecuté avant chaque fonction donc le contract est redéployé
    function setUp() public{
        vm.prank(OWNER);
        game = new GameStorage(OWNER);
        // game = new GameStorage(address(this));
    } 

    function test_InitialValueIsZero() public view {
        try game.getTournament(0) {
            revert("Expected getTournament to revert");
        } catch {}
    }

    function test_StoreTournament() public {
        vm.prank(OWNER);
        game.storeTournament(0,1,2,3,4);
        GameStorage.Tournament memory t = game.getTournament(0);
        require(t.player1 == 1, "tournament[1] should be 1");
    }

     function test_StoreTournament_onlyOwnerFails() public {
        // ATTACKER tente d'appeler => doit revert avec message OZ
        vm.prank(ATTACKER);
        // vm.expectRevert();
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                ATTACKER
            )
        );
        game.storeTournament(1, 10, 20, 30, 40);
    }
    function test_StoreTournament_cannotOverwrite() public {
        vm.prank(OWNER);
        game.storeTournament(1, 1, 2, 3, 4);
        vm.prank(OWNER);
        vm.expectRevert("ID already used");
        game.storeTournament(1, 4, 6, 7, 8);
    }

}
