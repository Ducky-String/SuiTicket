module move_contracts::suiticket {
    use std::string::String;
    use sui::object::UID;
    use sui::transfer;
    use sui::tx_context::TxContext;

    public struct Ticket has key, store {
        id: UID,
        name: String,
        price: u64,
    }

    public fun mint(
        name: String,
        price: u64,
        ctx: &mut TxContext
    ) {
        let ticket = Ticket {
            id: object::new(ctx),
            name,
            price,
        };
        
        transfer::public_transfer(ticket, tx_context::sender(ctx));
    }
}