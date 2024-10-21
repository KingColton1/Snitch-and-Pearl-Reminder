// Time converter to get unix from user's input (DD/MM/YYYY HH:MM -> unix)
async function timeConverter(timeInput) {
    var stringMatch = timeInput.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2})\:(\d{2})$/);
    
    // If user's input doesn't match format, stop the process
    if (!stringMatch) {
        return false;
    }

    var date = new Date(stringMatch[3], stringMatch[2] - 1, stringMatch[1], stringMatch[4], stringMatch[5]);
    var unixTime = Math.floor(date.getTime() / 1000);

    return unixTime;
}

// Turns unix timestamp back to human readable timestamp in DD/MM/YYYY HH:SS format
function unixToTimestamp(unixTime) {
    const date = new Date(unixTime * 1000); // Convert Unix timestamp to milliseconds

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Return formatted date string
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Converts schedule value into seconds and subtract expiration time to get schedule unix time
async function calculateSchedule(scheduleTime, expireTime) {
    const timeValue = scheduleTime.match(/^(\d+)\s?(day|days|hour|hours|week)$/i);

    if (!timeValue) {
        console.error("Invalid scheduleTime value format. Notify developer to fix this issue.");
        return null;
    }

    const quantity = parseInt(timeValue[1]);
    const unit = timeValue[2].toLowerCase();

    let timeInSeconds = 0;

    // Convert the time to seconds based on the unit
    if (unit === "day" || unit === "days") {
        timeInSeconds = quantity * 24 * 60 * 60; // Days to seconds
    }
    else if (unit === "hour" || unit === "hours") {
        timeInSeconds = quantity * 60 * 60; // Hours to seconds
    } 
    else if (unit === "week" || unit === "weeks") {
        timeInSeconds = quantity * 7 * 24 * 60 * 60; // Weeks to seconds
    }

    // Subtract the calculated time from expireTime (which is in seconds)
    const scheduledTime = expireTime - timeInSeconds;

    return scheduledTime;
}

// Turn unix timestamp back to human readable time (1 hour, etc)
function reverseSchedule(scheduleTime, expireTime) {
    // Calculate the difference in seconds
    const differenceInSeconds = expireTime - scheduleTime;

    // Convert the difference back to weeks, days, or hours
    if (differenceInSeconds >= 7 * 24 * 60 * 60) {
        const weeks = Math.floor(differenceInSeconds / (7 * 24 * 60 * 60));
        return weeks === 1 ? `${weeks} week` : `${weeks} weeks`;
    }
    else if (differenceInSeconds >= 24 * 60 * 60) {
        const days = Math.floor(differenceInSeconds / (24 * 60 * 60));
        return days === 1 ? `${days} day` : `${days} days`;
    }
    else if (differenceInSeconds >= 60 * 60) {
        const hours = Math.floor(differenceInSeconds / (60 * 60));
        return hours === 1 ? `${hours} hour` : `${hours} hours`;
    }

    return "Invalid schedule time"; // If it's less than an hour
}

module.exports = {
    timeConverter,
    unixToTimestamp,
    calculateSchedule,
    reverseSchedule
}