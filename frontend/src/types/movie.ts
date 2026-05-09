// Định nghĩa kiểu dữ liệu cho Phim
export interface Movie {
  id: number;
  title: string;
  genre: string;
  price: number;
  image: string;
  description: string;
  director: string;
  cast: string;
  duration: string;
  rating: string;
}

// Dữ liệu mẫu (Mock data) để hiển thị lên web
export const MOCK_MOVIES: Movie[] = [
  {
    id: 1,
    title: "Thỏ ơi",
    genre: "Gia Đình",
    price: 0.01,
    image: "/IMG/Tho_oi_poster.jpg",
    description: "Câu chuyện cảm động về tình cảm gia đình và những chú thỏ đáng yêu trong một khu vườn kỳ diệu. Một hành trình khám phá thế giới qua lăng kính của sự hồn nhiên và tình yêu thương vô bờ bến.",
    director: "Nguyễn Hoàng Nam",
    cast: "Thỏ Trắng, Thỏ Nâu, Sóc Nhỏ",
    duration: "95 phút",
    rating: "P",
  },
  {
    id: 2,
    title: "Mưa Đỏ",
    genre: "Tài liệu",
    price: 0.01,
    image: "/IMG/Mua_do_poster.jpg",
    description: "Bộ phim tài liệu chân thực về những sự kiện lịch sử hào hùng, tái hiện lại những khoảnh khắc không thể nào quên của dân tộc. Một cái nhìn sâu sắc vào quá khứ để trân trọng hiện tại.",
    director: "Lê Mạnh Hải",
    cast: "Các nhân chứng lịch sử",
    duration: "110 phút",
    rating: "T13",
  },
  {
    id: 3,
    title: "Jurassic World",
    genre: "Hành động",
    price: 0.01,
    image: "/IMG/JurassicWorldPoster.jpg",
    description: "Thế giới khủng long trỗi dậy mạnh mẽ hơn bao giờ hết. Khi công nghệ vượt qua tầm kiểm soát của con người, cuộc chiến sinh tồn bắt đầu giữa loài người và những sinh vật tiền sử khổng lồ.",
    director: "Colin Trevorrow",
    cast: "Chris Pratt, Bryce Dallas Howard",
    duration: "124 phút",
    rating: "T16",
  },
  {
    id: 4,
    title: "Flow",
    genre: "Hoạt hình / Phiêu lưu",
    price: 0.01,
    image: "/IMG/FLOW_Vietnam_poster.jpg",
    description: "Một chú mèo đơn độc tìm thấy chính mình trên một con thuyền cùng với một nhóm các loài động vật khác nhau sau một trận lụt lớn. Họ phải cùng nhau hợp tác để sinh tồn trong một thế giới mới đầy hiểm nguy và kỳ thú.",
    director: "Gints Zilbalodis",
    cast: "Phim không lời thoại",
    duration: "84 phút",
    rating: "P",
  },
  {
    id: 5,
    title: "Wall-E",
    genre: "Hoạt hình / Sci-Fi",
    price: 0.01,
    image: "/IMG/we.webp",
    description: "Trong một tương lai xa xôi, một chú rô bốt nhỏ dọn dẹp rác thải trên Trái đất tình cờ bắt đầu một cuộc hành trình không gian đầy kỳ thú, điều này cuối cùng sẽ quyết định số phận của nhân loại.",
    director: "Andrew Stanton",
    cast: "Ben Burtt, Elissa Knight",
    duration: "98 phút",
    rating: "P",
  },
  {
    id: 6,
    title: "Tuyển thủ Dê (GOAT)",
    genre: "Hoạt hình / Thể thao",
    price: 0.01,
    image: "/IMG/goat.jpg",
    description: "Will Harris, một chú dê nhỏ bé có khát khao lớn lao là trở thành cầu thủ vĩ đại nhất mọi thời đại (GOAT) trong môn thể thao hư cấu 'thú cầu'. Một hành trình hài hước và đầy cảm hứng về sự kiên trì.",
    director: "Tyree Dillihay",
    cast: "Caleb McLaughlin, Stephen Curry",
    duration: "90 phút",
    rating: "P",
  }
];