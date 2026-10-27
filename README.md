# Bài thực hành: ASP.NET Core Web API + Axios + EF Core

```
practice/
├── BackendApi/          # ASP.NET Core Web API (.NET 10)
│   ├── Controllers/ProductsController.cs   # GET, POST, PUT, DELETE
│   ├── Data/AppDbContext.cs                # DbContext của EF Core
│   ├── Models/Product.cs                   # Entity
│   ├── appsettings.json                    # Connection string
│   └── Program.cs                          # Đăng ký DbContext, CORS, Swagger
└── frontend/            # index.html + app.js (Axios)
```

## 1. Yêu cầu

- .NET SDK 10.0 (`dotnet --version`)
- Không cần cài database: project dùng **SQLite** (file `product.db` tự tạo)
- Công cụ EF Core CLI:

```bash
dotnet tool install --global dotnet-ef
```

## 2. Tạo project từ đầu (các lệnh đã dùng)

```bash
dotnet new webapi -n BackendApi --use-controllers
cd BackendApi
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Swashbuckle.AspNetCore
```

## 3. Cấu hình kết nối database

**Bước 1** – Khai báo chuỗi kết nối trong `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Data Source=product.db"
}
```

Với SQLite, chuỗi kết nối chỉ là đường dẫn tới file database.

**Bước 2** – Đăng ký DbContext trong `Program.cs`:

```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
```

**Bước 3** – Controller nhận `AppDbContext` qua constructor (Dependency Injection).

> Dùng database khác: đổi package và hàm `Use...` tương ứng — SQL Server: `Microsoft.EntityFrameworkCore.SqlServer` + `UseSqlServer`; PostgreSQL: `Npgsql.EntityFrameworkCore.PostgreSQL` + `UseNpgsql`; MySQL: `Pomelo.EntityFrameworkCore.MySql` + `UseMySql`. Khi đổi provider, xóa thư mục `Migrations/` rồi tạo lại migration.

## 4. EF Core: cài đặt, cấu hình, migration

1. **Cài package**: `Microsoft.EntityFrameworkCore.Sqlite` (provider) và `Microsoft.EntityFrameworkCore.Design` (cho công cụ migration).
2. **Tạo Entity** (`Models/Product.cs`) và **DbContext** (`Data/AppDbContext.cs`) có `DbSet<Product>`.
3. **Tạo migration** (chạy trong thư mục `BackendApi`):

```bash
dotnet ef migrations add InitialCreate
```

   Lệnh này sinh thư mục `Migrations/` chứa code mô tả thay đổi schema (bảng `Products`).
4. **Áp dụng migration vào database** (tự tạo file `product.db` nếu chưa có):

```bash
dotnet ef database update
```

5. Khi sửa Model (thêm cột...), tạo migration mới:

```bash
dotnet ef migrations add TenMigrationMoi
dotnet ef database update
```

Các lệnh hữu ích khác: `dotnet ef migrations list`, `dotnet ef migrations remove`, `dotnet ef migrations script`.

## 5. Chạy ứng dụng

**Back-end**

```bash
cd BackendApi
dotnet run --launch-profile http
```

API chạy tại `http://localhost:5000`, Swagger UI tại `http://localhost:5000/swagger`.

**Front-end** (mở ở terminal khác, tránh dùng `file://`):

```bash
cd frontend
npx serve .        # hoặc: python -m http.server 3000
```

Mở địa chỉ được in ra (ví dụ `http://localhost:3000`).

## 6. Các endpoint

| Method | URL | Mô tả | Axios |
|--------|-----|-------|-------|
| GET    | `/api/products`      | Lấy danh sách | `api.get("/products")` |
| GET    | `/api/products/{id}` | Lấy 1 sản phẩm | `api.get("/products/1")` |
| POST   | `/api/products`      | Thêm mới | `api.post("/products", data)` |
| PUT    | `/api/products/{id}` | Cập nhật | `api.put("/products/1", data)` |
| DELETE | `/api/products/{id}` | Xóa | `api.delete("/products/1")` |

Ví dụ body JSON cho POST/PUT:

```json
{ "name": "Bàn phím", "price": 350000, "quantity": 10 }
```

## 7. Ghi chú

- **CORS**: front-end và back-end chạy khác cổng nên là khác origin. `Program.cs` đã bật CORS (`AllowAnyOrigin`) để phục vụ học tập; khi triển khai thật nên giới hạn `WithOrigins("https://ten-mien-cua-ban")`.
- Nếu lỗi `dotnet-ef` không tìm thấy: mở terminal mới sau khi cài tool, hoặc thêm `~/.dotnet/tools` vào PATH.
- Nếu đổi cổng back-end, sửa `baseURL` trong `frontend/app.js`.
