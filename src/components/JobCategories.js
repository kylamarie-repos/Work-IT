import React, { useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from './firebase';

export default function JobCategories() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const querySnapshot = await getDocs(collection(db, "fields"));
            const categoriesList = querySnapshot.docs.map(doc => doc.data().field);
            setCategories(categoriesList);
        };

        fetchCategories();
    }, []);

    return (
        <>
            <section className="container mt-5">
                <h2 className="mb-4">Job Categories</h2>
                <div className="row">
                    {categories.map((category, index) => (
                        <div key={index} className="col-md-2 col-sm-4 mb-3">
                            <div className="card text-center h-100">
                                <div className="card-body d-flex align-items-center justify-content-center">
                                    <p className="card-text">{category}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
