// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

/// @notice UTC calendar helpers used to enforce a series window of exactly one civil month.
library DateTimeLib {
    function isUtcMonthWindow(uint64 start, uint64 end) internal pure returns (bool) {
        if (uint256(start) % 1 days != 0 || uint256(end) % 1 days != 0) return false;
        (uint256 year, uint256 month, uint256 day) = _daysToDate(uint256(start) / 1 days);
        if (day != 1) return false;
        uint256 nextYear = month == 12 ? year + 1 : year;
        uint256 nextMonth = month == 12 ? 1 : month + 1;
        return uint256(end) == _daysFromDate(nextYear, nextMonth, 1) * 1 days;
    }

    function _daysFromDate(uint256 year, uint256 month, uint256 day) private pure returns (uint256) {
        int256 y = int256(year);
        int256 m = int256(month);
        int256 d = int256(day);
        int256 days_ = d - 32075 + (1461 * (y + 4800 + (m - 14) / 12)) / 4
            + (367 * (m - 2 - ((m - 14) / 12) * 12)) / 12 - (3 * ((y + 4900 + (m - 14) / 12) / 100)) / 4 - 2440588;
        return uint256(days_);
    }

    function _daysToDate(uint256 days_) private pure returns (uint256 year, uint256 month, uint256 day) {
        int256 L = int256(days_) + 68569 + 2440588;
        int256 N = (4 * L) / 146097;
        L = L - (146097 * N + 3) / 4;
        int256 y = (4000 * (L + 1)) / 1461001;
        L = L - (1461 * y) / 4 + 31;
        int256 m = (80 * L) / 2447;
        int256 d = L - (2447 * m) / 80;
        L = m / 11;
        m = m + 2 - 12 * L;
        y = 100 * (N - 49) + y + L;
        return (uint256(y), uint256(m), uint256(d));
    }
}
