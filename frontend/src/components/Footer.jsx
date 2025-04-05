import { FaFacebook, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8 text-gray-700 mt-14">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
        {/* Thông tin liên hệ */}
        <div>
          <h3 className="font-semibold mb-2">Thông tin liên hệ</h3>
          <ul className="space-y-2">
            <li>Giới thiệu công ty </li>
            <li>Hệ thống cửa hàng</li>
            <li>Chính sách bảo mật </li>
            <li>Email: @gmail.com</li>
          </ul>
        </div>

        {/* Thông tin khác */}
        <div>
          <h3 className="font-semibold mb-2">Thông tin khác</h3>
          <ul className="space-y-2">
            <li>Chính sách đổi trả </li>
            <li>Quy chế hoạt động</li>
            <li>Chính sách bảo hành </li>
            <li>Tuyển dụng</li>
            <li>Khách hàng doanh nghiệp</li>
          </ul>
        </div>

        {/* Thông tin hỗ trợ */}
        <div>
          <h3 className="font-semibold mb-2">Thông tin hỗ trợ</h3>
          <ul className="space-y-2">
            <li>Mua hàng và thanh toán Online</li>
            <li>Trung tâm bảo hành chính hãng</li>
            <li>Quy định về sao lưu dữ liệu</li>
            <li>Hướng dẫn thanh toán chuyển khoản</li>
          </ul>
        </div>

        {/* Gọi tư vấn & khiếu nại */}
        <div>
          <h3 className="font-semibold mb-2">Gọi tư vấn & khiếu nại</h3>
          <ul className="space-y-2">
            <li>Gọi mua hàng: 1234567890 </li>
            <li>Hỗ trợ kỹ thuật: 1234567890</li>
            <li>Hợp tác kinh doanh: 1234567890</li>
          </ul>
          <div className="mt-4 flex space-x-3">
            <a
              href="https://www.facebook.com/"
              className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              <FaFacebook size={24} />
            </a>
            <a
              href="https://www.youtube.com/"
              className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
            >
              <FaYoutube size={24} />
            </a>
          </div>
        </div>
      </div>
      <div className="text-center text-sm text-gray-600 mt-6">
        © 2025 Công Ty Cổ Phần Viễn Thông Di Động TKT. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
