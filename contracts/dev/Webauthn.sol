// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

import {FCL_Elliptic_ZZ} from "../FCL_elliptic.sol";
import "hardhat/console.sol";

contract Webauthn {
    function ecdsa_verif(bytes32 hash, uint256[2] calldata rs, uint256[2] calldata Q) public returns (bool result) {
        // bytes32 message = sha256(verifyData);
        console.log("hash=", uint256(hash));
        console.log("rs0=", rs[0]);
        uint256 gasleft1 = gasleft();
        result = FCL_Elliptic_ZZ.ecdsa_verify(bytes32(hash), rs, Q);
        uint256 gasleft2 = gasleft();
        uint256 gasused = gasleft1 - gasleft2;
        if (result) {
            console.log("gasused=%s", gasused);
        }
        console.log("result= %s", result);
    }
}
