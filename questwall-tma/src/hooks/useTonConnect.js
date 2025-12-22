import { useCallback } from 'react';
import { useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const address = useTonAddress();

  const connect = useCallback(async () => {
    try {
      await tonConnectUI.openModal();
    } catch (error) {
      console.error('连接钱包失败:', error);
    }
  }, [tonConnectUI]);

  const disconnect = useCallback(async () => {
    try {
      await tonConnectUI.disconnect();
    } catch (error) {
      console.error('断开钱包失败:', error);
    }
  }, [tonConnectUI]);

  return {
    tonConnect: {
      connected: !!wallet,
      wallet: wallet ? {
        address: address,
        name: wallet.device?.appName || 'TON Wallet',
      } : null,
      connect,
      disconnect,
    },
    walletAddress: address || null,
  };
}
