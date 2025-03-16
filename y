rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /customers/{customerId} {
      allow read, write: if request.auth != null;
    }
    match /histories/{historyId} {
      allow read, write: if request.auth != null;
    }
    match /menus/{menuId} {
      allow read, read: if request.auth != null;
       allow write: if false;
    }
    match /reservations/{reservationId} {
      allow read, write: if request.auth != null;
    }
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
