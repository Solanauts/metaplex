import React, {useMemo, useState} from "react"
import {Connection, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction} from "@solana/web3.js";
import {Alert, Button, Form, Input, Space, Typography} from 'antd';
import {LoadingOutlined, RedoOutlined} from '@ant-design/icons';
import {useWallet} from "@oyster/common/dist/lib/contexts/wallet";
//import { getPhantomWallet } from '@solana/wallet-adapter-wallet'
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
const Transfer = ({ keypair }) => {
  const [toAddress, setToAddress] = useState('');
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(false);
  const [txSignature, setTxSignature] = useState('');

  const generate = () => {
    const address = '8VG1sDEF9UMpTrQseCc1R3ZWHnQDB73jS83NBzVujELk';
    //const owner = address.toString();
    setToAddress(address);
  }

  // @ts-ignore
  const transfer = (values) => {
    const amountNumber = parseFloat(values.amount);

    if (isNaN(amountNumber)) {
      setError("Amount needs to be a valid number")
    }

    //const url = getNodeRpcURL();
    const url = 'https://api.devnet.solana.com';
    const connection = new Connection(url);

    // @ts-ignore
    const toPubKey = new PublicKey(toAddress);
    const fromPubKey = new PublicKey(useWallet);

    const instructions = SystemProgram.transfer({
      fromPubkey: fromPubKey,
      //fromPubkey: keypair.publicKey,
      toPubkey: toPubKey,
      lamports: amountNumber,
    });

    const signers = [
      {
        publicKey: fromPubKey,
        secretKey: new Uint8Array(keypair.secretKey)
      }
    ];

    setTxSignature('');
    setFetching(true);

    // Create a transaction and add instructions
    const transaction = new Transaction().add( instructions );
    setTxSignature( '' );
    setFetching( true );
    // Call sendAndConfirmTransaction and On success, call setTxSignature and setFetching
    sendAndConfirmTransaction(
      connection,
      transaction,
      signers,
    ).then((signature) => {
      setTxSignature( signature );
      setFetching( false );
    }).catch((error) => {
      console.log( error );
      setFetching( false );
    })
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
