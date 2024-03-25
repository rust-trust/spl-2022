
// Import necessary functions and constants from the Solana web3.js and SPL Token packages
import bs58 from 'bs58';
import * as dotenv from 'dotenv';
dotenv.config();
import {
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
    Cluster,
    PublicKey,
} from '@solana/web3.js';

import {
    ExtensionType,
    createInitializeMintInstruction,
    mintTo,
    createAccount,
    getMintLen,
    getTransferFeeAmount,
    unpackAccount,
    TOKEN_2022_PROGRAM_ID,
    createInitializeTransferFeeConfigInstruction,
    harvestWithheldTokensToMint,
    transferCheckedWithFee,
    withdrawWithheldTokensFromAccounts,
    withdrawWithheldTokensFromMint,
    getOrCreateAssociatedTokenAccount,
    createAssociatedTokenAccountIdempotent
} from '@solana/spl-token';

// Initialize connection to local Solana node
const connection = new Connection('https://silent-light-night.solana-devnet.quiknode.pro/333a3f5bdcc32e4ae24e6147e67f0fb676a56ab6/', 'confirmed');

// Generate keys for payer, mint authority, and mint
const privateKeyString = process.env.PRIVATE_KEY;
if (!privateKeyString) {
    console.error('Private key is not defined in the environment variables.');
    process.exit(1);
}
const privateKeyBuffer = bs58.decode(privateKeyString);
const payer = Keypair.fromSecretKey(privateKeyBuffer);
// const payer = Keypair.generate();
// const mintAuthority = Keypair.fromSecretKey(privateKeyBuffer);
const mintAuthority = Keypair.generate();
// const mintKeypair = Keypair.fromSecretKey(privateKeyBuffer);;
const mintKeypair = Keypair.generate();
const mint = mintKeypair.publicKey;

// Generate keys for transfer fee config authority and withdrawal authority
const transferFeeConfigAuthority = Keypair.generate();
const withdrawWithheldAuthority = Keypair.generate();

// Define the extensions to be used by the mint
const extensions = [
    ExtensionType.TransferFeeConfig,
];

// Calculate the length of the mint
const mintLen = getMintLen(extensions);

// Set the decimals, fee basis points, and maximum fee
const decimals = 9;
const feeBasisPoints = 100; // 1%
const maxFee = BigInt(9 * Math.pow(10, decimals)); // 9 tokens

// Define the amount to be minted and the amount to be transferred, accounting for decimals
const mintAmount = BigInt(1_000_000 * Math.pow(10, decimals)); // Mint 1,000,000 tokens
const transferAmount = BigInt(1_000 * Math.pow(10, decimals)); // Transfer 1,000 tokens

// Calculate the fee for the transfer
const calcFee = (transferAmount * BigInt(feeBasisPoints)) / BigInt(10_000); // expect 10 fee
const fee = calcFee > maxFee ?  maxFee : calcFee; // expect 9 fee
// Helper function to generate Explorer URL
function generateExplorerTxUrl(txId: string) {
    return `https://explorer.solana.com/tx/${txId}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`;
}

async function main() {
    // Step 1 - Airdrop to Payer
    // const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    // await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });

    // Step 2 - Create a New Token
    const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen);
    const mintTransaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint,
            space: mintLen,
            lamports: mintLamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeTransferFeeConfigInstruction(
            mint,
            transferFeeConfigAuthority.publicKey,
            withdrawWithheldAuthority.publicKey,
            feeBasisPoints,
            maxFee,
            TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMintInstruction(mint, decimals, mintAuthority.publicKey, null, TOKEN_2022_PROGRAM_ID)
    );
    const newTokenTx = await sendAndConfirmTransaction(connection, mintTransaction, [payer, mintKeypair], undefined);
    console.log("New Token Created:", generateExplorerTxUrl(newTokenTx));
    // Step 3 - Mint tokens to Owner
        const owner = Keypair.generate();
        const sourceAccount = await createAssociatedTokenAccountIdempotent(connection, payer, mint, owner.publicKey, {}, TOKEN_2022_PROGRAM_ID);
        const mintSig = await mintTo(connection,payer,mint,sourceAccount,mintAuthority,mintAmount,[],undefined,TOKEN_2022_PROGRAM_ID);
        console.log("Tokens Minted:", generateExplorerTxUrl(mintSig));

    // Step 4 - Send Tokens from Owner to a New Account
        const destinationOwner = Keypair.generate();
        const destinationAccount = await createAssociatedTokenAccountIdempotent(connection, payer, mint, destinationOwner.publicKey, {}, TOKEN_2022_PROGRAM_ID);
        const transferSig = await transferCheckedWithFee(
            connection,
            payer,
            sourceAccount,
            mint,
            destinationAccount,
            owner,
            transferAmount,
            decimals,
            fee,
            []
        );
        console.log("Tokens Transfered:", generateExplorerTxUrl(transferSig));

    // Step 5 - Fetch Fee Accounts

    // Step 6 - Harvest Fees
}
// Execute the main function
main();