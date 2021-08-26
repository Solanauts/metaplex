import React, { FC, useMemo } from 'react';
import { WalletProvider } from '@solana/wallet-adapter-react';
import {
  getLedgerWallet,
  getMathWallet,
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
  getTorusWallet,
} from '@solana/wallet-adapter-wallets';
import {
  WalletDialogProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from '@solana/wallet-adapter-material-ui';

export const WalletList: FC = (props) => {
  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking --
  // Only the wallets you want to instantiate here will be compiled into your application
  const wallets = useMemo(() => [
    getPhantomWallet(),
    getSolflareWallet(),
    getTorusWallet({
      options: { clientId: 'Get a client ID @ https://developer.tor.us' }
    }),
    getLedgerWallet(),
    getSolongWallet(),
    getMathWallet(),
    getSolletWallet(),
  ], []);

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletDialogProvider>
        <WalletMultiButton/>
        { props.children }
        <WalletDisconnectButton/>
      </WalletDialogProvider>
    </WalletProvider>
  );
};
