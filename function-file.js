/* 
 * Pexip Dynamic VMR - Mobile Function (Dialog Auth)
 * Uses dialog-based authentication instead of SSO
 */

// Configuration
const PEXIP_SCHEDULER_ID = '2';
const PEXIP_API_BASE = 'https://pexip.vc/api/client/v2/msexchange_schedulers';

/**
 * Get Microsoft authentication token using dialog
 */
async function getMicrosoftToken() {
    try {
        // Use Office's auth dialog instead of SSO
        return new Promise((resolve, reject) => {
            Office.context.auth.getAccessTokenAsync({ allowSignInPrompt: true }, (result) => {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    resolve(result.value);
                } else {
                    // If SSO fails, try fallback
                    console.log('SSO failed, trying fallback auth');
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
        throw new Error(`Pexip API error: ${response.status} - ${errorText}`);
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
    // Look for pattern like "10000858@pexip.vc" in the HTML
    const match = htmlInstructions.match(/(\d{8})@pexip\.vc/);
    return match ? match[1] : null;
}

/**
 * Main function called by mobile button
 */
async function addDynamicPexipMeeting(event) {
    try {
        console.log('Creating dynamic Pexip meeting...');
        
        // Step 1: Get Microsoft token
        console.log('Getting Microsoft token...');
        let token;
        
        try {
            token = await getMicrosoftToken();
            console.log('Token acquired successfully');
        } catch (authError) {
            console.error('Authentication failed:', authError);
            
            // Show user-friendly error
            Office.context.mailbox.item.notificationMessages.addAsync(
                'pexip-auth-error',
                {
                    type: 'errorMessage',
                    message: 'Please ensure you are logged into Microsoft 365'
                }
            );
            
            event.completed({ allowEvent: false });
            return;
        }
        
        // Step 2: Call Pexip Scheduling API
        console.log('Calling Pexip Scheduling API...');
        const meetingDetails = await getMeetingDetails(token);
        console.log('Meeting details received:', meetingDetails.room_name);
        
        // Step 3: Extract VMR ID
        const vmrId = extractVmrId(meetingDetails.instructions);
        console.log('VMR ID:', vmrId);
        
        if (!vmrId) {
            throw new Error('Could not extract VMR ID from response');
        }
        
        // Step 4: Insert meeting body (use the HTML from Pexip)
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
        
        // Step 5: Set location
        await new Promise((resolve) => {
            Office.context.mailbox.item.location.setAsync(
                meetingDetails.room_name,
                () => resolve()
            );
        });
        
        console.log('Meeting details inserted successfully');
        
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
        console.error('Error creating Pexip meeting:', error);
        
        // Show error notification
        Office.context.mailbox.item.notificationMessages.addAsync(
            'pexip-error',
            {
                type: 'errorMessage',
                message: `Failed to create Pexip meeting: ${error.message}`
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
};

// Register function
Office.actions.associate("addDynamicPexipMeeting", addDynamicPexipMeeting);
