export function convertToSeconds(timeString: string): number {
    // Use a regular expression to match the numeric part and the unit
    const match = timeString.match(/^(\d+)([a-zA-Z])$/);

    if (!match) {
        throw new Error('Invalid time format');
    }
    const value = parseInt(match[1], 10); // Get the numeric part
    const unit = match[2]; // Get the unit (e.g., 's', 'm', 'h')
    switch (unit) {
        case 's': // seconds
            return value;
        case 'm': // minutes
            return value * 60;
        case 'h': // hours
            return value * 3600;
        default:
            throw new Error('Unsupported time unit');
    }
}
