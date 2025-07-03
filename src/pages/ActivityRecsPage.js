import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const ActivityRecommendationsPage = () => {
  const { currentUser } = useAuth();
  const [userPreferences, setUserPreferences] = useState({});
  const [allStaticActivities, setAllStaticActivities] = useState([]);
  const [recommendedActivities, setRecommendedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to fetch data, memoized with useCallback
  const fetchData = useCallback(async () => {
    if (!currentUser) {
      setError('You must be logged in to view activity recommendations.');
      setLoading(false);
      return;
    }

    setLoading(true); // Set loading to true before fetching data
    setError(''); // Clear any previous errors

    try {
      // Fetch user preferences
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setUserPreferences(userDocSnap.data().activityPreferences || {});
      } else {
        setUserPreferences({}); // Ensure preferences are reset if user doc doesn't exist
      }

      // Fetch static activities
      const activitiesCollectionRef = collection(db, 'staticActivities');
      const activitiesSnapshot = await getDocs(activitiesCollectionRef);
      const activitiesData = activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllStaticActivities(activitiesData);
      console.log("Fetched Static Activities:", activitiesData); // Debugging line

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]); // Dependency on currentUser

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Dependency on fetchData

  // Generate recommendations whenever preferences or static activities change, or after initial load
  useEffect(() => {
    if (!loading && allStaticActivities.length > 0) {
      generateRecommendations();
    } else if (!loading && allStaticActivities.length === 0) {
      // If no static activities are found, ensure recommendations are cleared
      setRecommendedActivities([]);
    }
  }, [loading, userPreferences, allStaticActivities]);

  const generateRecommendations = () => {
    const numRecommendations = 3; // Number of recommendations to display
    let filteredActivities = [];

    // Filtering logic based on user preferences
    if (userPreferences) {
      allStaticActivities.forEach(activity => {
        let isMatch = false;

        // Match by category and genre (music, books, movies)
        if (userPreferences.musicGenres && activity.category === 'music') {
          if (activity.genre && userPreferences.musicGenres.includes(activity.genre)) {
            isMatch = true;
          } else if (!activity.genre && userPreferences.musicGenres.length > 0) { // If no specific genre, but user has music preferences
            isMatch = true;
          }
        }
        if (userPreferences.bookGenres && activity.category === 'books') {
          if (activity.genre && userPreferences.bookGenres.includes(activity.genre)) {
            isMatch = true;
          } else if (!activity.genre && userPreferences.bookGenres.length > 0) {
            isMatch = true;
          }
        }
        if (userPreferences.movieGenres && activity.category === 'movies') {
          if (activity.genre && userPreferences.movieGenres.includes(activity.genre)) {
            isMatch = true;
          } else if (!activity.genre && userPreferences.movieGenres.length > 0) {
            isMatch = true;
          }
        }

        // Match by physical activities (title included in preferences array)
        if (userPreferences.physicalActivities && activity.category === 'physical') {
          if (userPreferences.physicalActivities.includes(activity.title)) {
            isMatch = true;
          }
        }

        // Match by other interests (tags overlap)
        if (userPreferences.otherInterests && activity.tags && activity.tags.length > 0) {
          const commonTags = activity.tags.filter(tag => userPreferences.otherInterests.includes(tag));
          if (commonTags.length > 0) {
            isMatch = true;
          }
        }

        if (isMatch) {
          filteredActivities.push(activity);
        }
      });
    }

    // Fallback recommendations if no specific matches or not enough matches
    let finalRecommendations = [];
    if (filteredActivities.length === 0) {
      // Randomly select from all static activities if no matches
      const shuffledActivities = [...allStaticActivities].sort(() => 0.5 - Math.random());
      finalRecommendations = shuffledActivities.slice(0, numRecommendations);
    } else {
      // Randomly select from filtered activities
      const shuffledFiltered = [...filteredActivities].sort(() => 0.5 - Math.random());
      finalRecommendations = shuffledFiltered.slice(0, numRecommendations);

      // If not enough filtered activities, supplement with random ones
      if (finalRecommendations.length < numRecommendations) {
        const remainingNeeded = numRecommendations - finalRecommendations.length;
        const existingIds = new Set(finalRecommendations.map(rec => rec.id));
        const supplementalActivities = allStaticActivities.filter(act => !existingIds.has(act.id))
                                                          .sort(() => 0.5 - Math.random())
                                                          .slice(0, remainingNeeded);
        finalRecommendations = [...finalRecommendations, ...supplementalActivities];
      }
    }

    setRecommendedActivities(finalRecommendations);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'music': return '🎵';
      case 'books': return '📚';
      case 'movies': return '🎬';
      case 'physical': return '💪';
      default: return '✨';
    }
  };

  if (loading) {
    return <div className="text-center text-text-dark text-lg">Loading recommendations...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-lg">Error: {error}</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="bg-secondary-bg p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-text-dark">Activities to Brighten Your Day</h2>

        {recommendedActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedActivities.map(activity => (
              <div key={activity.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col">
                <div className="text-4xl mb-2 text-center">{getCategoryIcon(activity.category)}</div>
                <h3 className="text-xl font-semibold mb-2 text-text-dark text-center">{activity.title}</h3>
                <p className="text-gray-700 text-sm mb-4 flex-grow">{activity.description}</p>
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  {activity.tags && activity.tags.map((tag, index) => (
                    <span key={index} className="bg-highlight text-white text-xs px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                {activity.link && (
                  <a
                    href={activity.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto bg-highlight text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors duration-200 text-center"
                  >
                    {activity.category === 'music' ? 'Listen Now' :
                     activity.category === 'books' ? 'Read More' :
                     activity.category === 'movies' ? 'Watch Now' :
                     'Start Activity'}
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-700 text-lg">
            <p className="mb-4">No specific recommendations found based on your preferences.</p>
            <p>Try updating your preferences or refreshing for generic suggestions.</p>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={fetchData}
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors duration-200"
          >
            Refresh Suggestions
          </button>
          <Link
            to="/update-preferences"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200"
          >
            Update My Preferences
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ActivityRecommendationsPage;