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
  showtimes: string[];
  status: 'now-playing' | 'coming-soon'; // Phân loại phim
  releaseDate?: string; // Ngày khởi chiếu cho phim sắp tới
  views?: number; // Số lượt truy cập (dùng cho phim sắp chiếu)
  trailerUrl: string; // URL trailer (YouTube Embed)
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
    showtimes: ["09:00", "11:30", "14:00", "16:30", "19:00", "21:30"],
    status: 'now-playing',
    trailerUrl: "https://www.youtube.com/embed/XMv1Zhj5TQg", // Ví dụ video
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
    showtimes: ["10:00", "13:00", "16:00", "19:00", "22:00"],
    status: 'now-playing',
    trailerUrl: "https://www.youtube.com/embed/BD6PoZJdt_M",
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
    showtimes: ["08:30", "11:30", "14:30", "17:30", "20:30", "23:00"],
    status: 'now-playing',
    trailerUrl: "https://www.youtube.com/embed/aJJrkyHas78",
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
    showtimes: ["09:30", "12:00", "14:30", "17:00", "19:30"],
    status: 'now-playing',
    trailerUrl: "https://www.youtube.com/embed/82WW9dVbglI",
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
    showtimes: ["10:30", "13:30", "16:30", "19:30", "22:30"],
    status: 'now-playing',
    trailerUrl: "https://www.youtube.com/embed/_kslEYbMr1g",
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
    showtimes: ["08:00", "10:00", "13:00", "15:00", "17:30", "20:00", "22:30"],
    status: 'now-playing',
    trailerUrl: "https://www.youtube.com/embed/5r-7eWDBc40",
  },
  {
    id: 7,
    title: "Avatar: Fire and Ash",
    genre: "Sci-Fi / Hành động",
    price: 0.01,
    image: "/IMG/Avatar_3_teaser.jpg",
    description: "Hành trình tiếp theo của Jake Sully và Neytiri trên hành tinh Pandora, đối mặt với một bộ tộc Na'vi hung dữ gắn liền với lửa và tro tàn.",
    director: "James Cameron",
    cast: "Sam Worthington, Zoe Saldaña",
    duration: "180 phút",
    rating: "T13",
    showtimes: [],
    status: 'coming-soon',
    releaseDate: "19/12/2026",
    views: 125430,
    trailerUrl: "https://www.youtube.com/embed/nb_fFj_0rq8",
  },
  {
    id: 8,
    title: "Mufasa: The Lion King",
    genre: "Hoạt hình / Phiêu lưu",
    price: 0.01,
    image: "/IMG/image_5c6b5dcc.jpeg",
    description: "Câu chuyện về sự trỗi dậy của Mufasa, từ một chú sư tử mồ côi trở thành vị vua vĩ đại của Pride Lands.",
    director: "Barry Jenkins",
    cast: "Aaron Pierre, Kelvin Harrison Jr.",
    duration: "120 phút",
    rating: "P",
    showtimes: [],
    status: 'coming-soon',
    releaseDate: "20/12/2026",
    views: 85200,
    trailerUrl: "https://www.youtube.com/embed/o17MF9vnabg",
  },
  {
    id: 9,
    title: "Sonic the Hedgehog 3",
    genre: "Hành động / Phiêu lưu",
    price: 0.01,
    image: "/IMG/SONIC_THE_HEDGEHOG_3_–_Vietnam_poster.jpg",
    description: "Sonic, Knuckles và Tails phải hợp sức để chống lại một kẻ thù mới đầy quyền năng: Shadow the Hedgehog.",
    director: "Jeff Fowler",
    cast: "Ben Schwartz, Jim Carrey, Keanu Reeves",
    duration: "110 phút",
    rating: "P",
    showtimes: [],
    status: 'coming-soon',
    releaseDate: "25/12/2026",
    views: 156800,
    trailerUrl: "https://www.youtube.com/embed/qSu6i2iFMO0",
  }
];