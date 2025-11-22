/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/voting_app.json`.
 */
export type VotingApp = {
  "address": "nWQ6uXRz9VRLbHwWD2WyaHULWgMrWGLSFi4TuEC3qmX",
  "metadata": {
    "name": "votingApp",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initializeBallot",
      "discriminator": [
        47,
        140,
        132,
        69,
        184,
        201,
        73,
        0
      ],
      "accounts": [
        {
          "name": "ballot",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "options",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "vote",
      "discriminator": [
        227,
        110,
        155,
        23,
        136,
        126,
        172,
        25
      ],
      "accounts": [
        {
          "name": "ballot",
          "writable": true
        },
        {
          "name": "voter",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "optionIndex",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "ballot",
      "discriminator": [
        3,
        232,
        121,
        204,
        232,
        137,
        138,
        164
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidOptions",
      "msg": "Too many options or none provided"
    },
    {
      "code": 6001,
      "name": "optionTooLong",
      "msg": "Option string too long"
    },
    {
      "code": 6002,
      "name": "titleTooLong",
      "msg": "Title too long"
    },
    {
      "code": 6003,
      "name": "invalidOptionIndex",
      "msg": "Invalid option index"
    },
    {
      "code": 6004,
      "name": "alreadyVoted",
      "msg": "This wallet already voted"
    },
    {
      "code": 6005,
      "name": "overflow",
      "msg": "Overflow occurred"
    }
  ],
  "types": [
    {
      "name": "ballot",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "options",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "votes",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "voters",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    }
  ]
};
