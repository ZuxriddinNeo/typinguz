import { writeFileSync, existsSync } from "fs";

const stub = `export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};
`;

const files = [
  "src/ts/constants/firebase-config.ts",
  "src/ts/constants/firebase-config-live.ts",
];

for (const f of files) {
  if (!existsSync(f)) {
    writeFileSync(f, stub);
    console.log(`Created stub: ${f}`);
  }
}
