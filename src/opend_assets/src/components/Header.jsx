import React, { useEffect, useState } from "react";
import { BrowserRouter, Link, Switch, Route } from "react-router-dom";

import CURRENT_USER_ID from "../index";

// Static assets
import logo from "../../assets/logo.png";
import homeImage from "../../assets/home-img.png";

import { opend } from "../../../declarations/opend";

// Components
import Minter from "./Minter";
import Gallery from "./Gallery";

function Header() {
  // ----- STATE ------
  const [userOwnedGallery, setUserOwnedGallery] = useState();
  const [listingGallery, setListingGallery] = useState();

  // TO SET OUR GALLERY COMPONENTS WE NEED SOME NFT ID's
  async function getNFTs() {
    // * REUTRN: Array of Principals (owned NFTs) of provided user;
    const userNFTIds = await opend.getOwnedNFTs(CURRENT_USER_ID);
    // RENDER: USER OWNED NFTs
    setUserOwnedGallery(
      <Gallery title="My NFT's" ids={userNFTIds} role="collection" />
    );

    // * RETURN: Array of Principals (listed NFT's);
    const listedNFTIds = await opend.getListedNFTs();
    setListingGallery(
      <Gallery title="Listed NFT's" ids={listedNFTIds} role="discover" />
    );
  }

  useEffect(() => {
    // Initial rendering: render userOwnedGallery; setListingGallery;
    // } => fetch NFT Principals from the Backend
    getNFTs();
  }, []);

  return (
    // * ---------------- NAVIGATION WITH REACT ------------
    // allow us to define Links
    // refresh header => getNFTs() => rerender Gallery = fetch new Items, if available?
    <BrowserRouter forceRefresh={true}>
      <div className="app-root-1">
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <img className="header-logo-11" src={logo} />
            <div className="header-vertical-9"></div>
            <h5 className="Typography-root header-logo-text">
              <Link to="/">OpenD</Link>
            </h5>
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/discover">Discover</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter">Minter</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/collection" usernftids={userOwnedGallery}>
                My NFTs
              </Link>
            </button>
          </div>
        </header>
      </div>
      {/* LOOK AT CURRENT ROUTE AND RENDER CORRESPONDING COMPONENT - DYNAMIC RENDERING */}
      <Switch>
        {/* // add some routes  */}
        <Route path="/" exact>
          <img className="bottom-space" src={homeImage} />
        </Route>
        <Route path="/discover" exact>
          {listingGallery}{" "}
        </Route>

        <Route path="/minter" exact>
          <Minter />
        </Route>
        <Route path="/collection" exact>
          {/* // render bunch of items / grid view  */}
          {userOwnedGallery}
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default Header;
