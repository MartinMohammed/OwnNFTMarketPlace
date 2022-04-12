import React, { useState, useEffect } from "react";
import Item from "./Item";
import { Principal } from "@dfinity/principal";

function Gallery(props) {
  const [items, setItems] = useState();

  // create a NFT Item to show it
  function fetchNFTs() {
    // if the user has some owning nfts
    if (props.ids != undefined) {
      setItems(
        props.ids.map((NFTId) => {
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
