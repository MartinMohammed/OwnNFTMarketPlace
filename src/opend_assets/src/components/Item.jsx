import React, { useEffect, useState } from "react";
import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal";

// access the IDL methods of the actors
import { opend } from "../../../declarations/opend";

import logo from "../../assets/logo.png";
import Button from "./Button";
import PriceLabel from "./PriceLabel";
import CURRENT_USER_ID from "../index";

function Item(props) {
  // -------- React state variables ----------
  // initial state = undefined
  const [name, setName] = useState();
  const [owner, setOwner] = useState("");
  const [image, setImage] = useState("");
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState("");
  const [priceLabel, setPriceLabel] = useState();

  // * NEED ID TO access the canister and call its methods (get)
  // Datatype Principal
  const id = props.id;

  const localhost = "http://localhost:8080/";
  // comes from dfinity helps:
  // * to access: Use http requests to fetch that canister on the internet
  // and it will use the localhost to request ?
  const agent = new HttpAgent({
    host: localhost,
  });

  // Todo: Must be removed when deploying on live icp blockchain
  // ! this code will the application work locally (not talking to live main
  // internet computer to verify responses)
  agent.fetchRootKey();

  // ? javascript closure
  let NFTActor;
  // Only call once | when item components gets rendered
  async function loadNFT() {
    // createActor = makes the particular the actor/nft available for us in javascript
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      // canister id of the instantiated Nft actor
      canisterId: id,
    });

    //  CALL NFT METHODS
    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();

    // ! -------------------- CONVERT NAT8 Array FROM NFT ACTOR (ICP) TO IMAGE URL ------------------------
    const imageData = await NFTActor.getAsset();
    // * convert to Uint8Array
    // UINT8 is an 8-bit unsigned integer
    const imageContent = new Uint8Array(imageData);
    // convert imageUrl out of the Uint8Array
    // create a Url out of a blob object -  blob datatype easy datatype that can be converted from many different formats
    const image = URL.createObjectURL(
      // some additional configs such as the MIME type
      // .Buffer to turn it to a array buffer
      new Blob([imageContent.buffer], { type: "image/png" })
    );

    setName(name);
    // from Principal Import
    setOwner(owner.toText());
    setImage(image);

    // Render Items for the collection
    if (props.role == "collection") {
      // Initial rendering check if the current Item is already listed
      const nftIsListed = await opend.isListed(id);
      if (nftIsListed) {
        // set listed Status
        setSellStatus("Listed");
        setOwner("OpenD");
        setBlur({
          // some css - blur = trüben, verzerren
          filter: "blur(4px)",
        });
      } else {
        setButton(<Button handleClick={handleSell} text={"Sell"} />);
      }
      // RENDER ITEMS FOR DISCOVERY / LISTED NFTS = NO BLUR / DIFFERENT BUTTON
    } else if (props.role == "discover") {
      // ! The person who listed this nft should not be able to buy it
      const originalOwner = await opend.getOriginalOwner(id);
      // * CHECK IF THE CURRENT USER THAT IS LOGGED IS, IS AT THE SAME TIME THE NFT LISTER
      if (originalOwner.toText() != CURRENT_USER_ID) {
        setButton(<Button handleClick={handleBuy} text={"Buy"} />);
      }
      const price = await opend.getListedNFTPrice(id);
      setPriceLabel(<PriceLabel sellPrice={price.toString()} />);
    }
  }

  async function handleBuy() {
    console.log("Buy was triggered.");
  }

  useEffect(() => {
    loadNFT();
  }, []);

  // * usually use state but because we're going to be doing a lot of async calls
  // * not sure if state input is updated before we use to sell item or set price
  let price;
  // ------------- ASK USER FOR PRICE ----------
  function handleSell() {
    console.log("Sell clicked");
    setPriceInput(
      <input
        placeholder="Price in ARI"
        type="number"
        className="price-input"
        value={price}
        onChange={(e) => (price = e.target.value)}
      />
    );
    // Update Button component / make the real sell
    setButton(<Button handleClick={sellItem} text={"Confirm"} />);
  }

  // user confirmed to sell the item / list the item in a hashmap in the main backend
  async function sellItem() {
    setBlur({
      // some css - blur = trüben, verzerren
      filter: "blur(4px)",
    });
    setLoaderHidden(false);
    // ceiling to avoid errors during passing float to Motoko backend
    const listingResult = await opend.listItem(id, Math.ceil(Number(price)));
    console.log("listing: ", listingResult);

    // If success: Succesful listed the item in the mapOfListings
    // ------------- TRANSFERING OWNERSHIP OF NFT TO opend canister ------------
    if (listingResult === "Success") {
      // call by the frontend !
      // now we need to get the particular nft that was clicked | props.id
      // new owner will be the opend canister
      const openDId = await opend.getOpenDCanisterID();
      const transferResult = await NFTActor.transferOwnership(openDId);
      console.log("transfer: ", transferResult);
      if (transferResult === "Success") {
        setLoaderHidden(true);
        setButton();
        setPriceInput();
        setOwner("OpenD");
        setSellStatus("Listed");
      }
    }
  }

  return (
    <div className="disGrid-item">
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
