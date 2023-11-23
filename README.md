# Lodestar prover

The state_prover is a simple wrapper for the `eth/v0/beacon/proof/state/` endpoint of Lodestar. It exposes an API endpoint called `/state_proof`, which can be used to obtain Merkle proofs for specific elements in the Ethereum state, identified by their generalized index (gindex) and state ID (state_id).

## Setup

- Copy `.env.template` to `.env` and populate it with your lodestar API URL.
- Run `yarn` to install necessary dependencies.
- Execute `yarn serve` to start the server.

## Example

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
