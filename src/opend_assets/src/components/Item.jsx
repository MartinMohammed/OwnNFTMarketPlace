import React, { useEffect, useState } from "react";
import { HttpAgent, Actor } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

// WORK WITH OUR CANISTERS: IDL => Interface Description Language: Bridge Methods
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory } from "../../../declarations/token";

import CURRENT_USER_ID from "../index";

// MAIN BACKEND
import { opend } from "../../../declarations/opend";

// Components
import Button from "./Button";
import PriceLabel from "./PriceLabel";

function Item(props) {
  // -------- React state variables ----------
  const [name, setName] = useState();
  const [owner, setOwner] = useState("");
  const [image, setImage] = useState("");
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState("");
  const [priceLabel, setPriceLabel] = useState();
  const [shouldDisplay, setDisplay] = useState(true);

  // * NEED ID TO access the canister and call its methods (get)
  // TYPE: Principal
  const id = props.id;

  const localhost = "http://localhost:8080/";

  // * to access: Use http requests to fetch that canister on the internet
  // ? host as where the blockchain is located?
  const agent = new HttpAgent({
    host: localhost,
  });

  // Todo: Must be removed when deploying on live icp blockchain
  // ! this code will make the application work locally (not talking to live main
  //  ! internet computer to verify responses)
  agent.fetchRootKey();

  // ? javascript closure
  // * --------------- NFT ACTOR OF THE CURRENT INSTANCE (THIS) -------------
  let NFTActor;
  // Only call once | when item components gets rendered
  async function loadNFT() {
    // createActor => IDL - translation
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      // CANISTER ID (this - Item) of the instantiated NFT
      canisterId: id,
    });

    //  GET INFORMATION ABOUT THIS NFT
    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();

    // ! -------------------- CONVERT NAT8 Array FROM NFT ACTOR (ICP) TO IMAGE URL (STRING) ------------------------
    const imageData = await NFTActor.getAsset();
    // * convert to Uint8Array
    // UINT8 is an 8-bit unsigned integer
    const imageContent = new Uint8Array(imageData);
    // convert imageUrl out of the Uint8Array
    // create a Url out of a blob object -
    // *  blob datatype easy datatype that can be converted from many different formats
    const image = URL.createObjectURL(
      // some additional configs such as the MIME type
      // .Buffer to turn it to a array buffer
      new Blob([imageContent.buffer], { type: "image/png" })
    );

    setName(name);
    // toText() from Principal Import
    setOwner(owner.toText());
    setImage(image);

    // COLLECTION: YOUR OWNED NFTS
    if (props.role == "collection") {
      // check if the current Item is already listed
      const nftIsListed = await opend.isListed(id);
      if (nftIsListed) {
        // set listed Status
        setSellStatus("Listed");
        setOwner("OpenD");
        setBlur({
          //  blur = trüben, verzerren
          filter: "blur(4px)",
        });
      } else {
        // NOT LISTED YET
        setButton(<Button handleClick={handleSell} text={"Sell"} />);
      }
      // RENDER ITEMS FOR DISCOVERY / LISTED NFTS = NO BLUR / DIFFERENT BUTTON
    } else if (props.role == "discover") {
      // ! NFT LISTER ≠ BUY IT
      // originalOwner = current NFT Owner
      const originalOwner = await opend.getOriginalOwner(id);

      // * CHECK IF THE CURRENT USER THAT IS LOGGED IS, IS AT THE SAME TIME THE NFT LISTER
      if (originalOwner.toText() != CURRENT_USER_ID) {
        setButton(<Button handleClick={handleBuy} text={"Buy"} />);
      }
      const price = await opend.getListedNFTPrice(id);
      setPriceLabel(<PriceLabel sellPrice={price.toString()} />);
    }
  }

  useEffect(() => {
    loadNFT();
  }, []);

  // * ------ ONLY HANDLE BUY IF THE CURRENT ITEM HAS DISCOVER ROLE ------
  async function handleBuy() {
    setLoaderHidden(false);

    // Different canister - cross from another project / but same local execution environment
    const tokenActor = Actor.createActor(tokenIdlFactory, {
      agent,
      // actual id of our token canister
      canisterId: Principal.fromText("txssk-maaaa-aaaaa-aaanq-cai"),
    });

    // * TRANSFERRING THE MONEY FROM THE BUYER TO THE SELLER
    const sellerId = await opend.getOriginalOwner(id);
    const itemPrice = await opend.getListedNFTPrice(id);
    // * the caller of the function } the frontend : the buyer
    const transferStatus = await tokenActor.transfer(sellerId, itemPrice);

    if (transferStatus == "Success") {
      // REMOVE THE NFT FROM LISTING / REMOVE NFT FORM SELLER POSSESSION / ADD NFT TO BUYER POSSESSION;
      await opend.completePurchase(id, sellerId, CURRENT_USER_ID);
      setLoaderHidden(true);
      // SHOW THIS ITEM NOT IN THE DISCOVER PAGE - WHEN IT IS SOLD
      setDisplay(false);
    }
  }

  // * usually use state but because we're going to be doing a lot of async calls
  // * not sure if state input is updated before we use to sell item or set price
  let price;
  // * ------ ONLY HANDLE BUY IF THE CURRENT ITEM HAS COLLECTION ROLE ------
  // ! If the current Item is not already listed
  function handleSell() {
    setPriceInput(
      <input
        placeholder="Price in ARI"
        type="number"
        className="price-input"
        value={price}
        onChange={(e) => (price = e.target.value)}
      />
    );
    // CHANGE THE BUTTON BELOW THE NFT (ITS handleClick=method)
    setButton(<Button handleClick={sellItem} text={"Confirm"} />);
  }

  // CALLED through handle Sell, LIST THE NFT & TRANSFER ITS OWNERSHIP TO opend
  async function sellItem() {
    setBlur({
      // some css - blur = trüben, verzerren
      filter: "blur(4px)",
    });
    setLoaderHidden(false);
    // ceiling to avoid errors during passing float to Motoko backend
    // UPDATE listedItems hashmap / create listing with nft id & private type itemOwner, itemPrice
    const listingResult = await opend.listItem(id, Math.ceil(Number(price)));

    // ------------- TRANSFERING OWNERSHIP OF NFT TO opend canister ------------
    // If success: Succesful listed the item in the mapOfListings
    if (listingResult === "Success") {
      const openDId = await opend.getOpenDCanisterID();

      // GIVE OWNERSHIP TO OPEND
      const transferResult = await NFTActor.transferOwnership(openDId);
      if (transferResult === "Success") {
        setLoaderHidden(true);
        // --- empty
        setButton();
        setPriceInput();
        // ---
        setOwner("OpenD");
        setSellStatus("Listed");
      }
    }
  }

  return (
    // SHOW THIS ITEM NOT IN THE DISCOVER PAGE - WHEN IT IS SOLD
    <div
      style={{ display: shouldDisplay ? "inline" : "none" }}
      className="disGrid-item"
    >
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}
            <span className="purple-text"> {sellStatus} </span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
