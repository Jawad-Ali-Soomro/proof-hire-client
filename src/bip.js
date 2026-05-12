import * as bip39 from "bip39";

const mnemonic = bip39.generateMnemonic(256);
console.log(mnemonic);