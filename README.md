# NFTHack Project

## Public URL
https://showcase.ethglobal.com/nfthack2022/sygs

## Description
Rather than going through GoFundMe or trying to raise money privately, our platform enables small business owners to undergo a funding round in exchange for NFTs that hold utility within their own ecosystem. The business owner uses our platform to deploy a contract as following: they are targeting a $1000 funding round so they can change their current supplier, so they are pointed to our form which will create a contract based on the minimum threshold payment required per customer. If they are seeking at least $10 per person, 100 NFTs will be created on Polygon. 

They can then integrate this funding contract onto their website which will use Circle to convert fiat to USDC, after the funder connects their Metamask wallet. In return, they are sent a Polygon NFT that will hold utility value for the project that they have funded. An example utility would be receiving discount codes the longer you hold the NFT. 

## Implementation
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