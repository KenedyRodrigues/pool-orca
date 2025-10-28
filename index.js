import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import pkg from '@orca-so/whirlpool-sdk';

const {
  OrcaNetwork,
  OrcaWhirlpoolClient,
} = pkg;

import fs from 'fs';
import { resolve } from 'path';

// Função para carregar ou criar wallet
function loadOrCreateKeypair() {
  const keypairPath = resolve('test-wallet.json');
  if (fs.existsSync(keypairPath)) {
    const secret = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    return Keypair.fromSecretKey(new Uint8Array(secret));
  }
  const newKeypair = Keypair.generate();
  fs.writeFileSync(keypairPath, JSON.stringify(Array.from(newKeypair.secretKey)));
  console.log("Nova wallet criada em 'test-wallet.json'");
  return newKeypair;
}

async function main() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const wallet = loadOrCreateKeypair();

  console.log('Carteira pública:', wallet.publicKey.toBase58());

  const balance = await connection.getBalance(wallet.publicKey);
  console.log('Saldo atual:', balance / LAMPORTS_PER_SOL, 'SOL');

  if (balance < 0.5 * LAMPORTS_PER_SOL) {
    console.log('Solicitando airdrop...');
    const sig = await connection.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig, 'confirmed');
    console.log('Airdrop concluído!');
  }

  // Cria o cliente Whirlpool usando a conexão e a wallet
  const client = new OrcaWhirlpoolClient(connection, wallet, OrcaNetwork.DEVNET);

  console.log('Cliente Whirlpool inicializado com sucesso!');

  // Aqui você pode adicionar mais código para usar o client
}

main().catch(console.error);