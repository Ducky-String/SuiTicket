module suiticket::suiticket {
    use sui::display;
    use sui::package;
    use std::string::{Self, String};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;

    /// Giá 1 vé = 0.01 SUI = 10,000,000 MIST
    const PRICE_PER_TICKET: u64 = 10000000;
    const MAX_QUANTITY: u64 = 100;

    /// Error codes
    const EInvalidAmount: u64 = 0;
    const EInvalidQuantity: u64 = 1;
    const ENotEnoughTicket: u64 = 2;

    public struct Ticket has key, store {
        id: UID,
        movie_name: String,
        image_url: String,
        showtime: String,
        seat: String,
        quantity: u64,
    }

    public struct SUITICKET has drop {}

    fun init(otw: SUITICKET, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);

        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
            string::utf8(b"showtime"),
            string::utf8(b"seat"),
            string::utf8(b"project_url"),
        ];

        let values = vector[
            string::utf8(b"Ve Phim: {movie_name}"),
            string::utf8(b"Ve xem phim chinh hang phat hanh boi SuiTicket. Suat chieu: {showtime}"),
            string::utf8(b"{image_url}"),
            string::utf8(b"{showtime}"),
            string::utf8(b"{seat}"),
            string::utf8(b"https://suiticket.com"),
        ];

        let mut display = display::new_with_fields<Ticket>(
            &publisher,
            keys,
            values,
            ctx
        );

        display::update_version(&mut display);

        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    /// Mint vé phim
    #[allow(lint(self_transfer))]
    public fun mint_ticket(
        payment: Coin<SUI>,
        movie_name: String,
        image_url: String,
        showtime: String,
        seat: String,
        quantity: u64,
        admin_address: address,
        ctx: &mut TxContext
    ) {
        assert!(quantity > 0, EInvalidQuantity);
        assert!(quantity <= MAX_QUANTITY, EInvalidQuantity);

        let total_required = PRICE_PER_TICKET * quantity;
        assert!(coin::value(&payment) == total_required, EInvalidAmount);

        let ticket = Ticket {
            id: object::new(ctx),
            movie_name,
            image_url,
            showtime,
            seat,
            quantity,
        };

        transfer::public_transfer(payment, admin_address);
        transfer::public_transfer(ticket, ctx.sender());
    }

    /// Soát 1 vé: giảm quantity đi 1
    public fun use_one_ticket(ticket: &mut Ticket) {
        assert!(ticket.quantity > 0, ENotEnoughTicket);
        ticket.quantity = ticket.quantity - 1;
    }

    /// Burn toàn bộ object vé (Soát vé xong xóa luôn)
    public fun burn_ticket(ticket: Ticket) {
        let Ticket {
            id,
            movie_name: _,
            image_url: _,
            showtime: _,
            seat: _,
            quantity: _
        } = ticket;

        object::delete(id);
    }

    /// --- Các hàm Getters để xem dữ liệu ---
    public fun get_quantity(ticket: &Ticket): u64 {
        ticket.quantity
    }

    public fun get_movie_name(ticket: &Ticket): String {
        ticket.movie_name
    }

    public fun get_showtime(ticket: &Ticket): String {
        ticket.showtime
    }
}