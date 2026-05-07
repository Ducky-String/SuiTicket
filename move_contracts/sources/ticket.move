module suiticket  ::ticket;

use suiticket::admin::AdminCap;
use suiticket::errors;
use suiticket::treasury::{Self, Treasury};
use std::string::String;
use sui::coin::Coin;
use sui::sui::SUI;

public struct EventConfig has key, store {
    id: object::UID,
    name: String,
    max_supply: u64,
    minted: u64,
}

public struct Ticket has key, store {
    id: object::UID,
    event_id: object::ID,
    used: bool,
}

fun init(ctx: &mut TxContext) {
    let treasury = treasury::new(ctx);
    treasury::share(treasury);
}

public fun create_event(
    _admin: &AdminCap,
    name: String,
    max_supply: u64,
    ctx: &mut TxContext,
): EventConfig {
    EventConfig {
        id: object::new(ctx),
        name,
        max_supply,
        minted: 0,
    }
}

public fun mint_ticket(
    _admin: &AdminCap,
    event: &mut EventConfig,
    treasury_obj: &mut Treasury,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
): Ticket {
    assert!(event.minted < event.max_supply, errors::e_sold_out());
    event.minted = event.minted + 1;
    treasury::collect(treasury_obj, payment);

    Ticket {
        id: object::new(ctx),
        event_id: object::id(event),
        used: false,
    }
}

public fun transfer_ticket(ticket: Ticket, to: address) {
    transfer::public_transfer(ticket, to);
}

public fun redeem_ticket(ticket: &mut Ticket) {
    assert!(!ticket.used, errors::e_already_used());
    ticket.used = true;
}

public fun burn_ticket(ticket: Ticket) {
    let Ticket { id, event_id: _, used: _ } = ticket;
    object::delete(id);
}
