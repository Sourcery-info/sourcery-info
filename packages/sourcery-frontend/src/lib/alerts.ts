export const alertMessages = {
    // Auth related
    'unauthorized': 'You are not authorized to access this page',
    'login-required': 'Please log in to access this page',
    'account-pending': 'Your account is pending approval',

    // Success messages
    'changes-saved': 'Changes have been saved successfully',
    'account-created': 'Account has been created successfully',

    // Error messages
    'operation-failed': 'Operation failed. Please try again',
    'invalid-input': 'Please check your input and try again',

    // Add more messages as needed
};

// Helper function to create alert URLs
export function createAlertUrl(baseUrl: string, alertCode: string, type = 'info') {
    const url = new URL(baseUrl, 'http://dummy.com'); // dummy.com is just for parsing
    url.searchParams.set('alert', alertCode);
    url.searchParams.set('type', type);
    return `${url.pathname}${url.search}`;
}