import React from "react";
import "../style.css";
import SearchBar from './SearchBar';
import JobCategories from './JobCategories';

export default function Content() {
    return (
        <>
            <div className="searchContainer">
                <div className="searchBackgroundImage" alt="search background" style={{ backgroundImage: `url("../images/white-background.jpg")` }} ></div>
                <div className="container text-dark">
                    <div className="row d-flex justify-content-between align-items-center">
                        <div className="col-lg-6 col-md-7 pt-5">
                            <h1 className="display-1">Welcome to Work IT</h1>
                            <p>Welcome to the IT Job Portal for New Zealand, a dedicated platform for IT professionals to find tailored job opportunities. Whether you're a job seeker or employer, our platform provides a streamlined, secure, and user-friendly experience.</p>
                            <SearchBar />
                        </div>
                        <div className="col-lg-6 col-md-5">
                            {/* <img src="../images/Open source-cuate.svg" className="img-fluid large-image" alt="programmers" /> */}
                            <img src="../images/Innovation-amico.svg" className="img-fluid large-image front-img" alt="programmers" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="container">
                <JobCategories />
            </div>
        </>
    );
}
