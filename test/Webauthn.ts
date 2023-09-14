import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import crypto from "crypto";
import elliptic from "elliptic";
import sha3 from "js-sha3";

function derToRS(der: Buffer) {
    var offset = 3;
    var dataOffset;

    if (der[offset] == 0x21) {
        dataOffset = offset + 2;
    }
    else {
        dataOffset = offset + 1;
    }
    const r = der.slice(dataOffset, dataOffset + 32);
    offset = offset + der[offset] + 1 + 1
    if (der[offset] == 0x21) {
        dataOffset = offset + 2;
    }
    else {
        dataOffset = offset + 1;
    }
    const s = der.slice(dataOffset, dataOffset + 32);
    return [r, s]
}


describe("Webauthn", function () {

    it("Check message", async function () {


        console.log("\n***************************************** \n Validating ECDSA Core verification \n*****************************************");
        /* I Validation of Core ecdsa verification (no webauthn encoding) without precomputations */

        const Ecdsa_core = await ethers.getContractFactory("Webauthn");


        // let ec = new elliptic.ec('p256');
        let ec = new elliptic.ec('p256');
        // let keyPair = ec.genKeyPair(); // Generate random keys
        let keyPair = ec.keyFromPrivate("97ddae0f3a25b92268175400149d65d6887b9cefaf28ea2c078e05cdc15a3c01");

        // let keyPair = ec.keyFromPrivate(
        //     ethers.BigNumber.from(ethers.utils.randomBytes(32)).toHexString());


        //console.log("random sk=",ethers.BigNumber.from(ethers.utils.randomBytes(32)).toHexString());

        let privKey = keyPair.getPrivate("hex");
        let pubKey = keyPair.getPublic();
        console.log(`Private key: ${privKey}`);
        console.log("Public key :", pubKey.encode("hex", true).substring(2));
        console.log("Public key (compressed):",
            pubKey.encodeCompressed("hex"));

        const publicKey_ecdsa = Buffer.from(pubKey.encode("hex", false).substring(2), "hex");


        console.log("publicKey_ecdsa:", publicKey_ecdsa);

        let msg = 'Message for signing';
        let msgHash = sha3.keccak256(msg);
        let hash = Buffer.from(msgHash, "hex");

        let signature_js = ec.sign(msgHash, keyPair, "hex", { canonical: true });

        console.log(`Msg: ${msg}`);
        console.log(`Msg hash: ${msgHash}`);

        console.log("hash:", hash);


        console.log("Signature:", signature_js.toDER('hex'));

        console.log("Signature:", Buffer.from(signature_js.toDER('hex'), "hex"));

        const ecdsaParsed = derToRS(Buffer.from(signature_js.toDER('hex'), "hex"));

        console.log("Signature parsed:", ecdsaParsed);



        const ecdsa = await Ecdsa_core.deploy();


        const result_ecdsa = await ecdsa.ecdsa_verif(hash,
            [
                "0x" + ecdsaParsed[0].toString('hex'),
                "0x" + ecdsaParsed[1].toString('hex')
            ],
            [
                "0x" + publicKey_ecdsa.slice(0, 32).toString('hex'),
                "0x" + publicKey_ecdsa.slice(32).toString('hex')
            ]
        );

        await result_ecdsa.wait();
    })
});
