import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import Item from "./Item";
import Minter from "./Minter";

// also not a native react entity

// const NFTID = "rrkah-fqaaa-aaaaa-aaaaq-cai";

function App() {
  return (
    <div className="App">
      <Header />

      {/* <Minter /> */}
      {/* <Item id={NFTID} /> */}
      <Footer />
    </div>
  );
}

export default App;
