import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Principal } from "@dfinity/principal";
import { opend } from "../../../declarations/opend";

// Main backend
import Item from "./Item";

function Minter() {
  // useForm - not native react hook
  // * =>object that we can tap into in order to register and add in all of the inputs
  // * that the user create on our form
  const { register, handleSubmit } = useForm();

  const [nftPrincipal, setNFTPrincipal] = useState("");
  const [loaderHidden, setLoaderHidden] = useState(true);

  // * triggered by handleSubmit / pass Input VALUES
  async function onSubmit(data) {
    setLoaderHidden(false);

    const name = data.name;

    // * ----------- CONVERTING IMAGE TO NAT8 ---------------
    // got some unecessary metadata
    const image = data.image[0];

    // arrayBuffer object is used to represent a generic, fixed-length raw binary data buffer.
    // * from blob the method which returns an promise / blob content -> binary data in array buffer
    const imageArray = await image.arrayBuffer();

    // match NAT8 datatype
    const imageByteData = [...new Uint8Array(imageArray)];

    // ! ------------------- MINTING PROCESS ---------------
    //  * mint nft via main backend (store nfts in hashmap: mapOfNFTS)
    //  * to create programmtically new canisters backend-to-backend interaction

    const newNFTID = await opend.mint(imageByteData, name);
    setNFTPrincipal(newNFTID);
    setLoaderHidden(true);
  }

  // * Only Mint on NFT once a Minter Component rendering (states will be reseted)
  // IF NO NFT WAS MINTED yet
  if (nftPrincipal == "") {
    return (
      <div className="minter-container">
        <div hidden={loaderHidden} className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <h3 className="makeStyles-title-99 Typography-h3 form-Typography-gutterBottom">
          Create NFT
        </h3>
        <h6 className="form-Typography-root makeStyles-subhead-102 form-Typography-subtitle1 form-Typography-gutterBottom">
          Upload Image
        </h6>
        <form className="makeStyles-form-109" noValidate="" autoComplete="off">
          <div className="upload-container">
            <input
              {...register("image", { required: true })}
              className="upload"
              type="file"
              accept="image/x-png,image/jpeg,image/gif,image/svg+xml,image/webp"
            />
          </div>
          <h6 className="form-Typography-root makeStyles-subhead-102 form-Typography-subtitle1 form-Typography-gutterBottom">
            Collection Name
          </h6>
          <div className="form-FormControl-root form-TextField-root form-FormControl-marginNormal form-FormControl-fullWidth">
            <div className="form-InputBase-root form-OutlinedInput-root form-InputBase-fullWidth form-InputBase-formControl">
              <input
                // register the name / + validation
                {...register("name", { required: true })}
                placeholder="e.g. CryptoDunks"
                type="text"
                className="form-InputBase-input form-OutlinedInput-input"
              />
              <fieldset className="PrivateNotchedOutline-root-60 form-OutlinedInput-notchedOutline"></fieldset>
            </div>
          </div>
          <div className="form-ButtonBase-root form-Chip-root makeStyles-chipBlue-108 form-Chip-clickable">
            <span onClick={handleSubmit(onSubmit)} className="form-Chip-label">
              Mint NFT
            </span>
          </div>
        </form>
      </div>
    );
  } else {
    // MINTING WAS SUCCESSFULL
    return (
      <div className="minter-container">
        <h3 className="Typography-root makeStyles-title-99 Typography-h3 form-Typography-gutterBottom">
          Minted!
        </h3>
        <div className="horizontal-center">
          {/* // show the minted nft  */}
          <Item id={nftPrincipal} />
        </div>
      </div>
    );
  }
}
export default Minter;
