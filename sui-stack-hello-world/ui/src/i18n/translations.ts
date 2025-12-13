/**
 * Internationalization (i18n) translations
 * Supports English and Spanish
 */

export type Language = 'en' | 'es';

export interface Translations {
  common: {
    welcome: string;
    appName: string;
    loading: string;
    error: string;
    success: string;
    cancel: string;
    submit: string;
    close: string;
    save: string;
    edit: string;
    delete: string;
    create: string;
    back: string;
    next: string;
    previous: string;
    confirm: string;
    settings: string;
    language: string;
  };
  navigation: {
    home: string;
    dashboard: string;
    tokens: string;
    wallet: string;
    explore: string;
    docs: string;
    about: string;
  };
  tokens: {
    createToken: string;
    tokenName: string;
    tokenSymbol: string;
    decimals: string;
    initialSupply: string;
    description: string;
    imageUrl: string;
    maxSupply: string;
    tokenCreated: string;
    tokenFailed: string;
    pauseToken: string;
    unpauseToken: string;
    freezeAddress: string;
    unfreezeAddress: string;
    updateMetadata: string;
    lockMetadata: string;
  };
  wallet: {
    connectWallet: string;
    walletConnected: string;
    walletDisconnected: string;
    walletAddress: string;
    balance: string;
    sendCoins: string;
    recipient: string;
    amount: string;
    selectNetwork: string;
  };
  smart_contract: {
    smartContract: string;
    greeting: string;
    sayHello: string;
    yourName: string;
    greetingCreated: string;
    greetingList: string;
    noGreetings: string;
  };
  errors: {
    networkError: string;
    invalidAddress: string;
    insufficientBalance: string;
    transactionFailed: string;
    contractError: string;
  };
  messages: {
    confirmAction: string;
    saved: string;
    deleted: string;
    updated: string;
    created: string;
  };
}

export const EN: Translations = {
  common: {
    welcome: 'Welcome to Crozz Coin',
    appName: 'Crozz Coin',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    submit: 'Submit',
    close: 'Close',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    create: 'Create',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    confirm: 'Confirm',
    settings: 'Settings',
    language: 'Language',
  },
  navigation: {
    home: 'Home',
    dashboard: 'Dashboard',
    tokens: 'Tokens',
    wallet: 'Wallet',
    explore: 'Explore',
    docs: 'Documentation',
    about: 'About',
  },
  tokens: {
    createToken: 'Create Token',
    tokenName: 'Token Name',
    tokenSymbol: 'Token Symbol',
    decimals: 'Decimals',
    initialSupply: 'Initial Supply',
    description: 'Description',
    imageUrl: 'Image URL',
    maxSupply: 'Max Supply',
    tokenCreated: 'Token created successfully',
    tokenFailed: 'Failed to create token',
    pauseToken: 'Pause Token',
    unpauseToken: 'Unpause Token',
    freezeAddress: 'Freeze Address',
    unfreezeAddress: 'Unfreeze Address',
    updateMetadata: 'Update Metadata',
    lockMetadata: 'Lock Metadata',
  },
  wallet: {
    connectWallet: 'Connect Wallet',
    walletConnected: 'Wallet Connected',
    walletDisconnected: 'Wallet Disconnected',
    walletAddress: 'Wallet Address',
    balance: 'Balance',
    sendCoins: 'Send Coins',
    recipient: 'Recipient',
    amount: 'Amount',
    selectNetwork: 'Select Network',
  },
  smart_contract: {
    smartContract: 'Smart Contract',
    greeting: 'Greeting',
    sayHello: 'Say Hello',
    yourName: 'Your Name',
    greetingCreated: 'Greeting created successfully',
    greetingList: 'Greeting List',
    noGreetings: 'No greetings found',
  },
  errors: {
    networkError: 'Network error occurred',
    invalidAddress: 'Invalid address',
    insufficientBalance: 'Insufficient balance',
    transactionFailed: 'Transaction failed',
    contractError: 'Contract error',
  },
  messages: {
    confirmAction: 'Are you sure you want to perform this action?',
    saved: 'Saved successfully',
    deleted: 'Deleted successfully',
    updated: 'Updated successfully',
    created: 'Created successfully',
  },
};

export const ES: Translations = {
  common: {
    welcome: 'Bienvenido a Crozz Coin',
    appName: 'Crozz Coin',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    submit: 'Enviar',
    close: 'Cerrar',
    save: 'Guardar',
    edit: 'Editar',
    delete: 'Eliminar',
    create: 'Crear',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    confirm: 'Confirmar',
    settings: 'Configuración',
    language: 'Idioma',
  },
  navigation: {
    home: 'Inicio',
    dashboard: 'Panel de Control',
    tokens: 'Tokens',
    wallet: 'Billetera',
    explore: 'Explorar',
    docs: 'Documentación',
    about: 'Acerca de',
  },
  tokens: {
    createToken: 'Crear Token',
    tokenName: 'Nombre del Token',
    tokenSymbol: 'Símbolo del Token',
    decimals: 'Decimales',
    initialSupply: 'Suministro Inicial',
    description: 'Descripción',
    imageUrl: 'URL de la Imagen',
    maxSupply: 'Suministro Máximo',
    tokenCreated: 'Token creado exitosamente',
    tokenFailed: 'Error al crear el token',
    pauseToken: 'Pausar Token',
    unpauseToken: 'Reanudar Token',
    freezeAddress: 'Congelar Dirección',
    unfreezeAddress: 'Descongelar Dirección',
    updateMetadata: 'Actualizar Metadatos',
    lockMetadata: 'Bloquear Metadatos',
  },
  wallet: {
    connectWallet: 'Conectar Billetera',
    walletConnected: 'Billetera Conectada',
    walletDisconnected: 'Billetera Desconectada',
    walletAddress: 'Dirección de Billetera',
    balance: 'Saldo',
    sendCoins: 'Enviar Monedas',
    recipient: 'Destinatario',
    amount: 'Cantidad',
    selectNetwork: 'Seleccionar Red',
  },
  smart_contract: {
    smartContract: 'Contrato Inteligente',
    greeting: 'Saludo',
    sayHello: 'Decir Hola',
    yourName: 'Tu Nombre',
    greetingCreated: 'Saludo creado exitosamente',
    greetingList: 'Lista de Saludos',
    noGreetings: 'No se encontraron saludos',
  },
  errors: {
    networkError: 'Error de red',
    invalidAddress: 'Dirección inválida',
    insufficientBalance: 'Saldo insuficiente',
    transactionFailed: 'Error en la transacción',
    contractError: 'Error del contrato',
  },
  messages: {
    confirmAction: '¿Estás seguro de que deseas realizar esta acción?',
    saved: 'Guardado exitosamente',
    deleted: 'Eliminado exitosamente',
    updated: 'Actualizado exitosamente',
    created: 'Creado exitosamente',
  },
};

export const translations: Record<Language, Translations> = {
  en: EN,
  es: ES,
};
