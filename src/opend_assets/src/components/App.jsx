import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div className="App">
      {/* // HEADER HANDLES NAVIGATION - DYNAMIC RENDERING */}
      <Header />
      <Footer />
    </div>
  );
}

export default App;
