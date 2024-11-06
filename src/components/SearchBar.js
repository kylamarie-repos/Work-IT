import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import "../style.css";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ initialKeyword = "", initialLocation = "Select City", initialWorkType = "", initialSalary = "" }) => {
	const [locations, setLocations] = useState([]);
	const [keyword, setKeyword] = useState(initialKeyword || '');
	const [location, setLocation] = useState(initialLocation || '');
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [workTypes, setWorkTypes] = useState([]);
	const [salaries, setSalaries] = useState([]);
	const [selectedWorkType, setSelectedWorkType] = useState(initialWorkType || '');
	const [selectedSalary, setSelectedSalary] = useState(initialSalary || '');
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Track screen size

	const navigate = useNavigate();

	useEffect(() => {
		const fetchLocations = async () => {
			try {
				const querySnapshot = await getDocs(collection(db, "locations"));
				const locationsList = querySnapshot.docs.map(doc => doc.data().city);
				setLocations(locationsList);
			} catch (error) {
				console.error("Error fetching locations: ", error);
			}
		};

		const fetchWorkTypes = async () => {
			try {
				const querySnapshot = await getDocs(collection(db, "work-types"));
				const workTypesList = querySnapshot.docs.map(doc => doc.data().type);
				setWorkTypes(workTypesList);
			} catch (error) {
				console.error("Error fetching work types: ", error);
			}
		};

		const fetchSalaries = async () => {
			try {
				const querySnapshot = await getDocs(collection(db, "salaries"));
				let salariesList = querySnapshot.docs.map(doc => doc.data().salary);
				salariesList = salariesList.sort((a, b) => a - b);
				const formattedSalaries = salariesList.map(salary => salary >= 350 ? "350k+" : `${salary}k`);
				setSalaries(formattedSalaries);
			} catch (error) {
				console.error("Error fetching salaries: ", error);
			}
		};

		fetchLocations();
		fetchWorkTypes();
		fetchSalaries();

		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const handleSearch = async () => {
		let jobs = [];
		const selectedSalaryNumber = parseInt(selectedSalary, 10);

		try {
			const employersSnapshot = await getDocs(collection(db, "employers"));
			for (let employerDoc of employersSnapshot.docs) {
				const employerId = employerDoc.id;
				const employerData = employerDoc.data();
				const jobAdsSnapshot = await getDocs(collection(db, "employers", employerId, "jobAdvertisements"));
				jobAdsSnapshot.forEach(doc => {
					const jobData = doc.data();
					const jobId = doc.id;
					const { title, location: jobLocation, jobType, salary } = jobData;

					const jobSalaryNumber = parseInt(salary, 10);
					const keywordMatch = keyword === "" || title.toLowerCase().includes(keyword.toLowerCase());
					const locationMatch = location === "Select City" || jobLocation === location;
					const workTypeMatch = selectedWorkType === "" || jobType === selectedWorkType;
					const salaryMatch = selectedSalary === "" || jobSalaryNumber >= selectedSalaryNumber;

					if (keywordMatch && locationMatch && workTypeMatch && salaryMatch) {
						jobs.push({ id: jobId, ...jobData, employer: { ...employerData, id: employerId } });
					}
				});
			}

			navigate("/job-listings", { state: { jobListings: jobs, keyword, location, workType: selectedWorkType, salary: selectedSalary } });
		} catch (error) {
			console.error("Error searching jobs: ", error);
		}
	};

	return (
		<>
			<div className={`search-bar ${isMobile ? 'mobile' : ''}`}>
				{isMobile ? (
					<>
						<input
							type="text"
							className="form-control"
							placeholder="Job title, keywords, or company"
							value={keyword}
							onChange={(e) => setKeyword(e.target.value)}
						/>
						<select
							className="form-control"
							value={location}
							onChange={(e) => setLocation(e.target.value)}
						>
							<option value="">Select City</option>
							{locations.length > 0 ? (
								locations.map((loc, index) => (
									<option key={index} value={loc}>{loc}</option>
								))
							) : (
								<div className="d-flex justify-content-center">
									<div className="spinner-border" role="status">
										<span className="visually-hidden">Loading...</span>
									</div>
								</div>
							)}
						</select>

						{/* Toggle for advanced search */}
						<button
							className="btn btn-secondary mt-3"
							onClick={() => setShowAdvanced(!showAdvanced)}
						>
							{showAdvanced ? 'Hide Filters' : 'Show Filters'}
						</button>

						<button
							className="btn btn-primary mt-2"
							onClick={handleSearch}
						>
							Search
						</button>
					</>
				) : (
					<div className="input-group mb-3">
						<input
							type="text"
							className="form-control"
							placeholder="Job title, keywords, or company"
							value={keyword}
							onChange={(e) => setKeyword(e.target.value)}
						/>
						<select
							className="form-control"
							value={location}
							onChange={(e) => setLocation(e.target.value)}
						>
							<option value="">Select City</option>
							{locations.length > 0 ? (
								locations.map((loc, index) => (
									<option key={index} value={loc}>{loc}</option>
								))
							) : (
								<div className="d-flex justify-content-center">
									<div className="spinner-border" role="status">
										<span className="visually-hidden">Loading...</span>
									</div>
								</div>
							)}
						</select>
						<span className="input-group-text">
							<img
								src="../images/filter.svg"
								alt="Toggle Advanced Search"
								className="toggle-icon float-end"
								onClick={() => setShowAdvanced(!showAdvanced)}
							/>
						</span>
						<button
							className="btn btn-primary"
							onClick={handleSearch}
						>
							Search
						</button>
					</div>
				)}
			</div>

			{/* Advanced search filters visible for mobile and desktop */}
			{showAdvanced && (
				<div className="advanced-filters">
					<div className="row mt-3">
						<div className="col-md-3 mt-2">
							<select
								className="form-control rounded-pill"
								value={selectedWorkType}
								onChange={(e) => setSelectedWorkType(e.target.value)}
							>
								<option value="">Select Job Type</option>
								{workTypes.map((type, index) => (
									<option key={index} value={type}>
										{type}
									</option>
								))}
							</select>
						</div>
						<div className="col-md-3 mt-2">
							<select
								className="form-control rounded-pill"
								value={selectedSalary}
								onChange={(e) => setSelectedSalary(e.target.value)}
							>
								<option value="">Select Salary Range</option>
								{salaries.map((salary, index) => (
									<option key={index} value={salary}>
										{salary}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default SearchBar;
