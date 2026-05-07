module suiticket::suiticket {
    use sui::tx_context::{Self, TxContext};
    use sui::display;
    use sui::package;
    use sui::transfer;
    use std::string::{Self, String};
    use sui::object::{Self, UID};
    use sui::coin::{Coin};
    use sui::sui::SUI;

    /// Struct đại diện cho NFT Vé Phim
    public struct Ticket has key, store {
        id: UID,
        movie_name: String,
        quantity: u64,
    }

    /// OTW (One Time Witness) để thiết lập Display
    public struct SUITICKET has drop {}

    fun init(otw: SUITICKET, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);

        // Thiết lập các trường hiển thị cho NFT trong ví
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"image_url"),
            string::utf8(b"project_url"),
        ];

        let values = vector[
            // Hiển thị tên phim kèm tiền tố
            string::utf8(b"Vé Phim: {movie_name}"),
            // Mô tả
            string::utf8(b"Vé xem phim được phát hành bởi hệ thống SuiTicket"),
            // Link ảnh mẫu (Mạnh có thể thay bằng link ảnh khác nếu muốn)
            string::utf8(b"https://static.vecteezy.com/system/resources/previews/040/981/350/non_2x/ticket-icon-design-template-simple-and-clean-vector.jpg"),
            // Link dự án
            string::utf8(b"https://suiticket.com"),
        ];

        let mut display = display::new_with_fields<Ticket>(
            &publisher, keys, values, ctx
        );

        // Cập nhật phiên bản Display
        display::update_version(&mut display);

        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
    }

    /// Hàm Mint vé
    public entry fun mint_ticket(
        payment: Coin<SUI>,
        movie_name: vector<u8>,
        quantity: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        // Kiểm tra đủ 5 SUI (5 tỷ Mist)
        assert!(payment.value() == 5000000000, 0);

        let ticket = Ticket {
            id: object::new(ctx),
            movie_name: string::utf8(movie_name),
            quantity,
        };

        // Chuyển tiền cho admin (người nhận)
        transfer::public_transfer(payment, recipient);
        // Gửi vé cho người mua
        transfer::public_transfer(ticket, tx_context::sender(ctx));
    }
}