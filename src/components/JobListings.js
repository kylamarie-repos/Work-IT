import React from "react";
import { useLocation } from "react-router-dom";
import "../style.css";
import SearchBar from "./SearchBar";
import { formatDate } from "../script";

export default function JobListings() {
    const location = useLocation();
    const { jobListings = [], keyword = "", location: searchLocation = "", workType = "", salary = "" } = location.state || {};

    return (
    <> 
        <div className="job-listings">
            <div className="searchContainer">
            <div className="searchBackgroundImage" alt="search background" style={{ backgroundImage: `url("../images/white-background.jpg")` }} ></div>
            <div className="container text-dark p-5">
                <SearchBar
                initialKeyword={keyword}
                initialLocation={searchLocation}
                initialWorkType={workType}
                initialSalary={salary}
                />
            </div>
            </div>
            
            <div className="container mt-5">
                {jobListings.length > 0 ? (
                    jobListings.map((job, index) => (
                        <div className="card mb-3" key={index}>
                            <div className="card-body">
                                {job.employer.logo ? (
                                    <img 
                                        src={job.employer.logo} 
                                        className="logo rounded-circle" 
                                        alt="company logo" 
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                                    />
                                ) : (
                                    <div 
                                        className="logo-placeholder rounded-circle" 
                                        style={{ width: '50px', height: '50px', backgroundColor: '#ddd' }}
                                    >
                                        <span className="placeholder-text">No Logo</span>
                                    </div>
                                )}
                                <div className="fs-2 mb-3 float-end">
                                <button type="button" class="btn rounded-circle bookmark-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bookmark-heart" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M8 4.41c1.387-1.425 4.854 1.07 0 4.277C3.146 5.48 6.613 2.986 8 4.412z"></path>
                                    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z"></path>
                                    </svg>
                                </button>
                                </div>
                                <div className="mx-auto p-2">
                                    <h5 className="card-title">{job.title}</h5>
                                    <ul className="list-group list-group-horizontal">
                                        <li className="list-group-item"><p className="card-text">{job.employer.companyName}</p></li>
                                        <li className="list-group-item"><p className="card-text">{job.jobType}</p></li>
                                        <li className="list-group-item"><p className="card-text">Salary: {job.salary}k</p></li>
                                    </ul>
                                    <p className="card-text">{job.location}</p>
                                    <p className="card-text float-end">Posted: {formatDate(job.datePosted)}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No job listings found.</p>
                )}
            </div>
        </div>
        </>
    );
}