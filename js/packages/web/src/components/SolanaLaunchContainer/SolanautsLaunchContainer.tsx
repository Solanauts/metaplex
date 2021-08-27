import SolanautLaunchCard  from "../SolanautLaunchCard";
import SolanautContext from "../../contexts/meta/solanautContext";

function SolanautsLaunchContainer ()
{
  /*const Test = () => (
    <>
      <div>
        <p>Test 1</p>
      </div>
    </>
  );*/
  const transferNFT = {
    receive(data: string): string{
      console.log('The NFT has been transferred to the collector: ', data)
      return data;
    }
  }
  const removeRights = {
    // Remove rights will have to return both PublicKey and NFT to TransferNFT
    notify(data: string): string {
      console.log('Full rights have been removed: ', data)
      return transferNFT.receive(data);
    }
  }
  const findNFT = {
    notify(data: string): string{
      console.log('The NFT has been found: ', data)
      return removeRights.notify(data);
    }
  }

  return (
    <SolanautContext.Provider value={{isPaid: false}}>
        <SolanautLaunchCard />
        <div>
          { findNFT.notify('Solanaut Launchpad') }
        </div>
    </SolanautContext.Provider>
  )
}
export default SolanautsLaunchContainer;


