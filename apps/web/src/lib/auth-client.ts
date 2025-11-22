import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

// If client and server are separate projects, declare the additional fields
// shape manually so TypeScript can infer them without importing server types.
export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_SERVER_URL,
	plugins: [
		inferAdditionalFields({
			user: {
				// `admin` is a server-provided boolean; not an input field from client.
				admin: {
					type: "boolean",
					input: false,
				},
			},
		}),
	],
});
