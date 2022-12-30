pragma solidity ^0.8.0;

contract StorageForHashes {

    mapping (address => bytes) public hashes;

    function setHash(bytes memory _hash) public {
        hashes[msg.sender] = _hash;
    }

    function getHash() public view returns (bytes memory) {
        return hashes[msg.sender];
    }

    function getHashByAddress(address _address) public view returns (bytes memory) {
        return hashes[_address];
    }

}
