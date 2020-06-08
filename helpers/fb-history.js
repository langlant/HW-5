import * as firebase from 'firebase';
import 'firebase/database';
import { firebaseConfig } from './fb-config';

export function initHistoryDB() {
  firebase.initializeApp(firebaseConfig);
}

export function storeHistoryItem(item) {
  firebase.database().ref('historyData/').push(item);
}

export function setupHistoryListener(updateFunc) {
  firebase
    .database()
    .ref('historyData/')
    .on('value', (snapshot) => {
      if (snapshot?.val()) {
        const fbObject = snapshot.val();
        const newArr = [];
        Object.keys(fbObject).map((key, index) => {
          newArr.push({ ...fbObject[key], id: key });
        });
        updateFunc(newArr);
      } else {
        updateFunc([]);
      }
    });
} 