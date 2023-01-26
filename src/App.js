import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { ethers } from "ethers";
import { DatePicker, message, Button, Input, Collapse } from 'antd';
import 'antd/dist/reset.css';
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import ReactJson from 'react-json-view'
import fs from "fs";
const { Panel } = Collapse;

function App() {

  const [provider, setProvider] = useState('');
  const [signer, setSigner] = useState('');
  const [balance, setBalance] = useState(0);
  const [currenctBlock, setCurrentBlock] = useState(0);
  const [signerAddress, setSignerAddress] = useState("");
  const [messageToSign, setMessageToSign] = useState("");
  const [signedMessage, setSignedMessage] = useState("");
  const [mTreeValues, setMTreeValues] = useState([]);
  const [mTreeAddress, setMTreeAddress] = useState("");
  const [mTreeValue, setMTreeValue] = useState("");
  const [mTree, setMTree] = useState({});
  const [mTreeRoot, setMTreeRoot] = useState("");
  const [mTreeEntries, setMTreeEntries] = useState([]);

  const [mTreeBytesPubKeys, setMTreeBytesPubKeys] = useState("");
  const [mTreeBytesBalance, setMTreeBytesBalance] = useState("");
  const [mTreeBytesTokenId, setMTreeBytesTokenId] = useState("");
  const [mTreeByte, setMTreeByte] = useState({});
  const [mTreeByteRoot, setMTreeByteRoot] = useState("");
  const [mTreeBytesValues, setMTreeBytesValues] = useState([]);
  const [mTreeBytesEntries, setMTreeBytesEntries] = useState([]);
  const [trees, setTrees] = useState([]);

  const connectMetaMask = async () => {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider);
    // MetaMask requires requesting permission to connect users accounts
    await provider.send("eth_requestAccounts", []);

    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    const signer = provider.getSigner()
    setSigner(signer);
  }

  const queryBlockChain = async () => {
    // Look up the current block number
    const currentBlock = await provider.getBlockNumber()
    // 16417991
    setCurrentBlock(currentBlock)

    // Get the balance of an account (by address or ENS name, if supported by network)
    const balance = await provider.getBalance("ethers.eth")
    // { BigNumber: "182334002436162568" }

    // Often you need to format the output to something more user-friendly,
    // such as in ether (instead of wei)
    const formatedEtherBalance = ethers.utils.formatEther(balance)
    // '0.182334002436162568'
    console.log("formatedEtherBalance : ", formatedEtherBalance)
    setBalance(formatedEtherBalance)

    // If a user enters a string in an input field, you may need
    // to convert it from ether (as a string) to wei (as a BigNumber)
    ethers.utils.parseEther("1.0")
    // { BigNumber: "1000000000000000000" }
  }

  const sendEth = async () => {
    // Send 1 ether to an ens name.
    const tx = signer.sendTransaction({
      to: "ricmoo.firefly.eth",
      value: ethers.utils.parseEther("1.0")
    });
  }

  const connectToDaiContract = async () => {
    // You can also use an ENS name for the contract address
    const daiAddress = "dai.tokens.ethers.eth";

    // The ERC-20 Contract ABI, which is a common contract interface
    // for tokens (this is the Human-Readable ABI format)
    const daiAbi = [
      // Some details about the token
      "function name() view returns (string)",
      "function symbol() view returns (string)",

      // Get the account balance
      "function balanceOf(address) view returns (uint)",

      // Send some of your tokens to someone else
      "function transfer(address to, uint amount)",

      // An event triggered whenever anyone transfers to someone else
      "event Transfer(address indexed from, address indexed to, uint amount)"
    ];

    // The Contract object
    const daiContract = new ethers.Contract(daiAddress, daiAbi, provider);

    // Get the ERC-20 token name
    await daiContract.name()
    // 'Dai Stablecoin'

    // Get the ERC-20 token symbol (for tickers and UIs)
    await daiContract.symbol()
    // 'DAI'

    // Get the balance of an address
    balance = await daiContract.balanceOf("ricmoo.firefly.eth")
    // { BigNumber: "2413468059122458201631" }

    // Format the DAI for displaying to the user
    ethers.utils.formatUnits(balance, 18)
    // '2413.468059122458201631'

    // The DAI Contract is currently connected to the Provider,
    // which is read-only. You need to connect to a Signer, so
    // that you can pay to send state-changing transactions.
    const daiWithSigner = daiContract.connect(signer);

    // Each DAI has 18 decimal places
    const dai = ethers.utils.parseUnits("1.0", 18);

    // Send 1 DAI to "ricmoo.firefly.eth"
    const tx = daiWithSigner.transfer("ricmoo.firefly.eth", dai);
  }

  const signingMessages = async () => {
    // To sign a simple string, which are used for
    // logging into a service, such as CryptoKitties,
    // pass the string in.
    let signature = await signer.signMessage("Hello World");
    // '0xdd1b3ff1111409ad04264b06e6203d13b945c599b1a4f60e9d009324979c50ab3ffb1bda816149927dc6bd3311ccb6e0af8d3c99135864817d6f09fd4d47d2271b'

    //
    // A common case is also signing a hash, which is 32
    // bytes. It is important to note, that to sign binary
    // data it MUST be an Array (or TypedArray)
    //

    // This string is 66 characters long
    message = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

    // This array representation is 32 bytes long
    const messageBytes = ethers.utils.arrayify(message);
    // Uint8Array [ 221, 242, 82, 173, 27, 226, 200, 155, 105, 194, 176, 104, 252, 55, 141, 170, 149, 43, 167, 241, 99, 196, 161, 22, 40, 245, 90, 77, 245, 35, 179, 239 ]

    // To sign a hash, you most often want to sign the bytes
    signature = await signer.signMessage(messageBytes)
    // '0x7b03d0690027e3dd74513772db259a994837631922c82e4d0e3ce995e163adf26a94e7dd7cac9f6bb2c3f8e409b4bdf158baef5f510356f7bf418d38b4ee0fb71b'
  }

  const getSignerAddress = async () => {
    const signerAddress = await signer.getAddress()
    setSignerAddress(signerAddress)
  }

  const signOneMessage = async () => {
    const messageSigned = await signer.signMessage(messageToSign);
    setSignedMessage(messageSigned)
  }

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    // Update the document title using the browser API
    connectMetaMask()
  },[]);

  const onChangeCollapse = (key) => {
    console.log(key);
  };

  return (
    <div className="App">
          <div>
            <Collapse defaultActiveKey={['1']} onChange={onChangeCollapse}>
              <Panel header="Wallet and Eth Chain" key="1">
                <p>
                  {
                    `${balance} ETH` 
                  }
                </p>
                <p>
                  {
                    `Current Block: ${currenctBlock}` 
                  }
                </p>
                <p>
                  {
                    `Signer Address: ${signerAddress ? signerAddress : "Null"}` 
                  }
                </p>
                  <Button type="primary" onClick={() => {
                    queryBlockChain()
                  }}>Query Balance</Button>
                <br/>
                <br/>
                  <Button type="primary" onClick={() => {
                    getSignerAddress()
                  }}>Get Signer Address</Button>
                <br/>
                <br/>
                  <Input 
                    onChange={(e) => {
                      setMessageToSign(e.target.value);
                    }}
                    value={messageToSign}
                    placeholder="Input Message To Sign" 
                  />
                <br/>
                <br/>
                  <Button type="primary" onClick={() => {
                    signOneMessage()
                  }}>Get Signer Address</Button>
                <br/>
                <br/>
                <p style={{overflowWrap: 'anywhere'}}>
                  {
                    `Signed Message: ${signedMessage}`
                  }
                </p>
              </Panel>
              <Panel header="openzeppelin / merkel tree (address, amount)" key="2">
                  {
                    mTreeValues && mTreeValues.length ? JSON.stringify(mTreeValues) : ""
                  }
                  <br/>
                  <Input 
                    onChange={(e) => {
                      setMTreeAddress(e.target.value);
                    }}
                    value={mTreeAddress}
                    placeholder="Input Address e.g. 0x0000000000000000000000000000000000000002" 
                  />
                  <br/>
                  <br/>
                  <Input 
                    onChange={(e) => {
                      setMTreeValue(e.target.value);
                    }}
                    value={mTreeValue}
                    placeholder="Input Value e.g. 5000000000000000000" 
                  />
                  <br/>
                  <br/>
                  <div>
                    {mTreeRoot &&  <b>{`Merkel Tree Root : ${mTreeRoot}`}</b>}
                  </div>
                  <div>
                    {
                      <ReactJson src={mTree} />
                    }
                  </div>
                  <div>
                    {
                      mTreeEntries && mTreeEntries.length && <b>Merkel Tree Entries:</b>
                    }
                    {
                      mTreeEntries && mTreeEntries.length && <ReactJson src={mTreeEntries} />
                    }
                  </div>
                  <Button type="primary" onClick={() => {
                    const currentTree = JSON.parse(JSON.stringify(mTreeValues));
                    const newMTreeValues = [...currentTree ,[mTreeAddress, mTreeValue ] ]
                    setMTreeValues(newMTreeValues);
                  }}>Add to Values</Button>&nbsp;&nbsp;<Button type="primary" onClick={() => {
                    let tree = StandardMerkleTree.of(mTreeValues, ["address", "uint256"]);
                    setMTreeRoot(tree.root)
                    setMTree(tree.dump())
                    const tempTempEntries = []
                    for (const [i, v] of tree.entries()) {
                        const proof = tree.getProof(i);
                        const entry = {
                          entry: i,
                          value: v,
                          proof: proof
                        }
                        tempTempEntries.push(entry)
                    }
                    setMTreeEntries(tempTempEntries)
                  }}>Generate Tree</Button>&nbsp;&nbsp;<Button type="primary" onClick={() => {
                    setMTreeValues([]);
                    setMTreeAddress("");
                    setMTreeValue("");
                    setMTree({});
                    setMTreeRoot("");
                    setMTreeEntries([]);
                    const testArr = [
                      [
                        "0x90e8c1460fdb55b944ad4b9ec73275c2ef701311715d6f8766a02d0b0b8f37a21c871fdc9784276ec74515e7a219cbcf",
                        "32000000000000000000",
                        "0"
                      ]
                    ]
                    // const testTree = StandardMerkleTree.of(testArr, ["bytes", "uint128", "uint256"])
                    // console.log(testTree)
                    // const root = testTree.root;
                    // console.log(root)
                    // const proof = testTree.getProof(0);
                    // console.log(proof)
                  }}>Clear Tree</Button>
              </Panel>
              <Panel header="openzeppelin / merkel tree (['bytes' (pubkey), 'uint128' (balance), 'uint256' (tokenId)])" key="3">
                  {
                    mTreeBytesValues && mTreeBytesValues.length ? JSON.stringify(mTreeBytesValues) : ""
                  }
                  <br/>
                  <Input 
                    onChange={(e) => {
                      setMTreeBytesPubKeys(e.target.value);
                    }}
                    value={mTreeBytesPubKeys}
                    placeholder="PubKeys e.g. 0x90e8c1460fdb55b944ad4b9ec73275c2ef701311715d6f8766a02d0b0b8f37a21c871fdc9784276ec74515e7a219cbcf" 
                  />
                  <br/>
                  <br/>
                  <Input 
                    onChange={(e) => {
                      setMTreeBytesBalance(e.target.value);
                    }}
                    value={mTreeBytesBalance}
                    placeholder="Balance e.g. 300" 
                  />
                  <br/>
                  <br/>
                  <Input 
                    onChange={(e) => {
                      setMTreeBytesTokenId(e.target.value);
                    }}
                    value={mTreeBytesTokenId}
                    placeholder="TokenId e.g. 0 or 1 or 2 etc" 
                  />
                  <br/>
                  <br/>
                  <div>
                    {mTreeByteRoot &&  <b>{`Merkel Tree Root : ${mTreeByteRoot}`}</b>}
                  </div>
                  <div>
                    {
                      <ReactJson src={mTree} />
                    }
                  </div>
                  <div>
                    {
                      mTreeBytesEntries && mTreeBytesEntries.length && <b>Merkel Tree Entries:</b>
                    }
                    {
                      mTreeBytesEntries && mTreeBytesEntries.length && <ReactJson src={mTreeBytesEntries} />
                    }
                  </div>
                  <Button type="primary" onClick={() => {
                    const newmTreeBytesValues = [...mTreeBytesValues ,[mTreeBytesPubKeys, mTreeBytesBalance, mTreeBytesTokenId ] ]
                    setMTreeBytesValues(newmTreeBytesValues);
                  }}>Add to Values</Button>&nbsp;&nbsp;
                  <Button type="primary" onClick={() => {
                    console.log("mTreeBytesValues: \n", mTreeBytesValues)
                    mTreeBytesValues.sort((a, b) => a[2] - b[2]);
                    console.log("mTreeBytesValues: \n", mTreeBytesValues)
                    let tree = StandardMerkleTree.of(mTreeBytesValues, ['bytes', 'uint128', 'uint256']);
                    setMTreeByte(tree);
                    console.log("root:", tree.root)
                    setMTreeByteRoot(tree.root);
                    // setMTreeRoot(tree.root)
                    // setMTree(tree.dump())
                    const tempTempEntries = []
                    console.log(tree);
                    console.log(tree.dump());
                    for (const [i, v] of tree.entries()) {
                        const proof = tree.getProof(i);
                        console.log("v: \n",v)
                        // const leaf = tree.leafHash([v[0], ''])
                        const entry = {
                          entry: i,
                          value: v,
                          proof: proof,
                        }
                        tempTempEntries.push(entry)
                    }
                    setMTreeBytesEntries(tempTempEntries)
                    console.log(tree.render());
                  }}>Generate Tree</Button>&nbsp;&nbsp;<Button type="primary" onClick={() => {
                    setMTreeBytesValues([]);
                    setMTreeByte({});
                    setMTreeByteRoot("");
                    setMTreeBytesEntries([]);
                    // const testArr = [
                    //   [
                    //     "0x90e8c1460fdb55b944ad4b9ec73275c2ef701311715d6f8766a02d0b0b8f37a21c871fdc9784276ec74515e7a219cbcf",
                    //     "32000000000000000000",
                    //     "0"
                    //   ]
                    // ]
                    // const testTree = StandardMerkleTree.of(testArr, ["bytes", "uint128", "uint256"])
                    // console.log(testTree)
                    // const root = testTree.root;
                    // console.log(root)
                    // const proof = testTree.getProof(0);
                    // console.log(proof)
                  }}>Clear Tree</Button>&nbsp;&nbsp;<Button type="primary" onClick={() => {
                    let currentTrees = [...trees, mTreeByte]
                    setTrees(currentTrees);
                  }}>Save Tree</Button>
              </Panel>
            </Collapse>
          </div>
    </div>
  );
}

export default App;
