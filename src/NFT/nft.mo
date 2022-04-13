
// * ---------------- EACH INSTANTIATED INSTANCE OF THE NFT ACTOR CLASS YIELD NEW PRINCIPAL ID ---------------
// THIS PRINCIPAL Id will uniquely identify the NFT 
// simple smart contract for how to create a new NFT programmtically using the Internet Computer; 
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
// content = image data -> array of eight bit natural numbers | encoding version bits & bytes | raw data 

// after NFT => the arguments passed for the instantiated NFT actor

// bind the this keyword to this actor class which represents this entire actor class 
// * because the this should refer to the instantiated object 
actor class NFT(name: Text, owner: Principal, content: [Nat8]) = this {
    Debug.print("It worked");

    // construction of the instance 
    private let itemName = name; 
    // the owner can change by the time 
    private  var nftOwner = owner; 
    private let imageBytes = content; 

    // * ------------------ GET INFORMATION ABOUT NFT -------------------
    public query func getName() : async Text{
        return itemName; 
    };

    public query func getOwner() : async Principal {
        return nftOwner; 
    };

    public query func getAsset() : async [Nat8]{
        return imageBytes; 
    };

    public query func getCanisterId() : async Principal{
        // * take an actor and give you back the principal of the given actor 
        // ! if just an actor we could pass its name, but is a actor class (with args) we have to pass this 
        return Principal.fromActor(this); 
    };

    // ------------------- TRANSFER THE NFT OWNERSHIP ---------------
    // * but only transfer if the caller of the function is the owner itself 
    public shared(msg) func transferOwnership(newOwner: Principal) : async Text{
        if (msg.caller == nftOwner){
            // go ahead with transfer 
            // modify the private property of the canister; 
            nftOwner := newOwner; 
            return "Success";
        }else{
            return "Error: Not initated by NFT Owner.";
        };
    };
}