/* 
mints.txt / wallets.txt

24crAY9fhdzR3uWMPYL4TEN6CwPpeKLRsNxxB48qkPkr
2AG9wpc1R7UvS9rc6xwHEUX4eG6TbfdvpxJ9HQLcocb2
2Bg7uM45GYwYqYZte7z6b4dgzGXWieAkKDJr2rnTtwU5
2hkEcdpyCTFyLjAyJSkBYtj5mQi1PGwGf4NMEKWWnoHi
2jCcNnSZie3iiXTSQNSsWfLZ9ZhUU84y5E9j82PLVBmS

*/

// make sure you have solana cli installed and configured
//
// run "npm install shelljs" in the script directory before running the script
const airdrop = (() => {
  const shell = require("shelljs");
  const fs = require("fs");

  // Configure your airdrop
  // const yourToken = "9RbTen9wL7hTZRKZUMBPNpGGKsjRAM8LHokphuoCWK5w"
  const numberToAirdrop = 1;
  const pathToTheWLFile = "./wallets.txt";
  const pathToTheMintsFile = "./mints.txt";

  const wlFile = fs
    .readFileSync(pathToTheWLFile)
    .toString()
    .replace(/\r/g, "")
    .split("\n");
  const mintsFile = fs
    .readFileSync(pathToTheMintsFile)
    .toString()
    .replace(/\r/g, "")
    .split("\n");

  // console.log(wlFile)

  for (const [index, address] of wlFile.entries()) {
    const mint = mintsFile[index];
    if (address.includes("(sent) ")) {
      console.log(
        `[${index}] Skipping ${address} as has been processed before`
      );
      continue;
    }

    console.time("Sent in");

    console.log(`[${index}] Airdropping 1 of ${mint} to ${address}`);
    const output = shell.exec(
      `spl-token transfer ${mint} 1 ${address} ---allow-unfunded-recipient --fund-recipient -v`
    );

    if (
      output.stderr &&
      output.code !== 0 &&
      !output.stderr.includes("unable to confirm transaction")
    ) {
      throw new Error(
        `[${index}] Failed to send token to the ${address} ` +
          `if you see the transaction id and transaction confirmation failed make sure to confirm that transaction manually and if it has succeeded set the line number ${index} ` +
          `in your ${pathToTheWLFile} file to '${
            "(sent) " + wlFile[index]
          }' to skip the upload for this address`
      );
    }

    wlFile[index] = "(sent) " + wlFile[index];
    fs.writeFileSync(pathToTheWLFile, wlFile.join("\n"));
    console.log(
      `[${index}] Airdropping ${numberToAirdrop} of ${mint} to ${address} has been successful\n\n`
    );
    console.timeEnd("Sent in");
  }

  const notDone = wlFile.find((i) => !i.includes("(sent)"));
  if (notDone) {
    console.log("Upload did not finish for all the addresses please re run");
    return;
  }

  console.log("Upload is done ! All the tokens have been airdropped !");
})();
