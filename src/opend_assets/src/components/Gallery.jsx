import React, { useState, useEffect } from "react";
import { Principal } from "@dfinity/principal";

// Components
import Item from "./Item";

function Gallery(props) {
  // NFT ITEMS
  const [items, setItems] = useState();

  function fetchNFTs() {
    // IF IN GIVEN ARRAY are some Principal Id's of the NFTs to create an Item
    if (props.ids != undefined) {
      setItems(
        // RETURN AN ARRAY OF NFT ITEMS
        props.ids.map((NFTId) => {
          // role either: discover/ collection
          return <Item id={NFTId} key={NFTId.toText()} role={props.role} />;
        })
      );
    }
  }
  useEffect(() => {
    fetchNFTs();
  }, []);

  return (
    <div className="gallery-view">
      <h3 className="makeStyles-title-99 Typography-h3">{props.title}</h3>
      <div className="disGrid-root disGrid-container disGrid-spacing-xs-2">
        <div className="disGrid-root disGrid-item disGrid-grid-xs-12">
          <div className="disGrid-root disGrid-container disGrid-spacing-xs-5 disGrid-justify-content-xs-center">
            {items}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gallery;
