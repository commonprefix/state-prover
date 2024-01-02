import { phase0 } from "@lodestar/types"
import * as capella from "@lodestar/types/capella"
import { Api, getClient } from "@lodestar/api";
import { config } from "@lodestar/config/default";
import { BeaconBlockHeader } from '@lodestar/types/lib/phase0/types.js';
import {CompactMultiProof, Proof, ProofType, SingleProof, Tree, computeDescriptor, deserializeProof, gindexChild, serializeProof} from "@chainsafe/persistent-merkle-tree";

export class EthAPI {
    private consensus: Api

    constructor(beaconURL: string) {
        this.consensus = getClient({ baseUrl: beaconURL }, {config})
    }

    async getStateProof(stateId: string, gIndex: any): Promise<SingleProof> {
        const descriptor = computeDescriptor([gIndex])
        const res = await this.consensus.proof.getStateProof(stateId, descriptor)
        if (res.error) {
            throw new Error(res.error.message)
        }

        const tree = Tree.createFromProof(res.response?.data as CompactMultiProof);
        const proof: SingleProof = tree.getProof({
            type: ProofType.single,
            gindex: gIndex,
        }) as SingleProof;

        return proof
    }

    async getBlockProof(blockRoot: string, gIndex: any): Promise<SingleProof> {
        const descriptor = computeDescriptor([gIndex])
        const res = await this.consensus.proof.getBlockProof(blockRoot, descriptor)

        const tree = Tree.createFromProof(res.response?.data as CompactMultiProof);
        const proof: SingleProof = tree.getProof({
            type: ProofType.single,
            gindex: gIndex,
        }) as SingleProof;

        return proof
    }
  
    async getBeaconBlock(slot: number | string): Promise<capella.BeaconBlock> {
        const res = await this.consensus.beacon.getBlockV2(slot)
        if (res.error) {
            console.error(res.error)
            throw new Error(`Error fetching or parsing block data.`)
        }

        return res.response.data.message as capella.BeaconBlock
    }

    async getBeaconBlockHeader(slot: number | string): Promise<phase0.BeaconBlockHeader> {
        const res = await this.consensus.beacon.getBlockHeader(slot)
        if (res.error) {
            console.error(res.error)
            throw new Error(`Error fetching or parsing block header data.`)
        }

        return res.response.data.header.message
    }

    toBlockHeader(block: capella.BeaconBlock): BeaconBlockHeader {
        return {
            slot: block.slot,
            proposerIndex: block.proposerIndex,
            parentRoot: block.parentRoot,
            stateRoot: block.stateRoot,
            bodyRoot: capella.ssz.BeaconBlockBody.hashTreeRoot(block.body),
          };
    }
}
