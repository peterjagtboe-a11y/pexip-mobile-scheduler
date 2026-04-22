/* 
 * Pexip Dynamic VMR - Mobile Function
 * Gets token from Office context (user already authenticated)
 */

// Configuration
const PEXIP_SCHEDULER_ID = '2';
const PEXIP_API_BASE = 'https://pexip.vc/api/client/v2/msexchange_schedulers';

/**
 * Get Microsoft authentication token from Office context
 */
async function getMicrosoftToken() {
    try {
        // Office.js provides token via getAccessTokenAsync
        // Even without WebApplicationInfo, it should work if user is logged in
        return new Promise((resolve, reject) => {
            Office.context.auth.getAccessTokenAsync({ forceAddAccount: false }, (result) => {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    console.log('Token acquired from Office context');
                    resolve(result.value);
                } else {
                    console.log('Office.auth failed, error:', result.error);
                    reject(new Error(`Auth failed: ${result.error.message}`));
                }
            });
        });
    } catch (error) {
        console.error('Token acquisition error:', error);
        throw error;
    }
}

/**
 * Get meeting details from Pexip Scheduling API
 */
async function getMeetingDetails(token) {
    const url = `${PEXIP_API_BASE}/${PEXIP_SCHEDULER_ID}/meeting_details`;
    
    console.log('Calling Pexip API:', url);
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'token': token,
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Pexip API error:', response.status, errorText);
        throw new Error(`Pexip API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'success') {
        throw new Error('Pexip API returned non-success status');
    }
    
    return data.result;
}

/**
 * Extract VMR ID from HTML instructions
 */
function extractVmrId(htmlInstructions) {
    const match = htmlInstructions.match(/(\d{8})@pexip\.vc/);
    return match ? match[1] : null;
}

/**
 * Main function called by button
 */
async function addDynamicPexipMeeting(event) {
    try {
        console.log('=== Creating dynamic Pexip meeting ===');
        
        // Step 1: Get Microsoft token
        console.log('Step 1: Getting Microsoft token...');
        const token = await getMicrosoftToken();
        console.log('✓ Token acquired');
        
        // Step 2: Call Pexip Scheduling API
        console.log('Step 2: Calling Pexip API...');
        const meetingDetails = await getMeetingDetails(token);
        console.log('✓ Meeting details received:', meetingDetails.room_name);
        
        // Step 3: Extract VMR ID
        const vmrId = extractVmrId(meetingDetails.instructions);
        console.log('✓ VMR ID:', vmrId);
        
        if (!vmrId) {
            throw new Error('Could not extract VMR ID from response');
        }
        
        // Step 4: Insert meeting body (use HTML from Pexip)
        console.log('Step 4: Inserting meeting details...');
        await new Promise((resolve, reject) => {
            Office.context.mailbox.item.body.setAsync(
                meetingDetails.instructions,
                { coercionType: Office.CoercionType.Html },
                (result) => {
                    if (result.status === Office.AsyncResultStatus.Failed) {
                        reject(new Error(result.error.message));
                    } else {
                        resolve();
                    }
                }
            );
        });
        console.log('✓ Body inserted');
        
        // Step 5: Set location
        console.log('Step 5: Setting location...');
        await new Promise((resolve) => {
            Office.context.mailbox.item.location.setAsync(
                meetingDetails.room_name,
                () => resolve()
            );
        });
        console.log('✓ Location set');
        
        console.log('=== Success! Meeting created ===');
        
        // Show success notification
        Office.context.mailbox.item.notificationMessages.addAsync(
            'pexip-success',
            {
                type: 'informationalMessage',
                message: `Pexip meeting created: ${vmrId}`,
                icon: 'icon16',
                persistent: false
            }
        );
        
        event.completed({ allowEvent: true });
        
    } catch (error) {
        console.error('=== Error creating Pexip meeting ===');
        console.error('Error details:', error);
        console.error('Error stack:', error.stack);
        
        // Show error notification
        Office.context.mailbox.item.notificationMessages.addAsync(
            'pexip-error',
            {
                type: 'errorMessage',
                message: `Failed: ${error.message}`
            }
        );
        
        event.completed({ allowEvent: false });
    }
}

/**
 * Office.js initialization
 */
Office.initialize = function() {
    console.log('Pexip mobile function initialized');
    console.log('Office.js version:', Office.context.diagnostics.version);
    console.log('Host:', Office.context.diagnostics.host);
    console.log('Platform:', Office.context.diagnostics.platform);
};

// Register function
Office.actions.associate("addDynamicPexipMeeting", addDynamicPexipMeeting);
