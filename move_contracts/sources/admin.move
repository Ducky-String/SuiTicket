module move_contracts::admin;

use move_contracts::errors;

public struct AdminCap has key, store {
    id: object::UID,
}

fun init(ctx: &mut TxContext) {
    transfer::transfer(AdminCap { id: object::new(ctx) }, tx_context::sender(ctx));
}

public fun assert_admin(_cap: &AdminCap) {
    // Possessing AdminCap is the Object Capability check.
}

public fun assert_true_admin(is_admin: bool) {
    assert!(is_admin, errors::e_not_admin());
}
