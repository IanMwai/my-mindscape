import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const ActivityRecommendationsPage = () => {
  const { currentUser } = useAuth();
  const [userPreferences, setUserPreferences] = useState({});
  const [allStaticActivities, setAllStaticActivities] = useState([]);
  const [recommendedActivities, setRecommendedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1) Fetch user prefs + static activities once
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setError('You must be logged in to view activity recommendations.');
        setLoading(false);
        return;
      }

      try {
        // user prefs
        const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (userSnap.exists()) {
          setUserPreferences(userSnap.data().activityPreferences || {});
        }

        // static activities
        const snapshot = await getDocs(collection(db, 'staticActivities'));
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setAllStaticActivities(data);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // 2) Recommendation engine
  const generateRecommendations = useCallback(() => {
    const num = 3;
    if (allStaticActivities.length === 0) {
      setRecommendedActivities([]);
      return;
    }

    // filter by prefs
    const filtered = allStaticActivities.filter(act => {
      const { category, genre, title, tags = [] } = act;
      const prefs = userPreferences;

      if (category === 'music' && prefs.musicGenres) {
        return prefs.musicGenres.includes(genre) || (!genre && prefs.musicGenres.length);
      }
      if (category === 'books' && prefs.bookGenres) {
        return prefs.bookGenres.includes(genre) || (!genre && prefs.bookGenres.length);
      }
      if (category === 'movies' && prefs.movieGenres) {
        return prefs.movieGenres.includes(genre) || (!genre && prefs.movieGenres.length);
      }
      if (category === 'physical' && prefs.physicalActivities) {
        return prefs.physicalActivities.includes(title);
      }
      if (prefs.otherInterests && tags.some(t => prefs.otherInterests.includes(t))) {
        return true;
      }
      return false;
    });

    let picks = [];
    if (filtered.length === 0) {
      // fallback: random from all
      picks = [...allStaticActivities].sort(() => 0.5 - Math.random()).slice(0, num);
    } else {
      picks = [...filtered].sort(() => 0.5 - Math.random()).slice(0, num);
      // supplement if too few
      if (picks.length < num) {
        const needed = num - picks.length;
        const ids = new Set(picks.map(a => a.id));
        const extras = allStaticActivities
          .filter(a => !ids.has(a.id))
          .sort(() => 0.5 - Math.random())
          .slice(0, needed);
        picks = [...picks, ...extras];
      }
    }

    setRecommendedActivities(picks);
  }, [allStaticActivities, userPreferences]);

  // 3) Re-generate when data is ready
  useEffect(() => {
    if (!loading) generateRecommendations();
  }, [loading, generateRecommendations]);

  const getCategoryIcon = category =>
    ({ music: '🎵', books: '📚', movies: '🎬', physical: '💪' }[category] || '✨');

  if (loading) return <div className="text-center">Loading recommendations…</div>;
  if (error)   return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="bg-secondary-bg p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-3xl font-bold mb-6 text-center">Activities to Brighten Your Day</h2>

        {recommendedActivities.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedActivities.map(act => (
              <div key={act.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                <div className="text-4xl mb-2 text-center">{getCategoryIcon(act.category)}</div>
                <h3 className="text-xl font-semibold mb-2 text-center">{act.title}</h3>
                <p className="flex-grow text-gray-700 text-sm mb-4">{act.description}</p>
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  {act.tags?.map((t,i) => (
                    <span key={i} className="bg-highlight text-white text-xs px-2 py-1 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
                {act.link && (
                  <a
                    href={act.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto bg-highlight text-white py-2 px-4 rounded-md text-center hover:bg-opacity-90"
                  >
                    {act.category === 'music' ? 'Listen Now'
                      : act.category === 'books' ? 'Read More'
                      : act.category === 'movies' ? 'Watch Now'
                      : 'Start Activity'}
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-700">
            <p className="mb-4">No recommendations found.</p>
            <p>Try updating your preferences or refresh below.</p>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={generateRecommendations}
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
          >
            Refresh Suggestions
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityRecommendationsPage;