# Lodestar prover

The state_prover is a simple wrapper for the proof endpoints of Lodestar. The Lodestar prover provides two primary endpoints for generating Merkle inclusion proofs. These endpoints allow users to obtain proofs either directly from a beacon block or from the beacon state of a block. The endpoints are designed to accept requests with either a Merkle path or a specific generalized index (gindex).

## Setup

- Copy `.env.template` to `.env` and populate it with your lodestar API URLs.
- Run `yarn` to install necessary dependencies.
- Execute `yarn serve` to start the server.

## Endpoints

### Beacon Block Proof Endpoint

This endpoint generates a Merkle inclusion proof for a given beacon block. The request must specify the block identifier and the path or gindex for which the proof is required.

```http
GET /block_proof?block_id=<block_identifier>&[path=<merkle_path>|gindex=<gindex>]
```

* block_id: The block root of the beacon block (or a special value like 'head', or 'finalized').
* path or gindex: The Merkle path or generalized index for which the proof is required. Paths are provided as a comma-separated string ie: "body,execution_payload,transactions".

#### Examples

```bash
 $ curl 'localhost:3000/block_proof?block_id=0x3684981bfe46f...&gindex=24332'
 $ curl 'localhost:3000/block_proof?block_id=head&path=body,execution_payload,transaction,32'
```

#### Example response

```json
{
  "type": "single",
  "gindex": 24332,
  "leaf": "<leaf_value>",
  "witnesses": ["<witness_value_1>", "<witness_value_2>", "..."]
}
```

### Beacon State Merkle Proof Endpoint

The `/state_proof`` endpoint is designed to generate Merkle inclusion proofs
from the beacon state. This is particularly useful for applications that require
verification of specific pieces of state data within the beacon chain.

```http
GET /block_proof?block_id=<block_identifier>&[path=<merkle_path>|gindex=<gindex>]
```

* `state_id`: The identifier of the state in the beacon chain. This can be either the state_root, or a special value like 'head' to indicate the latest state.
* `path` or `gindex`: The comma-separated path or generalized index for which the proof is required. This specifies the exact part of the state for which the proof is being requested. 

#### Examples

```bash
 $ curl 'localhost:3000/state_proof?state_id=0x9a1a476900b9...&gindex=234543'
 $ curl 'localhost:3000/state_proof?state_id=head&path=historical_roots,12'
```

#### Example response

```json
{
  "type": "single",
  "gindex": 37,
  "leaf": "<leaf_value>",
  "witnesses": ["<witness_value_1>", "<witness_value_2>", "..."]
}
```


## Examples

```bash
curl 'localhost:3000/state_proof?state_id=head&gindex=37'

  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   464  100   464    0     0   1322      0 --:--:-- --:--:-- --:--:--  1352
{
  "type": "single",
  "gindex": 37,
  "leaf": "0xbcb9716517ffdbe366f5d01ad19ee694a1a11d8d42ed28bdb79f3449487497b7",
  "witnesses": [
    "0xd495e515288a100a2cb8c7e15d282e11ca03de42ad4930ac7d4bcfa2dd575e22",
    "0x26b1b928c1ff8f8b31419d35a8fde34d1d7031875b8e020da0ad13ea5487a4d4",
    "0x93be2d75412e06966eb6180cac7a09f840071c4a230bc9bdca3d81491f488182",
    "0x5d118080e7c6cc1a366629ea384792412a974df81394375e21fecbdd65c2918e",
    "0xa6b8fdab19502540773368abb9336e98fad638b37ff731efa1539248ab9bb9a1"
  ]
}
```

# Acknowledgments

- [Lodestar](https://lodestar.chainsafe.io): For exposing an amazing and super helpful set of endpoints to generate Merkle proofs without needing to download the whole block or state!
