import { EthAPI } from './eth.js'
import { LodestarError } from './errors.js'
import { toHexString } from '@chainsafe/ssz'
import express from 'express'
import cors from 'cors'
import { getConfig, getGindexFromQueryParams } from './utils.js'

const CONFIG = getConfig();
const PORT = CONFIG.port as number;

let ethAPIs: {[network: string]: EthAPI} = {};
for (let [network, beaconUrl] of Object.entries(CONFIG.beaconUrls)) {
	ethAPIs[network] = new EthAPI(beaconUrl as string)
}

const app = express()
app.use(cors())

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

app.get('/has_state', async (req, res: express.Response) => {
	let stateId = req.query.state_id
	let network = req.query.network ? req.query.network as string : 'mainnet'

	if (stateId === undefined) {
		return res.status(400).send('Missing state_id')
	}

	const gindex = 1
	try {
		// Could take proof
		const proof = await ethAPIs[network].getStateProof(stateId as string, Number(gindex))
		return res.sendStatus(200)
	}
	catch (e) {
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
		console.log(serializedProof)

		return res.json(serializedProof)
	}
	catch (e: any) {
		let code = 'code' in e ? e.code : 500
		return res.status(code).send(e.message)
	}
})

app.listen(PORT, () => {
	console.log(`Magic is happening at http://localhost:${PORT}`)
})
