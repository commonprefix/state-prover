import "dotenv/config"
import * as deneb from '@lodestar/types/deneb'

export function getConfig(): { port: number, beaconUrls: {[network: string]: string}} {
    let port = +getEnv("PORT", "3000")

    let beaconUrls: {[network: string]: string;} = {};
    for (let network of ["goerli", "sepolia", "mainnet"]) {
        let beaconURL = getEnv(`${network.toUpperCase()}_BEACON_API`)
        if (beaconURL) beaconUrls[network] = beaconURL
    }

    const config = { port, beaconUrls }
    console.log("Loaded config", config)
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
    console.log("PATH", path);

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
                ? Number(deneb.ssz.BeaconBlock.getPathInfo(parsedPath).gindex)
                : Number(deneb.ssz.BeaconState.getPathInfo(parsedPath).gindex);
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