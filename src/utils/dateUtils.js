import NepaliDate from 'nepali-date-converter';

/**
 * Formats a Firebase timestamp into a Nepali Date and Time string.
 * @param {object} firebaseTimestamp - The timestamp object from
 * Firestore (e.g., tx.createdAt)
 * @returns {string} - A formatted string like
 * "Jestha 14, 2081 • 2:30 PM"
 */
export const formatNepaliDateTime = (firebaseTimestamp) => {
  // Check if the timestamp is valid and has the toDate method
  if (!firebaseTimestamp?.toDate) {
    return "Invalid Date";
  }

  try {
    const jsDate = firebaseTimestamp.toDate();
    const nepaliDate = new NepaliDate(jsDate);

    // Format the Nepali date: "Jestha 14, 2081"
    const dateString = nepaliDate.format('MMMM D, YYYY');

    // Format the time: "2:30 PM"
    const timeString = jsDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Combine them
    return `${dateString} • ${timeString}`;

  } catch (error) {
    console.error("Error formatting Nepali date:", error);
    return "Date Error";
  }
};