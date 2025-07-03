import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const AccountPage = () => {
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Account Details</h2>
      {userData && (
        <div className="space-y-4">
          <div>
            <p className="font-semibold">First Name:</p>
            <p>{userData.firstName}</p>
          </div>
          <div>
            <p className="font-semibold">Last Name:</p>
            <p>{userData.lastName}</p>
          </div>
          <div>
            <p className="font-semibold">Email:</p>
            <p>{userData.email}</p>
          </div>
        </div>
      )}
      <div className="mt-8 flex flex-col space-y-4">
        <button onClick={logout} className="w-full bg-highlight text-white py-2 px-4 rounded hover:bg-opacity-90">Logout</button>
        <button className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-opacity-90">Delete Account</button>
        <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-opacity-90">Refer a Friend</button>
      </div>
    </div>
  );
};

export default AccountPage;