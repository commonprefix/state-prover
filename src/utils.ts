import "dotenv/config"

export const getEnv = (key: string, defaultValue ?: string): string => {
	if (!process.env[key] && !defaultValue) {
		throw new Error(`Environment variable ${key} not set`)
	}

	// @ts-ignore
	return process.env[key] || defaultValue
}
