import React, { useEffect, useState } from "react";
import { Metaplex } from "@metaplex-foundation/js";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import "./App.css";

const BASE = "orp.edonkiuq.revocsid.tenved-analos".split("").reverse().join("");

// const rpcUrl = clusterApiUrl("devnet");
const rpcUrl = `https://late-weathered-water.${BASE}`;
// const rpcWsUrl = "wss://api.devnet.solana.com";
const rpcWsUrl = `wss://late-weathered-water.${BASE}`;
const connection = new Connection(rpcUrl, { wsEndpoint: rpcWsUrl });
const mx = Metaplex.make(connection);

console.log(rpcUrl);
console.log(mx);

function TokenBalance() {
  const [address, setAddress] = useState(
    "9pRuFihkuA5wzP75xWDoLuLpBhehANoZLrGrySNQRD7T",
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

function Airdrop() {
  const [address, setAddress] = useState(
    "9pRuFihkuA5wzP75xWDoLuLpBhehANoZLrGrySNQRD7T",
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
    fetchAirdrop();
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
    "9pRuFihkuA5wzP75xWDoLuLpBhehANoZLrGrySNQRD7T",
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
      <TokenBalance />

      <hr />

      <Airdrop />

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
