import React from "react";
import "../style.css";
import SearchBar from './SearchBar';
import FeaturedJobs from './FeaturedJobs';
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
                            <p>Lorem ipsum odor amet, consectetuer adipiscing elit. Habitasse semper litora quis gravida neque sit praesent. Lorem adipiscing imperdiet velit donec orci.</p>
                            <SearchBar />
                        </div>
                        <div className="col-lg-6 col-md-5">
                            {/* <img src="../images/Open source-cuate.svg" className="img-fluid large-image" alt="programmers" /> */}
                            <img src="../images/Innovation-amico.svg" className="img-fluid large-image" alt="programmers" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="container">
                <FeaturedJobs />
                <JobCategories />
            </div>
        </>
    );
}
