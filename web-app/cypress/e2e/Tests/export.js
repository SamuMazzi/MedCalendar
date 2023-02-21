import { initializeFirebaseApp, restore } from 'firestore-export-import'

import serviceAccount from '../../assets/credential.json' assert {type: 'json'};

//* Per fare test:
/**
 * 1. mettere "type": "module" in package.json
 * 2. Far partire emulator
 * 3. Eseguire questo script
 npm run load_data_firestore
 * 4. Togliere "type": "module"
 * 5. Far partire i test
 */
/*import * as fs from 'fs/promises'


const doBackupFirestore = async () => {
  //! Agisce direttamente sul vero database
  //initializeFirebaseApp(serviceAccount)
  const data = await backups()
  console.log(data)
  const json = JSON.stringify(data)
  await fs.writeFile(nameFile, json, {encoding: 'utf8'});
} */

const nameFile = './cypress/e2e/Tests/backup.json'
export const restoreDataToFirestore = async () => {
  const appName = '[DEFAULT]'
  const options = {
    firestore: {
      host: 'localhost:8080',
      ssl: false,
    },
  }
  initializeFirebaseApp(serviceAccount, appName, options)
  await restore(nameFile, {
      autoParseDates: true
  })
}

restoreDataToFirestore().then(() => console.log('Dati caricati su Firestore Emulator'))