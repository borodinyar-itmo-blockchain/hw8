const {time, loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const {expect} = require("chai");
const {ethers} = require("hardhat");
const {sha256, sha512} = require('multiformats/hashes/sha2');

const digest = require("multiformats/hashes/digest");

describe("StorageForHashes", function () {

    async function deployStorageForHashesFixture() {
        const [owner, otherAccount] = await ethers.getSigners();

        const StorageForHashes = await ethers.getContractFactory("StorageForHashes");
        const storageForHashes = await StorageForHashes.deploy();

        return {storageForHashes, owner, otherAccount};
    }

    it("Should upload sha256 hash", async function () {
        const {storageForHashes} = await loadFixture(deployStorageForHashesFixture);

        const someArray = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        const sha256Hash = sha256.digest(someArray);
        await storageForHashes.setHash(sha256Hash.bytes);

        const hash = await storageForHashes.getHash();

        const responseHash = digest.decode(ethers.utils.arrayify(hash));
        expect(responseHash.bytes).to.deep.eq(sha256Hash.bytes);
    });

    it("Should upload sha512 hash", async function () {
        const {storageForHashes} = await loadFixture(deployStorageForHashesFixture);

        const someArray = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        const sha512Hash = sha512.digest(someArray);
        await storageForHashes.setHash(sha512Hash.bytes);

        const hash = await storageForHashes.getHash();

        const responseHash = digest.decode(ethers.utils.arrayify(hash));
        expect(responseHash.bytes).to.deep.eq(sha512Hash.bytes);
    });

    it("Should upload sha512 hash with address", async function () {
        const {storageForHashes, owner} = await loadFixture(deployStorageForHashesFixture);

        const someArray = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        const sha512Hash = sha512.digest(someArray);
        await storageForHashes.setHash(sha512Hash.bytes);

        const hash = await storageForHashes.getHashByAddress(owner.address);

        const responseHash = digest.decode(ethers.utils.arrayify(hash));
        expect(responseHash.bytes).to.deep.eq(sha512Hash.bytes);
    });
});


