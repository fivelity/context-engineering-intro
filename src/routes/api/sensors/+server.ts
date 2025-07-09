import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Sensor API endpoints for SvelteKit
const BACKEND_URL = 'http://localhost:8000';

export const GET: RequestHandler = async ({ fetch }) => {
	try {
		const response = await fetch(`${BACKEND_URL}/sensors`);
		
		if (!response.ok) {
			throw new Error(`Backend responded with status: ${response.status}`);
		}
		
		const data = await response.json();
		return json(data);
	} catch (err) {
		console.error('Error fetching sensor data:', err);
		throw error(503, {
			message: 'Backend service unavailable',
			details: err instanceof Error ? err.message : 'Unknown error'
		});
	}
};

export const POST: RequestHandler = async ({ request, fetch }) => {
	try {
		const body = await request.json();
		
		// Forward the request to the backend
		const response = await fetch(`${BACKEND_URL}/sensors/refresh`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body)
		});
		
		if (!response.ok) {
			throw new Error(`Backend responded with status: ${response.status}`);
		}
		
		const data = await response.json();
		return json(data);
	} catch (err) {
		console.error('Error refreshing sensors:', err);
		throw error(503, {
			message: 'Backend service unavailable',
			details: err instanceof Error ? err.message : 'Unknown error'
		});
	}
};