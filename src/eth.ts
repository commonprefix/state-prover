import { BeaconState } from "@lodestar/types"
import { ApiClient, ApiError, getClient } from "@lodestar/api";
import { ChainConfig, ChainForkConfig, createChainForkConfig } from "@lodestar/config"
import { holeskyChainConfig, mainnetChainConfig, sepoliaChainConfig } from "@lodestar/config/networks";
import { ForkName } from "@lodestar/params";
import { CompactMultiProof, ProofType, SingleProof, Tree, computeDescriptor } from "@chainsafe/persistent-merkle-tree";
import { LodestarError } from "./errors.js";
import { toHexString } from '@chainsafe/ssz'

export type NETWORK = "mainnet" | "holesky" | "sepolia";

const networkToConfig: {[key in NETWORK]: ChainConfig;} = {
    "holesky": holeskyChainConfig,
    "sepolia": sepoliaChainConfig,
    "mainnet": mainnetChainConfig
};

export class EthAPI {
    private consensus: ApiClient;
    private config: ChainForkConfig;

    constructor(beaconURL: string, network: NETWORK) {
        if (!networkToConfig[network]) {
            throw new Error(`Undefined chain config for network ${network}`);
        }
        this.config = createChainForkConfig(networkToConfig[network]);
        this.consensus = getClient({ baseUrl: beaconURL }, { config: this.config })
    }

    async getForkNameByStateId(stateId: string): Promise<ForkName> {
        const res = await this.consensus.beacon.getStateFork({stateId});
        if (!res.ok){
            throw new LodestarError(res.error() as ApiError);
        }

        for (const forkName in this.config.forks) {
            if (toHexString(this.config.forks[forkName as ForkName].version) == toHexString(res.value().currentVersion)) {
                return forkName as ForkName;
            }
        }
            
        throw new Error(`Failed to get fork name for state ${stateId}`);
    }

    async getForkNameByBlockId(blockId: string): Promise<ForkName> {
        const res = await this.consensus.beacon.getBlockHeader({blockId});
        if (!res.ok){
            throw new LodestarError(res.error() as ApiError);
        }

        return this.config.getForkName(res.value().header.message.slot)        
    }

    async getStateProof(stateId: string, gIndex: any): Promise<SingleProof> {
        const descriptor = computeDescriptor([gIndex])
        const res = await this.consensus.proof.getStateProof({stateId, descriptor})
        if (!res.ok){
            throw new LodestarError(res.error() as ApiError);
        }

        const tree = Tree.createFromProof(res.value());
        const proof: SingleProof = tree.getProof({
            type: ProofType.single,
            gindex: gIndex,
        }) as SingleProof;

        return proof
    }

    async getBlockProof(blockRoot: string, gIndex: any): Promise<SingleProof> {
        const descriptor = computeDescriptor([gIndex])
        const res = await this.consensus.proof.getBlockProof({blockId: blockRoot, descriptor})
        if (!res.ok){
            throw new LodestarError(res.error() as ApiError);
        }

        const tree = Tree.createFromProof(res.value());
        const proof: SingleProof = tree.getProof({
            type: ProofType.single,
            gindex: gIndex,
        }) as SingleProof;

        return proof
    }

    async getState(stateId: string): Promise<BeaconState> {
        const res = await this.consensus.debug.getStateV2({stateId});
        if (!res.ok) {
            console.error(res.error())
            throw new Error("Error fetching state")
        }
 
        return res.value()
    }
}
