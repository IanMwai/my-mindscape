import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const UpdatePreferencesPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // State for preferences
  const [musicGenres, setMusicGenres] = useState([]);
  const [bookGenres, setBookGenres] = useState([]);
  const [movieGenres, setMovieGenres] = useState([]);
  const [physicalActivities, setPhysicalActivities] = useState([]);
  const [otherInterests, setOtherInterests] = useState('');

  // Predefined options for preferences
  const allMusicGenres = ['Pop', 'Rock', 'Classical', 'Jazz', 'Hip Hop', 'Electronic', 'Country'];
  const allBookGenres = ['Fiction', 'Non-Fiction', 'Fantasy', 'Sci-Fi', 'Mystery', 'Thriller', 'Biography'];
  const allMovieGenres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Animation'];
  const allPhysicalActivities = ['Walking', 'Running', 'Yoga', 'Cycling', 'Swimming', 'Dancing', 'Hiking'];

  // Fetch existing preferences on component mount
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!currentUser) {
        setError('You must be logged in to update preferences.');
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const prefs = userDocSnap.data().activityPreferences || {};
          setMusicGenres(prefs.musicGenres || []);
          setBookGenres(prefs.bookGenres || []);
          setMovieGenres(prefs.movieGenres || []);
          setPhysicalActivities(prefs.physicalActivities || []);
          setOtherInterests(prefs.otherInterests || '');
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError('Failed to load your preferences.');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [currentUser]);

  // Handle checkbox changes
  const handleCheckboxChange = (list, setList, value) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!currentUser) {
      setError('You must be logged in to update preferences.');
      setLoading(false);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        activityPreferences: {
          musicGenres,
          bookGenres,
          movieGenres,
          physicalActivities,
          otherInterests: otherInterests.split(',').map(tag => tag.trim()).filter(tag => tag !== ''), // Convert comma-separated string to array
        },
      }, { merge: true }); // Use merge to only update activityPreferences field
      setMessage('Preferences updated successfully!');
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to update preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-text-dark text-lg">Loading preferences...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-text-dark">Update Your Preferences</h2>

        {message && <p className="bg-green-100 text-green-800 p-3 mb-4 rounded text-center">{message}</p>}
        {error && <p className="bg-red-100 text-red-800 p-3 mb-4 rounded text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Music Genres */}
          <div>
            <label className="block text-lg font-semibold text-text-dark mb-2">Music Genres</label>
            <div className="flex flex-wrap gap-2">
              {allMusicGenres.map(genre => (
                <label key={genre} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox text-highlight rounded"
                    value={genre}
                    checked={musicGenres.includes(genre)}
                    onChange={() => handleCheckboxChange(musicGenres, setMusicGenres, genre)}
                  />
                  <span className="ml-2 text-gray-700">{genre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Book Genres */}
          <div>
            <label className="block text-lg font-semibold text-text-dark mb-2">Book Genres</label>
            <div className="flex flex-wrap gap-2">
              {allBookGenres.map(genre => (
                <label key={genre} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox text-highlight rounded"
                    value={genre}
                    checked={bookGenres.includes(genre)}
                    onChange={() => handleCheckboxChange(bookGenres, setBookGenres, genre)}
                  />
                  <span className="ml-2 text-gray-700">{genre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Movie Genres */}
          <div>
            <label className="block text-lg font-semibold text-text-dark mb-2">Movie Genres</label>
            <div className="flex flex-wrap gap-2">
              {allMovieGenres.map(genre => (
                <label key={genre} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox text-highlight rounded"
                    value={genre}
                    checked={movieGenres.includes(genre)}
                    onChange={() => handleCheckboxChange(movieGenres, setMovieGenres, genre)}
                  />
                  <span className="ml-2 text-gray-700">{genre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Physical Activities */}
          <div>
            <label className="block text-lg font-semibold text-text-dark mb-2">Physical Activities</label>
            <div className="flex flex-wrap gap-2">
              {allPhysicalActivities.map(activity => (
                <label key={activity} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox text-highlight rounded"
                    value={activity}
                    checked={physicalActivities.includes(activity)}
                    onChange={() => handleCheckboxChange(physicalActivities, setPhysicalActivities, activity)}
                  />
                  <span className="ml-2 text-gray-700">{activity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Other Interests */}
          <div>
            <label className="block text-lg font-semibold text-text-dark mb-2" htmlFor="otherInterests">
              Other Interests (comma-separated)
            </label>
            <input
              type="text"
              id="otherInterests"
              className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-highlight focus:border-transparent"
              placeholder="e.g., painting, coding, gardening"
              value={otherInterests}
              onChange={(e) => setOtherInterests(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-highlight text-white font-bold py-3 px-4 rounded-md hover:bg-opacity-90 transition-colors duration-200 ease-in-out"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePreferencesPage;