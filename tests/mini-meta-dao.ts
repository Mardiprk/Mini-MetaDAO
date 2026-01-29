import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MiniMetaDao } from "../target/types/mini_meta_dao";
import { PublicKey } from "@solana/web3.js";

describe("mini-meta-dao", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.miniMetaDao as Program<MiniMetaDao>;

  const [daoPda, daoBump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("dao"),
    ],
    program.programId
  )

  it("Initializes the DAO", async () => {
    await program.methods
      .initDao()
      .accounts({
        dao: daoPda,
        treasury: treasuryPda,
        governanceMint: new PublicKey(
          "Fp3msc2bHmEu8TkvhhSK1ss7EpMPNzYz1S8LgvbujKxp" // your mint
        ),
        admin: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      
      .rpc();
  
    const daoAccount = await program.account.dao.fetch(daoPda);
    console.log("DAO account:", daoAccount);
  });
  
});
