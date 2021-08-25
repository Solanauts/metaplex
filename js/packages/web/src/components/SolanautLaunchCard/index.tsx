import React, {useMemo, useState} from "react"
import {
  clusterApiUrl,
  Connection, Keypair,
  PublicKey, PublicKeyInitData,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction
} from "@solana/web3.js";
import {Alert, Button, Form, Input, Space, Typography} from 'antd';
import {LoadingOutlined, RedoOutlined} from '@ant-design/icons';
//import { WalletProvider } from "@oyster/common/dist/lib/contexts/wallet";
import { UseWalletProvider } from "use-wallet";
//import { PhantomWalletAdapter } from '../../../../common/src/wallet-adapters/phantom'
//import Wallet from "@project-serum/sol-wallet-adapter";
import { WalletAdapter } from "@solana/wallet-base";
import Wallet from "@project-serum/sol-wallet-adapter";
import {useWallet} from "@oyster/common/dist/lib/contexts/wallet";
// import {getPhantomWallet, getSolflareWallet} from "@solana/wallet-adapter-wallets";
//import {DEFAULT} from '../../../../common/src/contexts/connection'


const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
const tailLayout = {
  wrapperCol: { offset: 4, span: 20 },
};

const { Text } = Typography;

// @ts-ignore
const Transfer = () => {
  const [toAddress, setToAddress] = useState();
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(false);
  const [txSignature, setTxSignature] = useState('');

  const generate = () => {
    //const address = new PublicKey('8VG1sDEF9UMpTrQseCc1R3ZWHnQDB73jS83NBzVujELk');
    //const owner = address.toString();
    //setToAddress(address);
  }

  //let wallet: WalletAdapter;
  const transfer = async () => {
    let connection = new Connection(clusterApiUrl('devnet'))
    let providerURL = 'https://www.phantom.app';
    let wallet: WalletAdapter = new Wallet( providerURL );
    wallet.on('connect', (publicKey: { toBase58: () => string; }) => console.log('Connected to ' + publicKey.toBase58()));
    wallet.on('disconnect', () => console.log('Disconnected'));
    await wallet.connect();


    //const toPubkey = feePayer.publicKey.toBase58();
    //const fromPubKey = wallet.publicKey.toBase58();

    let address = new PublicKey('8VG1sDEF9UMpTrQseCc1R3ZWHnQDB73jS83NBzVujELk');
    let transaction = new Transaction().add(
      SystemProgram.transfer({
        // @ts-ignore
      fromPubkey: wallet.publicKey,
        // @ts-ignore
      toPubkey: address,
      lamports: 2000000000,
    }))

    /*const signers = [
      {
        publicKey: address,
        secretKey: new Uint8Array(feePayer.secretKey)
      }
    ];*/

    //setTxSignature('');
    //setFetching(true);

    // Create a transaction and add instructions
    let { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    // @ts-ignore
    transaction.feePayer = wallet.publicKey;
    let signed = await wallet.signTransaction(transaction);
    let txid = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(txid);

    //setTxSignature('');
    //setFetching(true);

    // Call sendAndConfirmTransaction and On success, call setTxSignature and setFetching
    /*sendAndConfirmTransaction(
      connection,
      transaction,
      signers,
    ).then((signature) => {
      setTxSignature(signature);
      setFetching(false);
    }).catch((error) => {
      console.log(error);
      setFetching(false);
    })*/
  };


  return (
    <Form
      {...layout}
      name="transfer"
      layout="horizontal"
      onFinish={transfer}
    >

      <Form.Item label="Amount" name="amount" required tooltip="1 lamport = 0.000000001 SOL">
        <Space direction="vertical">
          <Input suffix="lamports" style={{ width: "200px" }} />
        </Space>
      </Form.Item>

      <Form.Item label="Recipient" required>
        <Space direction="horizontal">
          {toAddress && <Text code>{toAddress}</Text>}
          <Button size="small" type="dashed" onClick={generate} icon={<RedoOutlined />}>The Solanaut Team</Button>
        </Space>
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit" disabled={fetching}>
          Submit Transfer
        </Button>
      </Form.Item>

      {
        fetching &&
        <Form.Item {...tailLayout}>
          <Space size="large">
            <LoadingOutlined style={{ fontSize: 24, color: "#1890ff" }} spin />
            <Text type="secondary">Transfer initiated. Waiting for confirmations...</Text>
          </Space>
        </Form.Item>
      }

      {txSignature &&
      <Form.Item {...tailLayout}>
        <Alert
          type="success"
          showIcon
          message={
            <Text strong>Transfer confirmed!</Text>
          }
        />
      </Form.Item>
      }

      {error &&
      <Form.Item {...tailLayout}>
        <Alert
          type="error"
          showIcon
          closable
          message={error}
          onClose={() => setError('')}
        />
      </Form.Item>
      }
    </Form>
  );
};

export default Transfer
