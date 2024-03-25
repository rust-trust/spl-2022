# SPL Token Management

## Overview
This repository contains code for managing SPL (Solana Program Library) tokens using Solana web3.js and SPL Token packages. The code includes functionalities for token minting, transfer, fee management, and more.

## Installation
1. Clone this repository to your local machine.
2. Navigate to the project directory in your terminal.
3. Run `yarn install` to install the required dependencies.

## Usage
1. **Configure Environment Variables:**
   - Create a `.env` file in the root directory of the project.
   - Define the following environment variables:
     - `PRIVATE_KEY`: Private key for the payer account.

2. **Run Application:**
   - Execute `ts-node app.ts` in your terminal to start the application.

## Detailed Description
The main code file `app.ts` performs the following tasks:

1. Initializes connection to a local Solana node.
2. Generates keys for payer, mint authority, and mint.
3. Generates keys for transfer fee config authority and withdrawal authority.
4. Defines extensions for the mint and calculates mint length.
5. Sets decimals, fee basis points, and maximum fee.
6. Defines mint amount and transfer amount, and calculates the fee for the transfer.
7. Implements functions for airdrop, token creation, token minting, token transfer, fetching fee accounts, and harvesting fees.
8. Generates Explorer URLs for transactions.

## Additional Notes:
- Ensure you have Node.js and Yarn installed on your system.
- This application uses TypeScript.
- Make sure to configure the `.env` file with the required environment variables before running the application.
- The application interacts with a Solana Devnet node by default. Adjust the connection URL as needed.

