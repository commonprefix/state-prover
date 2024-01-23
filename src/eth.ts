import { allForks, phase0 } from "@lodestar/types"
import * as deneb from "@lodestar/types/deneb"
import { Api, ApiClientErrorResponse, HttpStatusCode, getClient } from "@lodestar/api";
import { config } from "@lodestar/config/default";
import { BeaconBlockHeader } from '@lodestar/types/lib/phase0/types.js';
import {CompactMultiProof, Proof, ProofType, SingleProof, Tree, computeDescriptor, deserializeProof, gindexChild, serializeProof} from "@chainsafe/persistent-merkle-tree";
import { LodestarError } from "./errors.js";
import { state } from "@lodestar/api/lib/beacon/routes/beacon/index.js";

export class EthAPI {
    private consensus: Api

    constructor(beaconURL: string) {
        this.consensus = getClient({ baseUrl: beaconURL }, {config})
    }

    async getStateProof(stateId: string, gIndex: any): Promise<SingleProof> {
        const descriptor = computeDescriptor([gIndex])
        const res = await this.consensus.proof.getStateProof(stateId, descriptor)
        if (res.error) {
            throw new LodestarError(res.error)
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
        if (res.error) {
            throw new LodestarError(res.error)
        }

        const tree = Tree.createFromProof(res.response?.data as CompactMultiProof);
        const proof: SingleProof = tree.getProof({
            type: ProofType.single,
            gindex: gIndex,
        }) as SingleProof;

        return proof
    }

    async getState(stateId: string): Promise<deneb.BeaconState> {
        const res = await this.consensus.debug.getStateV2(stateId);
        if (res.error) {
            console.error(res.error)
            throw new Error("Error fetching state")
        }
 
        return res.response.data as deneb.BeaconState
    }
}
