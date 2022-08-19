import React, { useEffect, useState } from "react";
import { Metaplex } from "@metaplex-foundation/js";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import { createTransfer } from "@solana/pay";
import BigNumber from "bignumber.js";

import "./App.css";

const BASE = "orp.edonkiuq.revocsid.tenved-analos".split("").reverse().join("");

// const rpcUrl = clusterApiUrl("devnet");
const rpcUrl = `https://late-weathered-water.${BASE}`;
// const rpcWsUrl = "wss://api.devnet.solana.com";
const rpcWsUrl = `wss://late-weathered-water.${BASE}`;
const connection = new Connection(rpcUrl, { wsEndpoint: rpcWsUrl });
const mx = Metaplex.make(connection);

const TOKEN = "tkRGmpgBHtvR8rksXxMZ4y5GQnVFFx7jywKwkWHX3Tq"
const ADDRESS = "9pRuFihkuA5wzP75xWDoLuLpBhehANoZLrGrySNQRD7T"
const RECIPIENT = "idgq2kjH2vZn1XgsK8NZnqVYnCfkFDbSBJZ2pgj2zfY"

console.log(rpcUrl);
console.log(mx);

function SolBalance() {
  const [address, setAddress] = useState(
    ADDRESS,
  );
  const [balance, setBalance] = useState("?");
  const fetchBalance = async () => {
    let sol = await connection.getBalance(new PublicKey(address));
    sol /= LAMPORTS_PER_SOL;
    setBalance(sol);
    console.log(sol);
  };

  useEffect(() => {
    fetchBalance();
  });

  return (
    <div className="container">
      <h1 className="title">SOL Balance</h1>
      <div className="nftForm">
        <input
          type="text"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
        <button onClick={fetchBalance}>Query Balance</button>
      </div>
      <div className="nftPreview">
        <h1>{balance} SOL</h1>
      </div>
    </div>
  );
}

function PhantomWallet() {
  const [address, setAddress] = useState("");

  const connect = async () => {
    if (!solana) {
      alert("No Phantom wallet found");
      return;
    }
    const { publicKey } = await solana.connect();
    console.log("address", publicKey.toString());
    setAddress(publicKey.toString());
  };

  useEffect(() => {
    connect();
  });

  return (
    <div className="container">
      <h1 className="title">Phantom Wallet</h1>
      <div className="nftForm">
        <button onClick={connect}>
          {solana.publicKey ? "Connected" : "Connect"}
        </button>
      </div>
      <div className="nftPreview">
        <h1>Address: {address}</h1>
      </div>
    </div>
  );
}

function TokenTransfer() {
  const [sender, setSender] = useState(
    ADDRESS,
  );
  const [recipient, setRecipient] = useState(
    RECIPIENT,
  );
  const [amount, setAmount] = useState(
    "1",
  );
  const [result, setResult] = useState(null);

  const transfer = async () => {
    const tx = await createTransfer(connection, new PublicKey(sender), {
      recipient: new PublicKey(recipient),
      amount: new BigNumber(amount),
      splToken: new PublicKey(TOKEN),
      memo: "btwiuse-solana-pay",
    }, { commitment: "finalized" });

    console.log("tx", tx);

    const result = await solana.signAndSendTransaction(tx);
    console.log("result", result);

    setResult(result);
  };

  return (
    <div className="container">
      <h1 className="title">From</h1>
      <div className="nftForm">
        <input
          type="text"
          value={sender}
          onChange={(event) => setSender(event.target.value)}
        />
      </div>
      <h1 className="title">To</h1>
      <div className="nftForm">
        <input
          type="text"
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
        />
      </div>
      <h1 className="title">Amount</h1>
      <div className="nftForm">
        <input
          type="text"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </div>
      <h1 className="title">Transfer</h1>
      <div className="nftForm">
        <button onClick={transfer}>Transfer Token</button>
      </div>
      <div className="nftPreview">
        <textarea value={`${JSON.stringify(result, null, "  ")}`}></textarea>
      </div>
    </div>
  );
}

function TokenBalance() {
  const [address, setAddress] = useState(
    ADDRESS,
  );
  const [balance, setBalance] = useState("?");
  const [ata, setAta] = useState("");

  const fetchATA = async () => {
    let acc = await getAssociatedTokenAddress(
      new PublicKey(TOKEN),
      new PublicKey(address),
    );
    console.log("ata", acc.toString());
    setAta(() => acc.toString());
  };

  const fetchBalance = async () => {
    if (address == "") return;
    await fetchATA();
    if (ata == "") return;
    let tok = await connection.getTokenAccountBalance(new PublicKey(ata));
    console.log("tok", tok.value.decimals, tok.value.amount);
    setBalance(tok.value.amount / 10 ** tok.value.decimals);
  };

  useEffect(() => {
    fetchBalance();
  });

  return (
    <div className="container">
      <h1 className="title">Token Balance</h1>
      <div className="nftForm">
        <input
          type="text"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
        <button onClick={fetchBalance}>Query Balance</button>
      </div>
      <div className="nftPreview">
        <h1>ATA: {ata}</h1>
      </div>
      <div className="nftPreview">
        <h1>{balance} OBS</h1>
      </div>
    </div>
  );
}

function Airdrop() {
  const [address, setAddress] = useState(
    ADDRESS,
  );
  const [status, setStatus] = useState("idle");
  const fetchAirdrop = async () => {
    setStatus("requesting...");
    let sig = await connection.requestAirdrop(
      new PublicKey(address),
      LAMPORTS_PER_SOL,
    );
    // setBalance(num);
    await connection.confirmTransaction(sig);
    console.log("airdropped");
    setStatus("airdropped");
  };

  useEffect(() => {
    // fetchAirdrop();
  });

  return (
    <div className="container">
      <h1 className="title">Airdrop</h1>
      <div className="nftForm">
        <input
          type="text"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
        <button onClick={fetchAirdrop}>Airdrop</button>
      </div>
      <div className="nftPreview">
        <h1>status: {status}</h1>
      </div>
    </div>
  );
}

function FetchNft() {
  const [address, setAddress] = useState(
    "JCWbGwwPzfavajCpEEs4uYZKixFgYNEehtMnsagj5ZVH",
  );
  const [nft, setNft] = useState(null);
  const fetchNft = async () => {
    const nft = await mx.nfts().findByMint(new PublicKey(address));
    setNft(nft);
    console.log(nft);
  };

  return (
    <div className="container">
      <h1 className="title">NFT Mint Address</h1>
      <div className="nftForm">
        <input
          type="text"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
        <button onClick={fetchNft}>Fetch</button>
      </div>
      {nft && (
        <div className="nftPreview">
          <h1>{nft.name}</h1>
          <img
            src={nft.metadata.image}
            alt="The downloaded illustration of the provided NFT address."
          />
          <details>
            <summary>Details</summary>
            <textarea
              className="details"
              readOnly
              value={JSON.stringify(nft, null, "  ")}
            >
            </textarea>
          </details>
        </div>
      )}
    </div>
  );
}

function FetchNfts() {
  const [candyMachineAddress, setCandyMachineAddress] = useState(
    "5McSvWUJJJNp9HyqnT7gTXoC14KwZAm6BhfdVj19Cgay",
  );

  const [nfts, setNfts] = useState(null);

  const updateImg = async (token) => {
    const metadata = await (await fetch(token.uri)).json();
    // setImgs({ ...imgs, [nft.uri]: metadata.image });
    token.image = metadata.image;
    setNfts((prev) => [...(prev ?? []), token]);
    console.log(
      token.uri,
      token.image,
    );
  };

  const fetchNfts = async () => {
    const nfts = await mx.nfts().findAllByCandyMachine(
      new PublicKey(candyMachineAddress),
    );
    // setNfts(nfts);
    console.log(nfts);
    for (let x of nfts) await updateImg(x);
    console.log("done nfts");
  };

  return (
    <div className="container">
      <h1 className="title">Candy Machine ID</h1>
      <div className="nftForm">
        <input
          type="text"
          value={candyMachineAddress}
          onChange={(event) => setAddress(event.target.value)}
        />
        <button onClick={fetchNfts}>Fetch NFTs</button>
      </div>
      {nfts && nfts.slice().map((nft, id) => {
        return (
          <div className="nftPreview" key={id}>
            <h1>{nft.name}</h1>
            {/*imgs[nft.uri] ? () : null*/}
            <img
              src={nft.image}
              alt="The downloaded illustration of the provided NFT address."
            />
            <details>
              <summary>Details</summary>
              <textarea
                className="details"
                readOnly
                value={JSON.stringify(nft, null, "  ")}
              >
              </textarea>
            </details>
          </div>
        );
      })}
    </div>
  );
}

function FetchNftsByOwner() {
  const [ownerAddress, setOwnerAddress] = useState(
    ADDRESS,
  );

  const [ownerNfts, setOwnerNfts] = useState(null);

  const updateOwnerImg = async (token) => {
    console.log("updateOwnerImg", token);
    if (!token.uri) {
      console.log("skip", token);
      return;
    }
    const metadata = await (await fetch(token.uri)).json();
    // setImgs({ ...imgs, [nft.uri]: metadata.image });
    token.image = metadata.image;
    setOwnerNfts((prev) => [...(prev ?? []), token]);
    console.log(
      token.uri,
      token.image,
    );
  };

  const fetchNftsByOwner = async () => {
    const nfts = await mx.nfts().findAllByOwner(
      new PublicKey(ownerAddress),
    );
    // setNfts(nfts);
    console.log("findAllByOwner", nfts);
    for (let x of nfts) await updateOwnerImg(x);
    console.log("done nfts");
  };

  return (
    <div className="container">
      <h1 className="title">Owner ID</h1>
      <div className="nftForm">
        <input
          type="text"
          value={ownerAddress}
          onChange={(event) => setOwnerAddress(event.target.value)}
        />
        <button onClick={fetchNftsByOwner}>Fetch By Owner</button>
      </div>
      {ownerNfts && ownerNfts.slice().map((nft, id) => {
        return (
          <div className="nftPreview" key={id}>
            <h1>{nft.name}</h1>
            {/*imgs[nft.uri] ? () : null*/}
            <img
              src={nft.image}
              alt="The downloaded illustration of the provided NFT address."
            />
            <details>
              <summary>Details</summary>
              <textarea
                className="details"
                readOnly
                value={JSON.stringify(nft, null, "  ")}
              >
              </textarea>
            </details>
          </div>
        );
      })}
    </div>
  );
}

function App() {
  useEffect(() => {
    // fetchNft();
    // fetchNfts();
    // fetchNftsByOwner();
  });

  return (
    <div className="App">
      <PhantomWallet />

      <hr />

      <SolBalance />

      <hr />

      <Airdrop />

      <hr />

      <TokenBalance />

      <hr />

      <TokenTransfer />

      <hr />

      <FetchNft />

      <hr />

      <FetchNfts />

      <hr />

      <FetchNftsByOwner />
    </div>
  );
}

export default App;
