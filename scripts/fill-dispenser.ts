const yargs = require("yargs");
const { exec } = require("child_process");
const { isPublicKey } = require("@metaplex-foundation/umi");

const argv = yargs
  .command("$0 <input>", "Echo the input string", (yargs: any) => {
    yargs.positional("input", {
      description: "Input string for the echo command",
      type: "string",
    });
  })
  .help()
  .alias("help", "h").argv;

const input = argv.input;

const testTokens = [
  "C6XSdTg4eQUUtqyCVTBeW7HooJjTjTo2VpAFnKqzLTTx",
  "4aGKqBXe1hHKa5EQ5wWwVD41V4ULpadnSdZ7AK7oqPTV",
  "Bps4xb2Pn94zywNVYqF2TAhxma9ccjfCzQdrNWsuYWgd",
];

const fillWithToken = (input: string, tokenAddress: string) => {
  exec(
    `spl-token transfer ${tokenAddress}  1000000 ${input} --allow-non-system-account-recipient --fund-recipient`,
    (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`Filling with 1000000 of ${tokenAddress}...`);
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
    }
  );
};

if (input && isPublicKey(input)) {
  testTokens.forEach((tokenAddress) => {
    fillWithToken(input, tokenAddress);
  });
} else {
  console.log("Please provide a valid public key");
}
