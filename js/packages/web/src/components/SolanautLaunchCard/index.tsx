import { useState, useEffect, useContext } from "react";
import { Alert, Typography } from 'antd';
import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
  SystemProgram
} from "@solana/web3.js";
import SolanautContext from "../../contexts/meta/solanautContext";

type DisplayEncoding = "utf8" | "hex";
type PhantomEvent = "disconnect" | "connect";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  autoApprove: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<void>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<any>;
}

const getProvider = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    const provider = (window as any).solana;
    if (provider.isPhantom) {
      return provider;
    }
  }
  window.open("https://phantom.app/", "_blank");
};

const NETWORK = clusterApiUrl("devnet");

function SolanautLaunchCard()
{
  const provider = getProvider();
  const [ logs, setLogs ] = useState<string[]>([] );
  const addLog = ( log: string ) => setLogs([...logs, log ]);
  const connection = new Connection( NETWORK );
  const [, setConnected ] = useState<boolean>(false );
  const [ txSignature, setTxSignature ] = useState('' );
  const contextLayer = useContext( SolanautContext );
  const [ isPaid, setIsPaid ] = useState( contextLayer.isPaid );
  const { Text } = Typography;

  useEffect(() => {
    if (provider) {
      provider.on("connect", () => {
        setConnected(true);
        addLog("Connected to wallet " + provider.publicKey?.toBase58());
      });
      provider.on("disconnect", () => {
        setConnected(false);
        addLog("Disconnected from wallet");
      });
      // try to eagerly connect
      provider.connect({ onlyIfTrusted: true });
      return () => {
        provider.disconnect();
      };
    }
  }, [provider]);
  if (!provider) {
    return <h2>Could not find a provider</h2>;
  }

  const getTxExplorerURL = (signature: string) => {
    return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
  }

  const createTransferTransaction = async () => {
    if (!provider.publicKey) {
      return;
    }
    let toPubKey = new PublicKey('8VG1sDEF9UMpTrQseCc1R3ZWHnQDB73jS83NBzVujELk')
    let transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: toPubKey,
        lamports: 1000000000
      })
    );
    transaction.feePayer = provider.publicKey;
    addLog("Getting recent blockhash");
    (transaction as any).recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;
    return transaction;
  };

  const sendTransaction = async () => {
    const transaction = await createTransferTransaction();
    if (transaction) {
      try {
        let signed = await provider.signTransaction(transaction);
        addLog("Got signature, submitting transaction");
        let signature = await connection.sendRawTransaction(signed.serialize());
        addLog(
          "Submitted transaction " + signature + ", awaiting confirmation"
        );
        setTxSignature(signature);
        await connection.confirmTransaction(signature, 'processed');
        addLog("Transaction " + signature + " confirmed");
      } catch (e) {
        console.warn(e);
        addLog("Error: " + e.message);
      }
    }
  };
  const explorerUrl = getTxExplorerURL(txSignature);
  /*if ( txSignature.length > 0 )
  {
    setIsPaid( true );
    console.log( 'Solanaut Team is paid: ', isPaid );
    //console.log( SolanautContext );
  }*/


  return (
    <div className="SolanautLaunchCard">
      <h1>The Solanauts Launchpad</h1>
      <main>
        {provider && provider.publicKey ? (
          <>
            <div>Wallet address: {provider.publicKey?.toBase58()}.</div>
            <div>isConnected: {provider.isConnected ? "true" : "false"}.</div>
            <div>autoApprove: {provider.autoApprove ? "true" : "false"}. </div>
            <button onClick={sendTransaction}>Pay for Your Solanaut</button>
            <button onClick={() => provider.disconnect()}>Disconnect</button>
          </>
        ) : (
          <>
            <button onClick={() => provider.connect()}>
              Connect to Phantom
            </button>
          </>
        )}
        <hr />
        <div className="logs">
          {logs.map((log, i) => (
            <div className="log" key={i}>
              {log}
            </div>
          ))}
        </div>
        {txSignature &&
          <Alert
            type="success"
            showIcon
            message={
              <Text strong>Transfer confirmed!</Text>
            }
            description={
              <a href={explorerUrl} target="_blank" rel="noreferrer">View on Solana Explorer</a>
            }
          />
        }
      </main>
    </div>
  );
}
export default SolanautLaunchCard

