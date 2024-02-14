import { allForks } from "@lodestar/types"
import { Api, getClient } from "@lodestar/api";
import { ChainConfig, ChainForkConfig, createChainForkConfig } from "@lodestar/config"
import { mainnetChainConfig, goerliChainConfig, sepoliaChainConfig } from "@lodestar/config/networks";
import { ForkName } from "@lodestar/params";
import { CompactMultiProof, ProofType, SingleProof, Tree, computeDescriptor } from "@chainsafe/persistent-merkle-tree";
import { LodestarError } from "./errors.js";
import { toHexString } from '@chainsafe/ssz'

export type NETWORK = "mainnet" | "goerli" | "sepolia";

const networkToConfig: {[key in NETWORK]: ChainConfig;} = {
    "goerli": goerliChainConfig,
    "sepolia": sepoliaChainConfig,
    "mainnet": mainnetChainConfig
};

export class EthAPI {
    private consensus: Api
    private config: ChainForkConfig;

    constructor(beaconURL: string, network: NETWORK) {
        if (!networkToConfig[network]) {
            throw new Error(`Undefined chain config for network ${network}`);
        }
        this.config = createChainForkConfig(networkToConfig[network]);
        this.consensus = getClient({ baseUrl: beaconURL }, { config: this.config })
    }

    async getForkNameByStateId(stateId: string): Promise<ForkName> {
        const req = await this.consensus.beacon.getStateFork(stateId);
        if (req.response) {
            for (const forkName in this.config.forks) {
                if (toHexString(this.config.forks[forkName as ForkName].version) == toHexString(req.response.data.currentVersion)) {
                    return forkName as ForkName;
                }
            }
        }
        if (req.error) {
            throw new LodestarError(req.error);
        }
        throw new Error(`Failed to get fork name for state ${stateId}`);
    }

    async getForkNameByBlockId(blockId: string): Promise<ForkName> {
        const req = await this.consensus.beacon.getBlockHeader(blockId);
        if (req.response) {
            return this.config.getForkName(req.response.data.header.message.slot)
        }
        if (req.error) {
            throw new LodestarError(req.error);
        }
        throw new Error(`Failed to get fork name for block ${blockId}`);
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

    async getState(stateId: string): Promise<allForks.BeaconState> {
        const res = await this.consensus.debug.getStateV2(stateId);
        if (res.error) {
            console.error(res.error)
            throw new Error("Error fetching state")
        }
 
        return res.response.data as allForks.BeaconState
    }
}
