// Định nghĩa kiểu dữ liệu cho Phim
export interface Movie {
    id: number;
    title: string;
    genre: string;
    price: number;
    image: string;
  }
  
  // Dữ liệu mẫu (Mock data) để hiển thị lên web
  export const MOCK_MOVIES: Movie[] = [
    {
      id: 1,
      title: "Thỏ ơi",
      genre: "Gia Đình",
      price: 5,
      image: "/IMG/Tho_oi_poster.jpg",
    },
    {
      id: 2,
      title: "Mưa Đỏ",
      genre: "Tài liệu",
      price: 5,
      image: "/IMG/Mua_do_poster.jpg",
    },
    {
      id: 3,
      title: "Jurassic World",
      genre: "Hành động",
      price: 7,
      image: "/IMG/JurassicWorldPoster.jpg",
    }
  ];