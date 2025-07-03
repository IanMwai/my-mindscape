import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const HomePage = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState({ firstName: 'User' });
  const [timeOfDay, setTimeOfDay] = useState('');
  const [soothingMessage, setSoothingMessage] = useState('');

  const soothingMessages = [
    "You are doing great, even when it doesn't feel like it.",
    "Every step forward, no matter how small, is still a step.",
    "What's one small thing you can do for yourself today?",
    "Your feelings are valid. Allow yourself to feel them.",
    "Remember to be kind to yourself, always.",
    "What if you allowed yourself to be exactly where you are right now?",
    "You are stronger than you think.",
    "Take a deep breath. You've got this.",
    "What brings you a sense of peace today?",
    "Growth is a process, not a single event."
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data.firstName ? data : { firstName: 'User' });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    const getTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'morning';
      else if (hour < 18) return 'afternoon';
      else return 'evening';
    };

    const getRandomMessage = () => {
      const index = Math.floor(Math.random() * soothingMessages.length);
      return soothingMessages[index];
    };

    fetchData();
    setTimeOfDay(getTimeOfDay());
    setSoothingMessage(getRandomMessage());
  }, [currentUser]);

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">
        Hello, {userData.firstName}, good {timeOfDay}!
      </h1>
      <div className="my-8 p-8 bg-secondary-bg rounded-lg shadow-lg">
        <p className="text-lg text-text-dark">{soothingMessage}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <Link to="/mood" className="bg-accent-1 p-5 rounded-lg shadow-md hover:shadow-xl transition-shadow aspect-square flex items-center justify-center">
          <h2 className="text-xl font-bold text-white">Mood</h2>
        </Link>
        <Link to="/activities" className="bg-accent-2 p-5 rounded-lg shadow-md hover:shadow-xl transition-shadow aspect-square flex items-center justify-center">
          <h2 className="text-xl font-bold text-white">Activity Recommendations</h2>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;