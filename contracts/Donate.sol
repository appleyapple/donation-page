pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";


/// @title Donation page
/// @author Henry Yip (appleyapple)
/// @notice Custom donation contract that allows the owner to accept various amounts of ether, and remembers patrons and their total donations
/// @notice Values are in wei unless otherwise specified

contract Donate is Ownable {

    using SafeMath for uint;

    event NewDonation(address from, uint value);

    uint public donationLimit; // Donation limit in wei
    address payable donationReceiver; // Address to receive donations
    mapping (address => uint) public patronDonations; // Tracks how much each user has donated
    address[] public patrons; // Stores address of patrons

    constructor() {
        donationLimit = 1000000000000000000; // 1 eth
        donationReceiver = payable(0xDd89C395dF8fE36D39Be8E4470EaCd34aAA2F981); // cyno
    }

    /// @notice Retrieves a patron's total donations
    /// @dev Might not need because patronDonations has default public getter
    function getPatronDonations(address _patron) public view returns (uint) {
        return patronDonations[_patron];
    }

    /// @notice Retrieves patron addresses
    function getPatronsArray() public view returns (address[] memory) {
        return patrons;
    }

    /// @notice Retrieves receiver address
    function getReceiverAddress() public view returns (address) {
        return donationReceiver;
    }

    /// @notice Allows a user to donate Ether to the owner of this contract
    /// @dev Checks for valid donation value and updates amountDonated[donator]
    function donate() external payable {
        require(msg.value > 0 && msg.value <= donationLimit, "Donation amount invalid");        
        (bool success, ) = donationReceiver.call{value: msg.value}("");
        require(success, "Donation failed");
        updatePatronDonations(msg.sender, msg.value);
    }

    /// @notice Allows the owner to modify donation limit
    /// @param _newDonationLimit should be a positive integer representing donation limit in wei
    function setDonationLimit(uint _newDonationLimit) public onlyOwner {
        require(_newDonationLimit >= 0);
        donationLimit = _newDonationLimit;
    }

    /// @notice Allows the owner to modify the address that accepts the donations
    /// @dev Does not transfer ownership of the contract
    /// @param _newOwner should be the address to receives donations
    function setDonationReceiver(address _newOwner) public onlyOwner {
        donationReceiver = payable(_newOwner);
    }

    /// @notice Updates donation amount for the user
    function updatePatronDonations(address _patron, uint _donation) private {
        patronDonations[_patron] = patronDonations[_patron].add(_donation);
        patrons.push(_patron);
    }
}