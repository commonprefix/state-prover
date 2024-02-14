import { EthAPI, NETWORK } from './eth.js'
import { toHexString } from '@chainsafe/ssz'
import express from 'express'
import cors from 'cors'
import { getConfig, getGindexFromQueryParams, supportedNetworks } from './utils.js'

const { port, beaconUrls } = getConfig();

const ethAPIs: {[key in NETWORK]: EthAPI} = supportedNetworks.reduce((acc, network) => {
  acc[network] = new EthAPI(beaconUrls[network] as string, network);
  return acc;
}, {} as {[key in NETWORK]: EthAPI});

const app = express()
app.use(cors())

app.get('/state_proof', async (req: express.Request, res: express.Response) => {
	let stateId = req.query.state_id
	let network = req.query.network ? req.query.network as string : 'mainnet'

	if (stateId === undefined) {
		return res.status(400).send('Missing state_id')
	}

	if (!supportedNetworks.includes(network as NETWORK)) {
		return res.status(400).send('Invalid network')
	}

	try {
		const forkName = await ethAPIs[network as NETWORK].getForkNameByStateId(stateId as string);
		const gindex = getGindexFromQueryParams('state', req.query, forkName)
		const proof = await ethAPIs[network as NETWORK].getStateProof(stateId as string, Number(gindex))

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

	if (!supportedNetworks.includes(network as NETWORK)) {
		return res.status(400).send('Invalid network')
	}

	const gindex = 1
	try {
		// Could take proof
		const proof = await ethAPIs[network as NETWORK].getStateProof(stateId as string, Number(gindex))
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

	if (!supportedNetworks.includes(network as NETWORK)) {
		return res.status(400).send('Invalid network')
	}

	try {
		const forkName = await ethAPIs[network as NETWORK].getForkNameByBlockId(blockId as string);
		const gindex = getGindexFromQueryParams('block', req.query, forkName)
		const proof = await ethAPIs[network as NETWORK].getBlockProof(blockId as string, Number(gindex))

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

app.listen(port, () => {
	console.log(`Magic is happening at http://localhost:${port}`)
})

