// Copyright (c) Crozz Ecosystem
// SPDX-License-Identifier: Apache-2.0

/// Service Marketplace Contract
/// Allows admins to register services (free or paid) and users to access them
module service_marketplace::marketplace;

use std::string::String;
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::balance::{Self, Balance};
use sui::table::{Self, Table};
use sui::event;

// Error codes
const ENotAuthorized: u64 = 1;
const EInsufficientPayment: u64 = 2;
const EServiceNotFound: u64 = 3;
const EServiceInactive: u64 = 4;
const EInvalidPrice: u64 = 5;

/// Admin capability for managing the marketplace
public struct AdminCap has key, store {
    id: UID,
}

/// Represents a service in the marketplace
public struct Service has store {
    name: String,
    description: String,
    price: u64,  // 0 for free services
    is_active: bool,
    usage_count: u64,
    revenue: u64,
}

/// Main marketplace object
public struct Marketplace has key {
    id: UID,
    services: Table<u64, Service>,
    next_service_id: u64,
    total_revenue: Balance<SUI>,
    admin: address,
}

/// Event emitted when a service is registered
public struct ServiceRegistered has copy, drop {
    service_id: u64,
    name: String,
    price: u64,
}

/// Event emitted when a service is accessed
public struct ServiceAccessed has copy, drop {
    service_id: u64,
    user: address,
    amount_paid: u64,
}

/// Event emitted when revenue is withdrawn
public struct RevenueWithdrawn has copy, drop {
    amount: u64,
    recipient: address,
}

/// Initialize the marketplace
fun init(ctx: &mut TxContext) {
    let admin_cap = AdminCap {
        id: object::new(ctx),
    };
    
    let marketplace = Marketplace {
        id: object::new(ctx),
        services: table::new(ctx),
        next_service_id: 0,
        total_revenue: balance::zero(),
        admin: tx_context::sender(ctx),
    };
    
    transfer::share_object(marketplace);
    transfer::transfer(admin_cap, tx_context::sender(ctx));
}

/// Register a new service (admin only)
public fun register_service(
    _admin_cap: &AdminCap,
    marketplace: &mut Marketplace,
    name: String,
    description: String,
    price: u64,
    ctx: &mut TxContext,
) {
    let service_id = marketplace.next_service_id;
    marketplace.next_service_id = service_id + 1;
    
    let service = Service {
        name,
        description,
        price,
        is_active: true,
        usage_count: 0,
        revenue: 0,
    };
    
    table::add(&mut marketplace.services, service_id, service);
    
    event::emit(ServiceRegistered {
        service_id,
        name: service.name,
        price,
    });
}

/// Update service status (admin only)
public fun update_service_status(
    _admin_cap: &AdminCap,
    marketplace: &mut Marketplace,
    service_id: u64,
    is_active: bool,
) {
    assert!(table::contains(&marketplace.services, service_id), EServiceNotFound);
    let service = table::borrow_mut(&mut marketplace.services, service_id);
    service.is_active = is_active;
}

/// Update service price (admin only)
public fun update_service_price(
    _admin_cap: &AdminCap,
    marketplace: &mut Marketplace,
    service_id: u64,
    new_price: u64,
) {
    assert!(table::contains(&marketplace.services, service_id), EServiceNotFound);
    let service = table::borrow_mut(&mut marketplace.services, service_id);
    service.price = new_price;
}

/// Access a service (free)
public fun access_free_service(
    marketplace: &mut Marketplace,
    service_id: u64,
    ctx: &mut TxContext,
) {
    assert!(table::contains(&marketplace.services, service_id), EServiceNotFound);
    let service = table::borrow_mut(&mut marketplace.services, service_id);
    assert!(service.is_active, EServiceInactive);
    assert!(service.price == 0, EInsufficientPayment);
    
    service.usage_count = service.usage_count + 1;
    
    event::emit(ServiceAccessed {
        service_id,
        user: tx_context::sender(ctx),
        amount_paid: 0,
    });
}

/// Access a paid service
public fun access_paid_service(
    marketplace: &mut Marketplace,
    service_id: u64,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
) {
    assert!(table::contains(&marketplace.services, service_id), EServiceNotFound);
    let service = table::borrow_mut(&mut marketplace.services, service_id);
    assert!(service.is_active, EServiceInactive);
    
    let amount = coin::value(&payment);
    assert!(amount >= service.price, EInsufficientPayment);
    
    service.usage_count = service.usage_count + 1;
    service.revenue = service.revenue + amount;
    
    // Add payment to marketplace revenue
    balance::join(&mut marketplace.total_revenue, coin::into_balance(payment));
    
    event::emit(ServiceAccessed {
        service_id,
        user: tx_context::sender(ctx),
        amount_paid: amount,
    });
}

/// Withdraw revenue (admin only)
public fun withdraw_revenue(
    _admin_cap: &AdminCap,
    marketplace: &mut Marketplace,
    amount: u64,
    ctx: &mut TxContext,
) {
    let balance = balance::split(&mut marketplace.total_revenue, amount);
    let coin = coin::from_balance(balance, ctx);
    let recipient = marketplace.admin;
    
    transfer::public_transfer(coin, recipient);
    
    event::emit(RevenueWithdrawn {
        amount,
        recipient,
    });
}

/// Get service details (read-only)
public fun get_service_price(marketplace: &Marketplace, service_id: u64): u64 {
    assert!(table::contains(&marketplace.services, service_id), EServiceNotFound);
    let service = table::borrow(&marketplace.services, service_id);
    service.price
}

/// Get service usage count (read-only)
public fun get_service_usage(marketplace: &Marketplace, service_id: u64): u64 {
    assert!(table::contains(&marketplace.services, service_id), EServiceNotFound);
    let service = table::borrow(&marketplace.services, service_id);
    service.usage_count
}

/// Get service revenue (read-only)
public fun get_service_revenue(marketplace: &Marketplace, service_id: u64): u64 {
    assert!(table::contains(&marketplace.services, service_id), EServiceNotFound);
    let service = table::borrow(&marketplace.services, service_id);
    service.revenue
}

/// Get total marketplace revenue balance
public fun get_total_revenue(marketplace: &Marketplace): u64 {
    balance::value(&marketplace.total_revenue)
}

/// Get next service ID
public fun get_next_service_id(marketplace: &Marketplace): u64 {
    marketplace.next_service_id
}

/// Check if service is active
public fun is_service_active(marketplace: &Marketplace, service_id: u64): bool {
    assert!(table::contains(&marketplace.services, service_id), EServiceNotFound);
    let service = table::borrow(&marketplace.services, service_id);
    service.is_active
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
