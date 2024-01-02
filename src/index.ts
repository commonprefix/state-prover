import { EthAPI } from './eth.js'
import { toHexString } from '@chainsafe/ssz'
import express from 'express'
import cors from 'cors'
import { getGindexFromQueryParams } from './utils.js'

const app = express()
const port = 3000

app.use(cors())

const ethAPI = new EthAPI()

app.get('/state_proof', async (req: express.Request, res: express.Response) => {
	let stateId = req.query.state_id

	if (stateId === undefined) {
		return res.status(400).send('Missing state_id')
	}

	try {
		const gindex = getGindexFromQueryParams('state', req.query)
		const proof = await ethAPI.getStateProof(stateId as string, Number(gindex))

		const serializedProof = {
			...proof,
			leaf: toHexString(proof.leaf),
			witnesses: proof.witnesses.map(w => toHexString(w))
		} 

		return res.json(serializedProof)
	}
	catch (e) {
		return res.status(400).send(e.message)
	}
})

app.get('/block_proof', async (req, res: express.Response) => {
	let blockId = req.query.block_id

	if (blockId === undefined) {
		return res.status(400).send('Missing block_id')
	}

	try {
		const gindex = getGindexFromQueryParams('block', req.query)
		const proof = await ethAPI.getBlockProof(blockId as string, Number(gindex))

		const serializedProof = {
			...proof,
			leaf: toHexString(proof.leaf),
			witnesses: proof.witnesses.map(w => toHexString(w))
		}

		return res.json(serializedProof)
	}
	catch (e) {
		return res.status(400).send(e.message)
	}
})

app.listen(port, () => {
	console.log(`Magic is happening at http://localhost:${port}`)
})
