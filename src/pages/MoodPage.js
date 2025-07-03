import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const MoodPage = () => {
  const { currentUser } = useAuth();
  const [moodText, setMoodText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Emojis representing a spectrum of moods
  const emojis = [
    { emoji: '😞', value: 'very_sad' },
    { emoji: '😔', value: 'sad' },
    { emoji: '😐', value: 'neutral' },
    { emoji: '😊', value: 'happy' },
    { emoji: '😁', value: 'very_happy' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!currentUser) {
      setError('You must be logged in to log your mood.');
      return;
    }

    if (!selectedEmoji) {
      setError('Please select an emoji to log your mood.');
      return;
    }

    try {
      await addDoc(collection(db, 'moods'), {
        userId: currentUser.uid,
        moodText,
        selectedEmoji: selectedEmoji.value,
        timestamp: serverTimestamp(),
      });
      setMessage('Mood logged successfully!');
      setMoodText('');
      setSelectedEmoji(null);
    } catch (err) {
      console.error('Error logging mood:', err);
      setError('Failed to log mood. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]"> {/* Adjust min-h to account for header */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-text-dark">How are you feeling today?</h2>

        {message && <p className="bg-green-100 text-green-800 p-3 mb-4 rounded text-center">{message}</p>}
        {error && <p className="bg-red-100 text-red-800 p-3 mb-4 rounded text-center">{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* Text Entry Box */}
          <div className="mb-6">
            <textarea
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-highlight focus:border-transparent resize-y"
              rows="5"
              placeholder="Share what's on your mind..."
              value={moodText}
              onChange={(e) => setMoodText(e.target.value)}
            ></textarea>
          </div>

          {/* Emoji Mood Selector */}
          <div className="flex justify-center space-x-4 mb-6">
            {emojis.map((emojiObj) => (
              <span
                key={emojiObj.value}
                className={`text-5xl cursor-pointer p-2 rounded-full transition-all duration-200 ease-in-out
                  ${selectedEmoji && selectedEmoji.value === emojiObj.value ? 'ring-4 ring-highlight scale-110' : 'hover:scale-105'}`}
                onClick={() => setSelectedEmoji(emojiObj)}
              >
                {emojiObj.emoji}
              </span>
            ))}
          </div>

          {/* Nudging Text */}
          <p className="text-center text-sm italic text-gray-600 mb-6">
            Even a few words can help you understand yourself better.
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-highlight text-white font-bold py-3 px-4 rounded-md hover:bg-opacity-90 transition-colors duration-200 ease-in-out
              disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!selectedEmoji}
          >
            Log Mood
          </button>
        </form>
      </div>
    </div>
  );
};

export default MoodPage;