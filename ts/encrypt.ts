import * as Crypt from "./Crypt";
/*
Encrypts the ./.secrets_all.json file, which consists of secrets as described in the SecretsAll and related interfaces in ./Crypt
*/
Crypt.encryptAllSecrets().catch(console.error);