// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import {IOptimisticOracleV2} from "./interfaces/IOptimisticOracleV2.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Auth} from "./mixins/Auth.sol";

contract SweepstakeUma is Auth {
    // OO on Polygon Amoy
    IOptimisticOracleV2 oo = IOptimisticOracleV2(0x38fAc33bD20D4c4Cce085C0f347153C06CbA2968);

    // For now, sweepstake only supports YES/NO
    bytes32 identifier = bytes32("YES_OR_NO_QUERY");

    // Post the question in ancillary data. Note that this is a simplified form of ancillry data to work as an example. A real
    // world prodition market would use something slightly more complex and would need to conform to a more robust structure.
    // bytes ancillaryData =
    //     bytes("Q:TEST QUESTION FROM 18DRAPLY? A:1 for yes. 0 for no.");

    event QuestionInitialized(bytes32 indexed questionID, bytes ancillaryData);

    struct QuestionData {
        /// @notice creator address on SUI
        string creator;
        /// @notice marketID on sweepstake
        string marketID;
        /// @notice Data used to reslove a condition
        bytes ancillaryData;
        /// @notice Solved
        bool resolved;
    }

    uint256 requestTime = 0;

    mapping(bytes32 => QuestionData) public questions;

    uint256 public liveness;

    constructor() {
        liveness = 30;
    }


    // Set the liveness of the request. This is the time in seconds that the request will be live for.
    /// @param _liveness: liveness of the request
    function setLiveness(uint256 _liveness) public onlyAdmin {
        liveness = _liveness;
    }

    // Submit a data request to the Optimistic oracle.
    /// @param creator: address of creator in SUI
    /// @param marketID: marketID in sweepstake
    /// @param ancillaryString: the description of market
    /// ex: "Q:Did the temperature on the 25th of July 2022 in Manhattan NY exceed 35c? A:1 for yes. 0 for no."
    function requestData(
        string calldata creator,
        string calldata marketID,
        string memory ancillaryString
    ) external returns (bytes32 questionID) {
        requestTime = block.timestamp; // Set the request time to the current block time.
        IERC20 bondCurrency = IERC20(
            0x9b4A302A548c7e313c2b74C461db7b84d3074A84
        );
        uint256 reward = 0; // Set the reward to 0 (so we dont have to fund it from this contract).
        bytes memory ancillaryData = bytes(ancillaryString);
        questionID = keccak256(ancillaryData);
        _saveQuestion(questionID, creator, marketID, ancillaryData, false);

        //The liveness to 30 so it will settle quickly.
        oo.requestPrice(
            identifier,
            requestTime,
            ancillaryData,
            bondCurrency,
            reward
        );
        oo.setCustomLiveness(identifier, requestTime, ancillaryData, liveness);

        emit QuestionInitialized(questionID, ancillaryData);
    }

    // Settle the request once it's gone through the liveness. This acts the finalize the voted on price.
    /// @param questionID: questionID of a market
    function settleRequest(bytes32 questionID) public {
        QuestionData memory quest = questions[questionID];
        oo.settle(address(this), identifier, requestTime, quest.ancillaryData);
        _saveQuestion(
            questionID,
            quest.creator,
            quest.marketID,
            quest.ancillaryData,
            true
        );
    }

    // Fetch the resolved price from the Optimistic Oracle that was settled.
    /// @param questionID: questionID of a market
    function getSettledData(bytes32 questionID) public view returns (int256) {
        QuestionData memory quest = questions[questionID];
        return
            oo
            .getRequest(
                address(this),
                identifier,
                requestTime,
                quest.ancillaryData
            )
            .resolvedPrice;
    }

    function _saveQuestion(
        bytes32 questionID,
        string memory creator,
        string memory marketID,
        bytes memory ancillaryData,
        bool resolved
    ) internal {
        questions[questionID] = QuestionData({
            creator: creator,
            marketID: marketID,
            ancillaryData: ancillaryData,
            resolved: resolved
        });
    }
}
