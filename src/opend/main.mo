import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import List "mo:base/List";

// import nft actor 
import NFTActorClass "./../NFT/nft";

actor OpenD {
    // ---------------------- HASHMAPS / LEDGER / STORE ------------------
    /* HASHMPAPS
        > mapOfNFTS: keeps track of the minted nfts(canisterId) and linked to NFT Canister instance
            * maping: Principal of the creator & the minted nft actor / canister 

        > mapOfOwners: one-to-many relationship /
            * mapping:  Principal of aowner and a List of nfts (principals) he got

        > mapOfListings: 
            * mapping: The Principal ID OF THE NFT, value => custom type (hold bunch of information (owner, price, historic records of sale...))
    */
    // * new datatype | Schema
    private type Listing = {
        // props 
        itemOwner: Principal;
        itemPrice: Nat; 
    };

    var mapOfNFTS = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash);
    var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);
    var mapOfListings = HashMap.HashMap<Principal, Listing>(1, Principal.equal, Principal.hash);


    // * ------------- CREATE A NEW NFT / CANISTER / ACTOR OF NFT ACTOR CLASS ---------------
    // pincipal of the newly created canister / nft 
    public shared (msg) func mint(imgData: [Nat8], name: Text) : async Principal{
        // * access the identity of the method caller (minter) / authenticated user !
        let owner: Principal = msg.caller; 

        // * programmatic creation of our NFT canister / initialize with the args 
        // * init the actor class = object 

        // ! create new canister on the actual ICP network => allocate it some cycles 
        // * experimental => people involved in governance for dfinity : 
        // they dont know exactly how to implement this cycles module in future

        // * Cycles will come from main canister / it takes 100_000_000_000 for creating a new canister 
        // and the rest to keep the canister running 
        Cycles.add(100_500_000_000);
        let newNFT = await NFTActorClass.NFT(name, owner, imgData);
        Debug.print(debug_show(Cycles.balance()));

        let newNFTPrincipal = await newNFT.getCanisterId();

        mapOfNFTS.put(newNFTPrincipal, newNFT);
        addToOwnershipMap(owner, newNFTPrincipal);

        return newNFTPrincipal;
    };

    // ----------------- ADD NEWLY MINTED NFT TO OWNER --------------
    private func addToOwnershipMap(owner: Principal, nftId: Principal){
        // FIND the owner in the mapOfOwners => if found: add nft in his list
        // else return empty list and add nft in his list 
        var ownedNFTs : List.List<Principal> = switch(mapOfOwners.get(owner)){
            // initialize empty List 
            case (null) List.nil<Principal>();
            case (?result) result; 
        };
        // push new nftId Principal into the ownedNFT's List of the given owner 
        ownedNFTs := List.push(nftId, ownedNFTs);
        // overwrite key if necessary and update its ownedNFT's
        mapOfOwners.put(owner, ownedNFTs);
    };

    // ----------------- GET THE NFT PRINCIPALS OF A GIVEN USER --------------
    public query func getOwnedNFTs(user: Principal) : async [Principal]{
        let userNFTs : List.List<Principal> = switch(mapOfOwners.get(user)){
            case null List.nil<Principal>();
            case (?result) result; 
        };
        // * in order for our progam to work with the List of NFT Principals of the given user
        return List.toArray(userNFTs);
    };

    // ------------------- KEEP TRACK OF LISTED ITEMS ----------------
    // NFT ID & its listing price of the given owner from msg.caller
    public shared(msg) func listItem(id: Principal, price: Nat) : async Text{
        var item : NFTActorClass.NFT = switch(mapOfNFTS.get(id)){
            // return text for the function / exit 
            case null return "NFT does not exist."; 
            case (?result) result; 
        };
        // the msg.caller must == the person who owns the nft (MapOfNFTS)
        // item = NFT Actor class instance = methods async 
        let owner = await item.getOwner();
        // * check if two principals equal
        if(Principal.equal(owner, msg.caller)){
            // actual owner is allowed to list the NFT
            let newListing : Listing = {
                itemOwner = owner;
                itemPrice = price; 
            };
            mapOfListings.put(id, newListing);
            return "Success";
        }else{
            return "You don't own the NFT.";
        };
    };
        // --------------------- CHECK IF A GIVEN NFT IS LISTED -----------------
        public query func isListed(id: Principal) : async Bool{
            if(mapOfListings.get(id) == null){
                return false; 
            }
            else{
                return true; 
            };
        };
    // ---------------------- GET THIS CANISTER ID -----------------
        public query func getOpenDCanisterID() : async Principal{
        // ! this actor is not a actor class
        return Principal.fromActor(OpenD);
    };
};
