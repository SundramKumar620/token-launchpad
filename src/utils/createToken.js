import {
    Keypair,
    SystemProgram,
    Transaction,
    PublicKey,
} from '@solana/web3.js';
import {
    TOKEN_2022_PROGRAM_ID,
    getMintLen,
    createInitializeMintInstruction,
    createInitializeMetadataPointerInstruction,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddressSync,
    createMintToInstruction,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    ExtensionType,
    TYPE_SIZE,
    LENGTH_SIZE,
} from '@solana/spl-token';
import {
    createInitializeInstruction,
    createUpdateFieldInstruction,
    pack,
} from '@solana/spl-token-metadata';
import { connection, getProvider } from './wallet.js';

/**
 * Create a Token-2022 token with embedded metadata.
 *
 * @param {object}  opts
 * @param {string}  opts.name        Token name
 * @param {string}  opts.symbol      Token symbol
 * @param {number}  opts.decimals    Decimals (0-9)
 * @param {number}  opts.supply      Initial supply (in whole tokens)
 * @param {string}  opts.imageUri    URI for token image
 * @param {string}  opts.description Token description
 * @param {(s: string) => void} opts.onStatus  Status callback
 * @returns {Promise<string>} The mint address
 */
export async function createToken({
    name,
    symbol,
    decimals,
    supply,
    imageUri,
    description,
    onStatus,
}) {
    const provider = getProvider();
    if (!provider || !provider.publicKey) {
        throw new Error('Wallet not connected');
    }

    // Re-create payer as our own PublicKey to avoid version mismatch
    const payer = new PublicKey(provider.publicKey.toBase58());
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    onStatus?.('Preparing token metadata...');

    // -- Build metadata for space calculation --
    const metadata = {
        mint: mint,
        name: name,
        symbol: symbol,
        uri: imageUri || '',
        additionalMetadata: description ? [['description', description]] : [],
    };

    // -- Calculate space: mint + metadata pointer + TLV header + metadata --
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
    const totalLen = mintLen + metadataLen;

    const lamports = await connection.getMinimumBalanceForRentExemption(totalLen);

    onStatus?.('Building transaction...');

    // -- Instructions --
    const tx = new Transaction();

    // 1) Create the mint account
    tx.add(
        SystemProgram.createAccount({
            fromPubkey: payer,
            newAccountPubkey: mint,
            space: mintLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        })
    );

    // 2) Initialize metadata pointer (points to itself)
    tx.add(
        createInitializeMetadataPointerInstruction(
            mint,
            payer,
            mint, // metadata address = mint itself
            TOKEN_2022_PROGRAM_ID
        )
    );

    // 3) Initialize the mint
    tx.add(
        createInitializeMintInstruction(
            mint,
            decimals,
            payer,         // mint authority
            payer,         // freeze authority
            TOKEN_2022_PROGRAM_ID
        )
    );

    // 4) Initialize token metadata on the mint
    tx.add(
        createInitializeInstruction({
            programId: TOKEN_2022_PROGRAM_ID,
            mint: mint,
            metadata: mint,
            name: name,
            symbol: symbol,
            uri: imageUri || '',
            mintAuthority: payer,
            updateAuthority: payer,
        })
    );

    // 5) Add description as an additional metadata field
    if (description) {
        tx.add(
            createUpdateFieldInstruction({
                programId: TOKEN_2022_PROGRAM_ID,
                metadata: mint,
                updateAuthority: payer,
                field: 'description',
                value: description,
            })
        );
    }

    // 6) Create associated token account
    const ata = getAssociatedTokenAddressSync(
        mint,
        payer,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
    );

    tx.add(
        createAssociatedTokenAccountInstruction(
            payer,
            ata,
            payer,
            mint,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        )
    );

    // 7) Mint initial supply
    const adjustedSupply = BigInt(supply) * BigInt(10 ** decimals);
    tx.add(
        createMintToInstruction(
            mint,
            ata,
            payer,
            adjustedSupply,
            [],
            TOKEN_2022_PROGRAM_ID
        )
    );

    // -- Send transaction --
    onStatus?.('Waiting for wallet approval...');

    const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = payer;

    // The mint keypair must partially sign
    tx.partialSign(mintKeypair);

    // Let the wallet sign + send
    const signed = await provider.signTransaction(tx);
    const signature = await connection.sendRawTransaction(signed.serialize());

    onStatus?.('Confirming transaction...');
    await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        'confirmed'
    );

    return mint.toBase58();
}
