export const appConfig = {
    network: import.meta.env.VITE_SUI_NETWORK || 'testnet',
    packageId: import.meta.env.VITE_SUI_PACKAGE_ID || '0xYOUR_PACKAGE_ID',
    adminCapId: import.meta.env.VITE_SUI_ADMIN_CAP_ID || '0xYOUR_ADMIN_CAP_ID',
    treasuryCapId: import.meta.env.VITE_SUI_TREASURY_CAP_ID || '0xYOUR_TREASURY_CAP_ID',
    treasuryStateId: import.meta.env.VITE_SUI_TREASURY_STATE_ID || '0xYOUR_TREASURY_STATE_ID',
    coinType:
        import.meta.env.VITE_SUI_COIN_TYPE || '0xYOUR_PACKAGE_ID::crozz_coin::CROZZ_COIN',
    tokenSymbol: import.meta.env.VITE_SUI_TOKEN_SYMBOL || 'CROZZ',
    tokenDecimals: Number(import.meta.env.VITE_SUI_TOKEN_DECIMALS || '9'),
    tokenIconUrl:
        import.meta.env.VITE_SUI_TOKEN_ICON_URL ||
        'https://crozzcoin.com/wp-content/uploads/2025/08/cropped-logo-no-background-270x270.png',
} as const;

export const typeConfig = {
    adminCapType: `${appConfig.packageId}::crozz_coin::AdminCap`,
    treasuryStateType: `${appConfig.packageId}::crozz_coin::TreasuryState`,
    mintEventType: `${appConfig.packageId}::crozz_coin::MintEvent`,
    burnEventType: `${appConfig.packageId}::crozz_coin::BurnEvent`,
    pauseEventType: `${appConfig.packageId}::crozz_coin::PauseEvent`,
    adminTransferredEventType: `${appConfig.packageId}::crozz_coin::AdminTransferredEvent`,
    treasuryCapType: `0x2::coin::TreasuryCap<${appConfig.coinType}>`,
    coinObjectType: `0x2::coin::Coin<${appConfig.coinType}>`,
} as const;

export const isConfigured =
    !appConfig.packageId.includes('YOUR_PACKAGE_ID') &&
    !appConfig.treasuryStateId.includes('YOUR_TREASURY_STATE_ID') &&
    !appConfig.coinType.includes('YOUR_PACKAGE_ID');
