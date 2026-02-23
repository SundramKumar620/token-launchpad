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

    const payer = new PublicKey(provider.publicKey.toBase58());
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

    onStatus?.('Preparing token metadata...');

    const metadata = {
        mint: mint,
        name: name,
        symbol: symbol,
        uri: imageUri || '',
        additionalMetadata: description ? [['description', description]] : [],
    };

    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
    const totalLen = mintLen + metadataLen;

    const lamports = await connection.getMinimumBalanceForRentExemption(totalLen);

    onStatus?.('Building transaction...');

    const tx = new Transaction();

    tx.add(
        SystemProgram.createAccount({
            fromPubkey: payer,
            newAccountPubkey: mint,
            space: mintLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        })
    );


    tx.add(
        createInitializeMetadataPointerInstruction(
            mint,
            payer,
            mint, 
            TOKEN_2022_PROGRAM_ID
        )
    );

    tx.add(
        createInitializeMintInstruction(
            mint,
            decimals,
            payer,         
            payer,        
            TOKEN_2022_PROGRAM_ID
        )
    );

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

    onStatus?.('Waiting for wallet approval...');

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = payer;

    tx.partialSign(mintKeypair);

    const signed = await provider.signTransaction(tx);
    const signature = await connection.sendRawTransaction(signed.serialize());

    onStatus?.('Confirming transaction...');

    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

    return mint.toBase58();
}
