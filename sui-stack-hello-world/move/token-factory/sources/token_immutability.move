/// Token Immutability Module
/// 
/// This module defines and enforces immutable properties of Sui tokens.
/// Once a token is created with certain settings, these values cannot be changed:
/// - Blockchain (network)
/// - Module name
/// - Decimals
/// - Total supply (if treasury cap is revoked)
///
/// This ensures transparency and trust in the Sui ecosystem.

module token_factory::token_immutability {
    use std::string::String;
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;

    // =================== Structs ===================

    /// Represents immutable token properties that cannot be changed after creation
    public struct ImmutableTokenProperties has store {
        /// The blockchain network where token is deployed
        blockchain: String,
        /// The module name of the token (unique identifier in smart contract)
        module_name: String,
        /// Number of decimal places (0-9)
        decimals: u8,
        /// Maximum total supply (if treasury cap revoked, this is final supply)
        total_supply: u64,
        /// Timestamp when token was created
        created_at: u64,
    }

    /// Verification status of token source code
    public struct VerificationStatus has store, drop {
        /// Whether the token source code is verified
        is_verified: bool,
        /// Verification method: "20lab_label" or "custom_label"
        verification_method: String,
        /// Custom verification label (if using custom_label method)
        custom_label: String,
        /// Timestamp of verification
        verified_at: u64,
        /// IPFS hash or block explorer link
        verification_link: String,
    }

    /// Token metadata with immutability information
    public struct ImmutableTokenMetadata has store {
        /// Immutable token properties
        properties: ImmutableTokenProperties,
        /// Current verification status
        verification: VerificationStatus,
        /// Whether metadata authority can still make changes
        metadata_locked: bool,
    }

    // =================== Events ===================

    /// Emitted when a token is created with immutable properties
    public struct TokenCreated has copy, drop {
        token_id: address,
        blockchain: String,
        module_name: String,
        decimals: u8,
        total_supply: u64,
    }

    /// Emitted when token source code is verified
    public struct TokenVerified has copy, drop {
        token_id: address,
        verification_method: String,
        verified_at: u64,
    }

    /// Emitted when metadata authority is locked (immutable)
    public struct MetadataLocked has copy, drop {
        token_id: address,
        locked_at: u64,
    }

    // =================== Public Functions ===================

    /// Create immutable token properties
    /// 
    /// These properties are set once and cannot be changed:
    /// - blockchain: The Sui network (Mainnet/Testnet/Devnet)
    /// - module_name: Unique identifier (lowercase, alphanumeric + underscore)
    /// - decimals: Token divisibility (0-9, recommended: 6 or 9)
    /// - total_supply: Maximum tokens possible
    public fun create_immutable_properties(
        blockchain: String,
        module_name: String,
        decimals: u8,
        total_supply: u64,
        created_at: u64,
    ): ImmutableTokenProperties {
        assert!(decimals <= 9, 1001); // E_INVALID_DECIMALS
        assert!(total_supply > 0, 1002); // E_INVALID_SUPPLY
        
        ImmutableTokenProperties {
            blockchain,
            module_name,
            decimals,
            total_supply,
            created_at,
        }
    }

    /// Create initial verification status (unverified)
    public fun create_unverified_status(): VerificationStatus {
        VerificationStatus {
            is_verified: false,
            verification_method: std::string::utf8(b"none"),
            custom_label: std::string::utf8(b""),
            verified_at: 0,
            verification_link: std::string::utf8(b""),
        }
    }

    /// Verify token with 20lab label
    public fun verify_with_20lab_label(
        verification: &mut VerificationStatus,
        verification_link: String,
        verified_at: u64,
    ) {
        verification.is_verified = true;
        verification.verification_method = std::string::utf8(b"20lab_label");
        verification.verified_at = verified_at;
        verification.verification_link = verification_link;
    }

    /// Verify token with custom label
    public fun verify_with_custom_label(
        verification: &mut VerificationStatus,
        custom_label: String,
        verification_link: String,
        verified_at: u64,
    ) {
        verification.is_verified = true;
        verification.verification_method = std::string::utf8(b"custom_label");
        verification.custom_label = custom_label;
        verification.verified_at = verified_at;
        verification.verification_link = verification_link;
    }

    /// Create immutable token metadata
    public fun create_immutable_metadata(
        properties: ImmutableTokenProperties,
        verification: VerificationStatus,
    ): ImmutableTokenMetadata {
        ImmutableTokenMetadata {
            properties,
            verification,
            metadata_locked: false,
        }
    }

    /// Lock metadata authority (makes metadata immutable)
    public fun lock_metadata(metadata: &mut ImmutableTokenMetadata) {
        metadata.metadata_locked = true;
    }

    // =================== Getter Functions ===================

    /// Get blockchain network
    public fun blockchain(properties: &ImmutableTokenProperties): String {
        properties.blockchain
    }

    /// Get module name
    public fun module_name(properties: &ImmutableTokenProperties): String {
        properties.module_name
    }

    /// Get decimal places
    public fun decimals(properties: &ImmutableTokenProperties): u8 {
        properties.decimals
    }

    /// Get total supply
    public fun total_supply(properties: &ImmutableTokenProperties): u64 {
        properties.total_supply
    }

    /// Get creation timestamp
    public fun created_at(properties: &ImmutableTokenProperties): u64 {
        properties.created_at
    }

    /// Check if token is verified
    public fun is_verified(verification: &VerificationStatus): bool {
        verification.is_verified
    }

    /// Get verification method
    public fun verification_method(verification: &VerificationStatus): String {
        verification.verification_method
    }

    /// Get custom label
    public fun custom_label(verification: &VerificationStatus): String {
        verification.custom_label
    }

    /// Get verification timestamp
    public fun verified_at(verification: &VerificationStatus): u64 {
        verification.verified_at
    }

    /// Get verification link
    public fun verification_link(verification: &VerificationStatus): String {
        verification.verification_link
    }

    /// Check if metadata is locked
    public fun is_metadata_locked(metadata: &ImmutableTokenMetadata): bool {
        metadata.metadata_locked
    }

    /// Get immutable properties from metadata
    public fun properties(metadata: &ImmutableTokenMetadata): &ImmutableTokenProperties {
        &metadata.properties
    }

    /// Get verification status from metadata
    public fun verification(metadata: &ImmutableTokenMetadata): &VerificationStatus {
        &metadata.verification
    }

    // =================== Error Codes ===================

    // E_INVALID_DECIMALS = 1001
    // E_INVALID_SUPPLY = 1002
}
