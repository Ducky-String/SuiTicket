module move_contracts::errors;

const E_NOT_ADMIN: u64 = 0;
const E_SOLD_OUT: u64 = 1;
const E_ALREADY_USED: u64 = 2;
const E_NOT_OWNER: u64 = 3;

public fun e_not_admin(): u64 {
    E_NOT_ADMIN
}

public fun e_sold_out(): u64 {
    E_SOLD_OUT
}

public fun e_already_used(): u64 {
    E_ALREADY_USED
}

public fun e_not_owner(): u64 {
    E_NOT_OWNER
}
