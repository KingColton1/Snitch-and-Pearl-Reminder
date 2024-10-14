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

// Converts schedule value into seconds and subtract expiration time to get schedule unix time
async function calculateSchedule(scheduleTime, expireTime) {
    const timeValue = scheduleTime.match(/^(\d+)(day|days|hour|hours)$/i);

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
    } else if (unit === "hour" || unit === "hours") {
        timeInSeconds = quantity * 60 * 60; // Hours to seconds
    }

    // Subtract the calculated time from expireTime (which is in seconds)
    const scheduledTime = expireTime - timeInSeconds;

    return scheduledTime;
}

module.exports = {
    timeConverter,
    calculateSchedule
}