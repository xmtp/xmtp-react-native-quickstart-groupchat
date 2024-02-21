import React, {useState, useEffect} from 'react';
import {Client, useXmtp} from '@xmtp/react-native-sdk';
import {ethers} from 'ethers';
import {ConversationContainer} from './ConversationContainer';
import {View, Text, Button, StyleSheet, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GroupChatInfo} from './GroupChatInfo';
import Config from 'react-native-config';
const myPrivateKey = Config.MY_PRIVATE_KEY;
const infuraKey = Config.INFURA_KEY;
const xmtpEnv = Config.XMTP_ENV;

const styles = StyleSheet.create({
  uContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10,
    zIndex: 1000,
    overflow: 'hidden',
  },
  logoutBtnContainer: {
    padding: 10,
  },
  logoutBtn: {
    position: 'absolute',
    top: 10,
    right: 5,
    color: '#000',
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontSize: 10,
  },
  widgetHeader: {
    padding: 2,
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'none',
    borderWidth: 0,
    width: 'auto',
    margin: 0,
  },
  conversationHeaderH4: {
    margin: 0,
    padding: 4,
    fontSize: 14, // Increased font size
  },
  backButton: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    fontSize: 14, // Increased font size
  },
  widgetContent: {
    flexGrow: 1,
  },
  xmtpContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  btnXmtp: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    color: '#000',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'grey',
    padding: 10,
    borderRadius: 5,
    fontSize: 14,
  },
});

export function FloatingInbox({wallet, onLogout}) {
  const [isOnNetwork, setIsOnNetwork] = useState(false);
  const {client, setClient} = useXmtp();
  const [isConnected, setIsConnected] = useState(false);
  const [showGroupChatInfo, setShowGroupChatInfo] = useState(false);

  useEffect(() => {
    (async () => {
      const initialIsOnNetwork =
        (await AsyncStorage.getItem('isOnNetwork')) === 'true' || false;
      const initialIsConnected =
        ((await AsyncStorage.getItem('isConnected')) && wallet === 'true') ||
        false;

      setIsOnNetwork(initialIsOnNetwork);
      setIsConnected(initialIsConnected);
    })();
  }, []);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [signer, setSigner] = useState();

  useEffect(() => {
    if (wallet) {
      setSigner(wallet);
      setIsConnected(true);
    }
    if (client && !isOnNetwork) {
      setIsOnNetwork(true);
    }
    if (signer && isOnNetwork && isConnected) {
      //initXMTP();
      initXmtpWithKeys();
    }
  }, [wallet, isOnNetwork, isConnected]);

  useEffect(() => {
    AsyncStorage.setItem('isOnNetwork', isOnNetwork.toString());
    AsyncStorage.setItem('isConnected', isConnected.toString());
  }, [isConnected, isOnNetwork]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signerXmtp = provider.getSigner();
        setSigner(signerXmtp);
        setIsConnected(true);
      } catch (error) {
        console.error('User rejected request', error);
      }
    } else {
      console.error('Metamask not found');
    }
  };

  const getAddress = async signer => {
    try {
      if (signer && typeof signer.getAddress === 'function') {
        return await signer.getAddress();
      } else if (signer && typeof signer.getAddresses === 'function') {
        //viem
        const [address] = await signer.getAddresses();
        return address;
      } else if (signer.address) {
        return signer.address;
      } else return null;
    } catch (e) {
      console.log(e);
    }
  };

  const createNewWallet = async () => {
    try {
      const clientOptions = {
        env: getEnv(),
        enableAlphaMls: true,
      };
      const xmtpClient = await Client.createRandom(clientOptions.env);
      setIsConnected(true);
      setSigner(xmtpClient);
      setClient(xmtpClient);
      setIsOnNetwork(true);
    } catch (error) {
      console.error('Error creating new wallet', error);
    }
  };

  const handleLogout = async () => {
    setIsConnected(false);
    setSigner(null);
    setIsOnNetwork(false);
    setClient(null);
    setSelectedConversation(null);
    const address = await getAddress(signer);
    wipeKeyBundle(address);
    AsyncStorage.removeItem('isOnNetwork');
    AsyncStorage.removeItem('isConnected');
    if (typeof onLogout === 'function') {
      onLogout();
    }
  };
  const openConversation = async conversation => {
    setSelectedConversation(conversation);
  };

  const startFromPrivateKey = async () => {
    try {
      const infuraProvider = new ethers.InfuraProvider('mainnet', infuraKey);
      const addresses = [
        '0x67633be8c32db5414951db4a9ea9734b1214f8f5ca15d6b16818c0b4ee864653',
        '0xdc5aa0df09080c5c3de44f3e4e798b7076caac3e345c936b80925879841f172a',
        '0x424bfa2d712d7ef6012422e1b9e60f48ca3dbdb7695362f3b967a860096a52b2',
        '0x8d2e889a13d2acdfbfe9ecc220f386d6f6c059665e1fcaf138fd131a7da0b118',
        '0x7096b1d7ff04ae62b783c323bc81058f6811ff54c2ae84509663d03f51dc904d',
        '0x662ea43a87804e0a8940456e78da6e5ab03cf1d5efe7da12c03e496802e5f79b',
        '0xdc64190bd81017018020e46c1395a8b718a6d2ddefd9400f9a8ca743c8cd6b29',
      ];

      const signerEthers = new ethers.Wallet(addresses[0], infuraProvider);
      setSigner(signerEthers);
      setIsConnected(true);
    } catch (error) {
      console.error('Error creating new wallet', error);
    }
  };
  const initXmtpWithKeys = async function () {
    try {
      if (!signer) {
        handleLogout();
        return;
      }
      const clientOptions = {
        env: getEnv(),
        enableAlphaMls: true,
      };
      let address = await getAddress(signer);

      let keys = await loadKeyBundle(address);
      if (!keys) {
        const xmtp = await Client.create(signer, clientOptions);
        setClient(xmtp);
        keys = await xmtp.exportKeyBundle(xmtp.address);
        storeKeyBundle(xmtp.address, keys);
        setIsOnNetwork(!!xmtp.address);
      } else {
        const xmtp = await Client.createFromKeyBundle(keys, clientOptions);
        setClient(xmtp);
        setIsOnNetwork(!!xmtp.address);
      }
    } catch (error) {
      console.error('Error initializing XMTP with keys', error);
    }
  };
  const resetSelectedConversation = () => {
    setSelectedConversation(null);
  };

  return (
    <View style={{flex: 1}}>
      <View style={styles.uContainer}>
        {isConnected && (
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutBtnContainer}>
            <Text style={styles.logoutBtn}>Logout</Text>
          </TouchableOpacity>
        )}
        {isConnected && isOnNetwork && (
          <View style={styles.widgetHeader}>
            <View style={styles.conversationHeader}>
              {isOnNetwork && selectedConversation && (
                <Button
                  title="←"
                  onPress={() => {
                    if (showGroupChatInfo) {
                      setShowGroupChatInfo(false);
                    } else {
                      openConversation(null);
                    }
                  }}
                  style={styles.backButton}
                />
              )}
              <Text style={styles.conversationHeaderH4}>Conversations</Text>
              {isOnNetwork &&
                selectedConversation &&
                selectedConversation.version === 'GROUP' &&
                typeof selectedConversation.memberAddresses === 'function' && (
                  <TouchableOpacity
                    onPress={() => {
                      setShowGroupChatInfo(!showGroupChatInfo);
                    }}
                    style={styles.cogIconContainer}>
                    <Text style={styles.cogIcon}>⚙️</Text>
                  </TouchableOpacity>
                )}
            </View>
          </View>
        )}
        <View style={styles.widgetContent}>
          {!isConnected && (
            <View style={styles.xmtpContainer}>
              <Button
                title="Connect Wallet"
                onPress={connectWallet}
                style={styles.btnXmtp}
              />
              <Text style={styles.label} onPress={createNewWallet}>
                or create new one
              </Text>
              <Text style={styles.label} onPress={startFromPrivateKey}>
                or start from key
              </Text>
            </View>
          )}
          {isConnected && !isOnNetwork && (
            <View style={styles.xmtpContainer}>
              <Button
                title="Connect to XMTP"
                onPress={initXmtpWithKeys}
                style={styles.btnXmtp}
              />
            </View>
          )}

          {isConnected && isOnNetwork && client && (
            <>
              {selectedConversation &&
              selectedConversation.version === 'GROUP' &&
              showGroupChatInfo ? (
                <GroupChatInfo
                  selectedConversation={selectedConversation}
                  resetSelectedConversation={resetSelectedConversation} // Add this line
                  resetGroupChatInfo={() => setShowGroupChatInfo(false)} // Add this line
                />
              ) : (
                <ConversationContainer
                  client={client}
                  selectedConversation={selectedConversation}
                  setSelectedConversation={openConversation}
                />
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

export const getEnv = () => {
  // "dev" | "production" | "local"
  return typeof process !== 'undefined' && xmtpEnv ? xmtpEnv : 'production';
};

export const buildLocalStorageKey = walletAddress => {
  return walletAddress ? `xmtp:${getEnv()}:keys:${walletAddress}` : '';
};

export const loadKeyBundle = async address => {
  const keyBundle = await AsyncStorage.getItem(buildLocalStorageKey(address));
  return keyBundle;
};
export const storeKeyBundle = async (address, keyBundle) => {
  await AsyncStorage.setItem(buildLocalStorageKey(address), keyBundle);
};
export const wipeKeyBundle = async address => {
  await AsyncStorage.removeItem(buildLocalStorageKey(address));
};
