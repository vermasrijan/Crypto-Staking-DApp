// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    string private _tokenURI;

    event TokenURISet(string tokenURI);

    constructor(
        uint256 initialSupply,
        address owner,
        string memory tokenName,
        string memory tokenSymbol,
        string memory tokenuri
    ) ERC20(tokenName, tokenSymbol) Ownable(owner) {
        _mint(owner, initialSupply);
        _tokenURI = tokenuri;
        emit TokenURISet(tokenuri);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function setTokenURI(string memory tokenURI_) external onlyOwner {
        _tokenURI = tokenURI_;
        emit TokenURISet(tokenURI_);
    }

    function tokenURI() external view returns (string memory) {
        return _tokenURI;
    }
}
