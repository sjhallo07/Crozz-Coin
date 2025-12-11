// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { getFullnodeUrl } from "@mysten/sui/client";
import { TESTNET_HELLO_WORLD_PACKAGE_ID } from "./constants.ts";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    localnet: {
      url: import.meta.env.VITE_NETWORK === "localnet" 
        ? "http://127.0.0.1:9000" 
        : getFullnodeUrl("localnet"),
      variables: {
        helloWorldPackageId: TESTNET_HELLO_WORLD_PACKAGE_ID,
      },
    },
    testnet: {
      url: import.meta.env.VITE_FULLNODE_URL || getFullnodeUrl("testnet"),
      variables: {
        helloWorldPackageId: TESTNET_HELLO_WORLD_PACKAGE_ID,
      },
    },
    mainnet: {
      url: import.meta.env.VITE_FULLNODE_URL || getFullnodeUrl("mainnet"),
      variables: {
        helloWorldPackageId: TESTNET_HELLO_WORLD_PACKAGE_ID,
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
