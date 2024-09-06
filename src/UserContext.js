import React, { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [employer, setEmployer] = useState(null);
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', authUser.uid));
                    if (userDoc.exists()) {
                        setUser(authUser);
                        setEmployer(null);
                    } else {
                        const employerDoc = await getDoc(doc(db, 'employers', authUser.uid));
                        if (employerDoc.exists()) {
                            setEmployer(authUser);
                            setUser(null);
                        } else {
                            setUser(null);
                            setEmployer(null);
                        }
                    }
                } catch (error) {
                    console.error('Error checking user or employer:', error);
                }
            } else {
                setUser(null);
                setEmployer(null);
            }
        });

        return () => unsubscribe();
    }, [auth, db]);

    return (
        <UserContext.Provider value={{ user, employer }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
