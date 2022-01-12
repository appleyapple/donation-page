pragma solidity >=0.5.0;

contract Donate {

    event NewDonation(address from, uint beans);

    uint totalBeans = 0;
    mapping (address => uint) public beansDonated;

    
}