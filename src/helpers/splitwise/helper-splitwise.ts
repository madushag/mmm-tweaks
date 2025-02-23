/******************************************************************************************/
/* This file contains the helper functions for interacting with the Splitwise API.
/* It provides functionality to:
/* - Get and manage Splitwise authentication tokens
/* - Post expenses to Splitwise
/* - Handle message events between content script and page for Splitwise operations
/******************************************************************************************/

import { ExpenseDetails } from '../../types/entities/ExpenseDetails.js';
import { SplitwiseResponse } from '../../types/splitwise-responses/splitWiseResponse.js';

// Message types for communication between content script and service worker
export enum SplitwiseMessageType {
	POST_TO_SPLITWISE = 'POST_TO_SPLITWISE',
	SPLITWISE_EXPENSE_RESPONSE = 'SPLITWISE_EXPENSE_RESPONSE',
	GET_SPLITWISE_TOKEN = 'GET_SPLITWISE_TOKEN',
	SPLITWISE_TOKEN_RESPONSE = 'SPLITWISE_TOKEN_RESPONSE',
	GET_SPLITWISE_FRIENDS = 'GET_SPLITWISE_FRIENDS',
	SPLITWISE_FRIENDS_RESPONSE = 'SPLITWISE_FRIENDS_RESPONSE',
	GET_CURRENT_USER = 'GET_CURRENT_USER',
	CURRENT_USER_RESPONSE = 'CURRENT_USER_RESPONSE',
	GET_SPLITWISE_GROUPS = 'GET_SPLITWISE_GROUPS',
	SPLITWISE_GROUPS_RESPONSE = 'SPLITWISE_GROUPS_RESPONSE',
	DELETE_SPLITWISE_EXPENSE = 'DELETE_SPLITWISE_EXPENSE',
	SPLITWISE_DELETE_RESPONSE = 'SPLITWISE_DELETE_RESPONSE'
}

/**
 * Posts an expense to Splitwise using the provided expense details and user IDs.
 * It sends a message to the content script and listens for the response.
 * On success, it resolves with the response from Splitwise; on failure, it rejects with an error.
 *
 * @param expenseDetails - The details of the expense to be posted.
 * @param myUserId - The ID of the user posting the expense.
 * @param debUserId - The ID of the user being debited for the expense.
 * @returns A promise that resolves to the Splitwise response or rejects with an error.
 */
export async function postToSplitwise(
	expenseDetails: ExpenseDetails,
	myUserId: number,
	debUserId: number
): Promise<SplitwiseResponse> {
	return new Promise((resolve, reject) => {
		const messageId = Math.random().toString(36).substring(7);

		// Setup the event listener before posting the message
		const messageListener = (event: MessageEvent) => {

			// Only accept messages from our extension
			if (event.data.source !== 'MMM_EXTENSION') return;

			// Handle the response from Splitwise
			if (event.data.type === SplitwiseMessageType.SPLITWISE_EXPENSE_RESPONSE && event.data.messageId === messageId) {
				window.removeEventListener('message', messageListener);

				if (event.data.error) {
					reject(new Error(event.data.error));
				} else {
					resolve(event.data.response);
				}
			}
		};
		window.addEventListener('message', messageListener);

		try {
			// Send message to content script
			window.postMessage({
				type: SplitwiseMessageType.POST_TO_SPLITWISE,
				messageId,
				source: 'MMM_EXTENSION',
				data: {
					expenseDetails,
					myUserId,
					debUserId
				}
			}, '*');
		} catch (error) {
			window.removeEventListener('message', messageListener);
			reject(error);
		}
	});
}

/**
 * Gets the list of friends from Splitwise.
 * It sends a message to the content script and listens for the response.
 * On success, it resolves with the list of friends; on failure, it rejects with an error.
 *
 * @returns A promise that resolves to the list of Splitwise friends or rejects with an error.
 */
export async function getSplitwiseFriends(): Promise<any[]> {
	return new Promise((resolve, reject) => {
		const messageId = Math.random().toString(36).substring(7);

		// Setup the event listener before posting the message
		const messageListener = (event: MessageEvent) => {
			// Only accept messages from our extension
			if (event.data.source !== 'MMM_EXTENSION') return;

			// Handle the response from Splitwise
			if (event.data.type === SplitwiseMessageType.SPLITWISE_FRIENDS_RESPONSE && event.data.messageId === messageId) {
				window.removeEventListener('message', messageListener);

				if (event.data.error) {
					reject(new Error(event.data.error));
				} else {
					resolve(event.data.friends);
				}
			}
		};
		window.addEventListener('message', messageListener);

		try {
			// Send message to content script
			window.postMessage({
				type: SplitwiseMessageType.GET_SPLITWISE_FRIENDS,
				messageId,
				source: 'MMM_EXTENSION'
			}, '*');
		} catch (error) {
			window.removeEventListener('message', messageListener);
			reject(error);
		}
	});
}

/**
 * Get the current user's information from Splitwise using message passing
 * @returns Promise with the current user's ID or throws an error
 */
export async function getCurrentSplitwiseUser(): Promise<number> {
	return new Promise((resolve, reject) => {
		const messageId = Math.random().toString(36).substring(7);

		// Setup the event listener before posting the message
		const messageListener = (event: MessageEvent) => {
			// Only accept messages from our extension
			if (event.data.source !== 'MMM_EXTENSION') return;

			// Handle the response 
			if (event.data.type === SplitwiseMessageType.CURRENT_USER_RESPONSE && event.data.messageId === messageId) {
				window.removeEventListener('message', messageListener);

				if (event.data.error) {
					reject(new Error(event.data.error));
				} else if (!event.data.userId) {
					reject(new Error('No user ID received from Splitwise'));
				} else {
					resolve(event.data.userId);
				}
			}
		};
		window.addEventListener('message', messageListener);

		try {
			// Send message to content script
			window.postMessage({
				type: SplitwiseMessageType.GET_CURRENT_USER,
				messageId,
				source: 'MMM_EXTENSION'
			}, '*');
		} catch (error) {
			window.removeEventListener('message', messageListener);
			reject(error);
		}
	});
}

/**
 * Gets the list of groups from Splitwise.
 * It sends a message to the content script and listens for the response.
 * On success, it resolves with the list of groups; on failure, it rejects with an error.
 *
 * @returns A promise that resolves to the list of Splitwise groups or rejects with an error.
 */
export async function getSplitwiseGroups(): Promise<any[]> {
	return new Promise((resolve, reject) => {
		const messageId = Math.random().toString(36).substring(7);

		// Setup the event listener before posting the message
		const messageListener = (event: MessageEvent) => {
			// Only accept messages from our extension
			if (event.data.source !== 'MMM_EXTENSION') return;

			// Handle the response from Splitwise
			if (event.data.type === SplitwiseMessageType.SPLITWISE_GROUPS_RESPONSE && event.data.messageId === messageId) {
				window.removeEventListener('message', messageListener);

				if (event.data.error) {
					reject(new Error(event.data.error));
				} else {
					resolve(event.data.groups);
				}
			}
		};
		window.addEventListener('message', messageListener);

		try {
			// Send message to content script
			window.postMessage({
				type: SplitwiseMessageType.GET_SPLITWISE_GROUPS,
				messageId,
				source: 'MMM_EXTENSION'
			}, '*');
		} catch (error) {
			window.removeEventListener('message', messageListener);
			reject(error);
		}
	});
}

/**
 * Deletes an expense from Splitwise using its ID.
 * It sends a message to the content script and listens for the response.
 * On success, it resolves with the response from Splitwise; on failure, it rejects with an error.
 *
 * @param transactionId - The ID of the transaction to get the Splitwise expense ID from
 * @returns A promise that resolves to the Splitwise response or rejects with an error.
 */
export async function deleteSplitwiseExpense(transactionId: string): Promise<SplitwiseResponse> {
	return new Promise((resolve, reject) => {
		const messageId = Math.random().toString(36).substring(7);

		// Setup the event listener before posting the message
		const messageListener = (event: MessageEvent) => {
			// Only accept messages from our extension
			if (event.data.source !== 'MMM_EXTENSION') return;

			// Handle the response from Splitwise
			if (event.data.type === SplitwiseMessageType.SPLITWISE_DELETE_RESPONSE && event.data.messageId === messageId) {
				window.removeEventListener('message', messageListener);

				if (event.data.error) {
					reject(new Error(event.data.error));
				} else {
					resolve(event.data.response);
				}
			}
		};
		window.addEventListener('message', messageListener);

		try {
			// Send message to content script
			window.postMessage({
				type: SplitwiseMessageType.DELETE_SPLITWISE_EXPENSE,
				messageId,
				source: 'MMM_EXTENSION',
				data: {
					transactionId
				}
			}, '*');
		} catch (error) {
			window.removeEventListener('message', messageListener);
			reject(error);
		}
	});
}

/**
 * Gets the Splitwise token
 * @returns A promise that resolves to the Splitwise token or rejects with an error.
 */
export async function getSplitwiseToken(config: any): Promise<string> {
	// Check if we have a cached token
	const cached = await chrome.storage.local.get(['splitwise_token', 'splitwise_token_expiry']);
	if (cached.splitwise_token && cached.splitwise_token_expiry) {
		if (Date.now() < cached.splitwise_token_expiry - 300000) {
			console.log('Using cached token');
			return cached.splitwise_token;
		}
	}

	// Start OAuth flow
	const redirectUri = config.redirect_uri;
	const authUrl = `${config.auth_url}?client_id=${config.client_id}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(config.scope)}`;

	try {
		const redirectUrl = await chrome.identity.launchWebAuthFlow({
			url: authUrl,
			interactive: true
		});

		// With implicit grant, the token comes directly in the URL fragment
		const urlHash = new URL(redirectUrl).hash.substring(1);
		const params = new URLSearchParams(urlHash);
		const accessToken = params.get('access_token');

		if (!accessToken) {
			throw new Error('No access token received');
		}

		// Cache the token with expiry
		await chrome.storage.local.set({
			splitwise_token: accessToken,
			splitwise_token_expiry: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days in milliseconds
		});
		return accessToken;

	} catch (error) {
		console.error('Detailed Splitwise OAuth error:', {
			message: error.message,
			stack: error.stack,
			error
		});
		throw error;
	}
}
