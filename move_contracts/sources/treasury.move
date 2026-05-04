module move_contracts::treasury;

use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::sui::SUI;

public struct Treasury has key {
    id: object::UID,
    collected: Balance<SUI>,
}

public(package) fun new(ctx: &mut TxContext): Treasury {
    Treasury {
        id: object::new(ctx),
        collected: balance::zero<SUI>(),
    }
}

public fun collect(treasury: &mut Treasury, payment: Coin<SUI>) {
    balance::join(&mut treasury.collected, coin::into_balance(payment));
}

public fun withdraw_all(treasury: &mut Treasury, ctx: &mut TxContext): Coin<SUI> {
    let amount = balance::value(&treasury.collected);
    coin::take(&mut treasury.collected, amount, ctx)
}

public(package) fun share(treasury: Treasury) {
    transfer::share_object(treasury);
}
