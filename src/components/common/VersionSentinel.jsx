import { useEffect } from 'react';

const VERSION_CHECK_INTERVAL = 10 * 60 * 1000; // Check every 10 minutes

/**
 * VersionSentinel monitors the server for new deployments and automatically
 * reloads the page to ensure the user has the latest content.
 */
export default function VersionSentinel() {
    useEffect(() => {
        let lastVersion = null;

        const checkVersion = async () => {
            try {
                // Fetch version.json with a cache-busting timestamp
                const response = await fetch(`/version.json?t=${new Date().getTime()}`, {
                    cache: 'no-store'
                });
                
                if (!response.ok) return;

                const data = await response.json();
                const currentVersion = data.buildTime || data.version;

                if (!lastVersion) {
                    // First check - initialize the current session version
                    lastVersion = currentVersion;
                } else if (lastVersion !== currentVersion) {
                    // Version mismatch detected!
                    console.info('New version detected. Refreshing for latest updates...');
                    
                    // Optional: You could save a flag in sessionStorage to notify the user
                    // AFTER the refresh that "The site was updated".
                    
                    // Perform a hard reload
                    window.location.reload(true);
                }
            } catch (err) {
                // Silently ignore network errors during background check
                console.debug('Version check failed:', err);
            }
        };

        // Run initial check
        checkVersion();

        // Set up polling interval
        const intervalId = setInterval(checkVersion, VERSION_CHECK_INTERVAL);

        return () => clearInterval(intervalId);
    }, []);

    return null; // This component doesn't render anything UI-wise
}
