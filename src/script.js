export function formatDate(dateInput) {
    if (!dateInput) return 'Unknown Date'; // Handle null or undefined input

    // Check if input is a Firestore Timestamp or a valid date string
    const jobDate = dateInput instanceof Date ? dateInput : new Date(dateInput);
    
    if (isNaN(jobDate)) return 'Invalid Date'; // Handle invalid date

    const today = new Date();
    const diffTime = Math.abs(today - jobDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return `${diffDays} day ago`;
    } else {
        return `${diffDays} days ago`;
    }
};
