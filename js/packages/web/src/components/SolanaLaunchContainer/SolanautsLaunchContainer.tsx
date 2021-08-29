import SolanautLaunchCard  from "../SolanautLaunchCard";
import SolanautContext from "../../contexts/meta/solanautContext";
import { useState } from "react";

function SolanautsLaunchContainer ()
{
  const [ findingNFT, setFindingNFT ] = useState(null );
  const [ nftRights, setNFTRights ] = useState('Full Rights' );
  const [ transferringNFT, setTransferringNFT ] = useState(null );
  /*const Test = () => (
    <>
      <div>
        <p>Test 1</p>
      </div>
    </>
  );*/
  const transferNFT = {
    endChain( data: string ): string{
      console.log('The NFT has been transferred to the collector: ', data )
      return data;
    }
  }
  const removeRights = {
    // Remove rights will have to return both PublicKey and NFT to TransferNFT
    nextChain(data: string): string {
      console.log('Full rights have been removed: ', data)
      return transferNFT.endChain(data);
    }
  }
  const findNFT = {
    startChain(data: string): string{
      console.log('The NFT has been found: ', data)
      return removeRights.nextChain(data);
    }
  }

  return (
    <SolanautContext.Provider value={{isPaid: false}}>
        <SolanautLaunchCard />
        <div>
          { findNFT.startChain('Solanaut Launchpad') }
        </div>
    </SolanautContext.Provider>
  )
}
export default SolanautsLaunchContainer;


