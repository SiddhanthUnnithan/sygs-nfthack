Technologies used: Solidity, Ethers, Node, Express, Hardhat, Polygon Mumabi (Testing), Rinkeby (Testing), React

- Express app to serve API routes; API routes are called directly from the client
- Small business input handling
    - Validate inputs (basic type checking)
    - Define a generic contract template representative of the funding (sygs-nfthack/scripts/templateManager.js)
    - Deploy the contract with the service credentials (not on behalf of the business)
    - Contract written such that mint method can only be called by the contract deployer
    - Return contract address and token symbol (dynamically generated based on inputs)
- Contribution
    - Intended to use Circle payments API to manage CC input and transfer USDC directly to registered account
    - (Option 1) Small business would onboard with the platform and provide Circle credentials
    - (Option 2) Platform provides Circle credentials and routing to the small business happens afterwards (not at the time of the CC input)
    - Mint a token (without a fee) on-the-fly and transfer ownership of that token to the "investor"
    - Validate token ownership by checking txn on etherscan (with Rinkeby deploy) and opensea testnet
- Redemption
    - Cross reference currently connected wallet address with the token address
    - If balanceOf returns a non-zero output then we show a discount code, otherwise we do nothing (for now)