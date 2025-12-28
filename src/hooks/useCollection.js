import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query } from 'firebase/firestore';

export const useCollection = (collectionName, user) => { 
  const [data, setData] = useState([]);
  
  useEffect(() => {
    
    if (!user) {
      setData([]); // Set data to empty
      return; // And stop
    }

    // If user is logged in, run the query
    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = [];
      snapshot.forEach(doc => {
        results.push({ ...doc.data(), id: doc.id });
      });
      setData(results);
    }, (error) => {
      if (import.meta.env.DEV) console.error(`Error fetching collection ${collectionName}: `, error);
      setData([]);
    });

    return () => unsubscribe();
    
  }, [collectionName, user]); 

  return { data };
};