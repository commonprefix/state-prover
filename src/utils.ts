import "dotenv/config"
import * as capella from '@lodestar/types/capella'
import { readFileSync } from 'fs';

export const getConfig = (): {[key: string]: any} => {
    let file = readFileSync("./config.json", 'utf8');
    let config = JSON.parse(file);

    console.info("Loaded config", config)
    return config
}


export const getEnv = (key: string, defaultValue ?: string): string => {
	if (!process.env[key] && !defaultValue) {
		throw new Error(`Environment variable ${key} not set`)
	}

	// @ts-ignore
	return process.env[key] || defaultValue
}


export const parseGindex = (gindex?: string): Number | null => {
	console.log(gindex, Number(gindex), Number.isNaN(Number(gindex)))
	return gindex === undefined || Number.isNaN(Number(gindex))
		? null
		: Number(gindex)
}

export const parsePath = (path: string): (string | number)[] => {
	return path.split(',').map((p) => {
		const parsed = Number(p)
		return Number.isNaN(parsed) ? p : parsed
	})
}

export const getGindexFromQueryParams = (
    pathResolution: 'block' | 'state',
    queryParams: Record<string, any>
): number | null => {
    const { gindex: rawGindex, path } = queryParams;

    const validateGindex = (gindex: any): number => {
        const parsedGindex = Number(gindex);
        if (Number.isNaN(parsedGindex)) {
            throw new Error('Invalid gindex');
        }
        return parsedGindex;
    };

    const resolveGindexFromPath = (path: string): number => {
        const parsedPath = parsePath(path);
        try {
            return pathResolution === 'block'
                ? Number(capella.ssz.BeaconBlock.getPathInfo(parsedPath).gindex)
                : Number(capella.ssz.BeaconState.getPathInfo(parsedPath).gindex);
        } catch (error) {
            throw new Error('Could not resolve path to gindex');
        }
    };

    if (rawGindex !== undefined) {
        return validateGindex(rawGindex);
    }

    if (path === undefined) {
        throw new Error('Both gindex and path are missing');
    }

    return resolveGindexFromPath(path);
};