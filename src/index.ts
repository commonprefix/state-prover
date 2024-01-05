import { EthAPI } from './eth.js'
import { LodestarError } from './errors.js'
import { toHexString } from '@chainsafe/ssz'
import express from 'express'
import cors from 'cors'
import { getConfig, getEnv, getGindexFromQueryParams } from './utils.js'

const app = express()
const port = +getEnv("PORT", "3000")

app.use(cors())

let ethAPIs: {[network: string]: EthAPI} = {};
let config = getConfig();
for (let [network, beaconUrl] of Object.entries(config.beaconUrls)) {
	ethAPIs[network] = new EthAPI(beaconUrl as string)
}

app.get('/state_proof', async (req: express.Request, res: express.Response) => {
	let stateId = req.query.state_id
	let network = req.query.network ? req.query.network as string : 'mainnet'

	if (stateId === undefined) {
		return res.status(400).send('Missing state_id')
	}

	try {
		const gindex = getGindexFromQueryParams('state', req.query)
		const proof = await ethAPIs[network].getStateProof(stateId as string, Number(gindex))

		const serializedProof = {
			...proof,
			leaf: toHexString(proof.leaf),
			witnesses: proof.witnesses.map(w => toHexString(w))
		} 

		return res.json(serializedProof)
	}
	catch (e: any) {
		let code = 'code' in e ? e.code : 500
		return res.status(code).send(e.message)
	}
})

app.get('/block_proof', async (req, res: express.Response) => {
	let blockId = req.query.block_id
	let network = req.query.network ? req.query.network as string : 'mainnet'

	if (blockId === undefined) {
		return res.status(400).send('Missing block_id')
	}

	try {
		const gindex = getGindexFromQueryParams('block', req.query)
		const proof = await ethAPIs[network].getBlockProof(blockId as string, Number(gindex))

		const serializedProof = {
			...proof,
			leaf: toHexString(proof.leaf),
			witnesses: proof.witnesses.map(w => toHexString(w))
		}

		return res.json(serializedProof)
	}
	catch (e: any) {
		let code = 'code' in e ? e.code : 500
		return res.status(code).send(e.message)
	}
})

app.listen(port, () => {
	console.log(`Magic is happening at http://localhost:${port}`)
})
