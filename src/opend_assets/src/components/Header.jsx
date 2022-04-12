import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import homeImage from "../../assets/home-img.png";

// * Switch is gonna look which of these links is triggerd and render the appropiate react component
import { BrowserRouter, Link, Switch, Route } from "react-router-dom";
import Minter from "./Minter";
import Gallery from "./Gallery";

// id of the anonymous user / browser unauthenticated
import CURRENT_USER_ID from "../index";

import { opend } from "../../../declarations/opend";

function Header() {
  // ----- STATE ------
  const [userOwnedGallery, setUserOwnedGallery] = useState();

  async function getNFTs() {
    // * returns an array of the owned Nfts (Principals) of the given user
    const userNFTIds = await opend.getOwnedNFTs(CURRENT_USER_ID);
    // update the gallery in order to render it with the given ids of the given uesr
    setUserOwnedGallery(<Gallery title="My NFT's" ids={userNFTIds} />);
  }

  // when component is first loaded, get the nfts of the current user / gallery
  useEffect(() => {
    getNFTs();
  }, []);

  return (
    // * ---------------- NAVIGATION WITH REACT ------------
    // allow us to define Links
    // refresh header => getNfTs() => updateGallery() => getNfts()
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
      <Switch>
        {/* // add some routes  */}
        <Route path="/" exact>
          <img className="bottom-space" src={homeImage} />
        </Route>
        <Route path="/discover" exact>
          <h1>Discover</h1>
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
