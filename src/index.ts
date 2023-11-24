import { EthAPI } from './eth.js';
import { fromHexString, toHexString } from '@chainsafe/ssz';
import { verifyMerkleBranch }  from '@lodestar/utils'
import express from 'express'
import cors from 'cors'

const app = express()
const port = 3000

app.use(cors())

const ethAPI = new EthAPI()

app.get('/state_proof', async (req, res: express.Response) => {
	let gindex = req.query.gindex;
	let stateId = req.query.state_id;

	if (stateId === undefined) {
		return res.status(400).send('Missing state_id')
	}
	if (!gindex === undefined || Number.isNaN(Number(gindex))) {
		return res.status(400).send('Invalid or missing gindex')
	}

	try {
		const proof = await ethAPI.getStateProof(stateId as string, Number(gindex));

		// const depth = Math.floor(Math.log2(Number(gindex)))
		// const index = Number(gindex) % (2 ** depth)

		// const merkle_valid = verifyMerkleBranch(
		// 	proof.leaf,
		// 	proof.witnesses,
		// 	depth,
		// 	index,
		// 	fromHexString(stateId as string)
		// )
		// console.log("Is valid proof: ", merkle_valid)

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
	let gindex = req.query.gindex;
	let blockId = req.query.block_id;

	if (blockId === undefined) {
		return res.status(400).send('Missing block_id')
	}
	if (!gindex === undefined || Number.isNaN(Number(gindex))) {
		return res.status(400).send('Invalid or missing gindex')
	}

	try {
		const proof = await ethAPI.getBlockProof(blockId as string, Number(gindex));

		// const depth = Math.floor(Math.log2(Number(gindex)))
		// const index = Number(gindex) % (2 ** depth)

		// const merkle_valid = verifyMerkleBranch(
		// 	proof.leaf,
		// 	proof.witnesses,
		// 	depth,
		// 	index,
		// 	fromHexString(blockId as string)
		// )
		// console.log("Is valid proof: ", merkle_valid)

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
