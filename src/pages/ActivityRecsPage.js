import React, { useState, useEffect } from 'react';
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

  // Fetch user preferences and static activities on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setError('You must be logged in to view activity recommendations.');
        setLoading(false);
        return;
      }

      try {
        // Fetch user preferences
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserPreferences(userDocSnap.data().activityPreferences || {});
        }

        // Fetch static activities
        const activitiesCollectionRef = collection(db, 'staticActivities');
        const activitiesSnapshot = await getDocs(activitiesCollectionRef);
        const activitiesData = activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllStaticActivities(activitiesData);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Generate recommendations whenever preferences or static activities change
  useEffect(() => {
    if (!loading && allStaticActivities.length > 0) {
      generateRecommendations();
    }
  }, [loading, userPreferences, allStaticActivities]);

  const generateRecommendations = () => {
    const numRecommendations = 3;
    let filteredActivities = [];
  
    if (!Array.isArray(allStaticActivities) || allStaticActivities.length === 0) {
      console.warn("No activities available to recommend from.");
      return;
    }
  
    allStaticActivities.forEach((activity) => {
      if (!activity || !activity.category || !activity.title) return;
  
      let isMatch = false;
  
      // Music
      if (
        userPreferences.musicGenres &&
        activity.category === 'music' &&
        (userPreferences.musicGenres.includes(activity.genre) || (!activity.genre && userPreferences.musicGenres.length > 0))
      ) {
        isMatch = true;
      }
  
      // Books
      if (
        userPreferences.bookGenres &&
        activity.category === 'books' &&
        (userPreferences.bookGenres.includes(activity.genre) || (!activity.genre && userPreferences.bookGenres.length > 0))
      ) {
        isMatch = true;
      }
  
      // Movies
      if (
        userPreferences.movieGenres &&
        activity.category === 'movies' &&
        (userPreferences.movieGenres.includes(activity.genre) || (!activity.genre && userPreferences.movieGenres.length > 0))
      ) {
        isMatch = true;
      }
  
      // Physical
      if (
        userPreferences.physicalActivities &&
        activity.category === 'physical' &&
        userPreferences.physicalActivities.includes(activity.title)
      ) {
        isMatch = true;
      }
  
      // Other interests by tags
      if (
        userPreferences.otherInterests &&
        activity.tags &&
        activity.tags.some(tag => userPreferences.otherInterests.includes(tag))
      ) {
        isMatch = true;
      }
  
      if (isMatch) filteredActivities.push(activity);
    });
  
    let finalRecommendations = [];
  
    if (filteredActivities.length === 0) {
      console.log("Using fallback: random from all activities");
      const shuffled = [...allStaticActivities].sort(() => 0.5 - Math.random());
      finalRecommendations = shuffled.slice(0, numRecommendations);
    } else {
      console.log("Using filtered preferences");
      const shuffled = [...filteredActivities].sort(() => 0.5 - Math.random());
      finalRecommendations = shuffled.slice(0, numRecommendations);
  
      if (finalRecommendations.length < numRecommendations) {
        const needed = numRecommendations - finalRecommendations.length;
        const ids = new Set(finalRecommendations.map(item => item.id));
        const extras = allStaticActivities.filter(act => !ids.has(act.id)).sort(() => 0.5 - Math.random()).slice(0, needed);
        finalRecommendations = [...finalRecommendations, ...extras];
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

        <div className="flex justify-center mt-8">
          <button
            onClick={generateRecommendations}
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors duration-200"
          >
            Refresh Suggestions
          </button>
          {/* TODO: Add a link to a preferences page once it's created. */}
        </div>
      </div>
    </div>
  );
};

export default ActivityRecommendationsPage;