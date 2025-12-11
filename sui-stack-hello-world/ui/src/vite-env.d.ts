// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUI_NETWORK?: string;
  readonly VITE_FULLNODE_URL?: string;
  readonly VITE_FAUCET_URL?: string;
  readonly VITE_GRAPHQL_URL?: string;
  readonly VITE_INDEXER_URL?: string;
  readonly VITE_ENABLE_GRAPHQL?: string;
  readonly VITE_NETWORK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUI_NETWORK?: string;
  readonly VITE_FULLNODE_URL?: string;
  readonly VITE_FAUCET_URL?: string;
  readonly VITE_GRAPHQL_URL?: string;
  readonly VITE_INDEXER_URL?: string;
  readonly VITE_ENABLE_GRAPHQL?: string;
  readonly VITE_NETWORK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
