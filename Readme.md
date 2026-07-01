# Kono Shop

Kono Shop la du an ecommerce gom 3 phan:

- `server`: API Node.js/Express, MongoDB/Mongoose, Cloudinary upload.
- `client`: website khach hang React + Vite.
- `admin`: dashboard quan tri React + Vite.

Trang thai hien tai:

- Da bo nen Create React App/react-scripts, client va admin dang build bang Vite.
- Client build OK o port `3008`.
- Admin build OK o port `3002`.
- Backend chay o port `8000` va co endpoint health.
- MongoDB Atlas da cau hinh trong `server/.env`.
- Da seed demo tu du lieu public TokyoLife: 10 categories, 10 subcategories, 100 products, 10 sizes, 10 weights, 10 banners.
- Thanh toan online/VNPay tam thoi de xu ly sau.

## Moi truong da kiem tra

- Node.js: `20.12.2`
- npm: `10.5.0`
- Backend: `http://localhost:8000`
- Client: `http://localhost:3008`
- Admin: `http://localhost:3002`

## Cai dat

Chay tu thu muc goc:

```powershell
npm --prefix server install --legacy-peer-deps
npm --prefix client install --legacy-peer-deps
npm --prefix admin install --legacy-peer-deps
```

Tao file moi truong local tu file mau:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
Copy-Item admin/.env.example admin/.env
```

Sau do dien MongoDB Atlas, Firebase, Cloudinary, JWT va cac key thanh toan vao file `.env` tuong ung.

## Chay local

Mo 3 terminal rieng:

```powershell
npm run start:server
```

```powershell
npm run start:client
```

```powershell
npm run start:admin
```

URL:

```text
API:    http://localhost:8000
Client: http://localhost:3008
Admin:  http://localhost:3002
```

Kiem tra backend:

```powershell
Invoke-RestMethod http://localhost:8000/api/health
```

Ket qua mong doi:

```json
{
  "status": "ok",
  "database": "connected"
}
```

## Build

```powershell
npm run build:client
npm run build:admin
```

Build hien pass. Vite van co canh bao bundle lon hon 500 kB; day la canh bao toi uu hieu nang, khong chan web chay.

## Database

Tao collections va indexes theo cac model trong `server/models`:

```powershell
npm run db:init
```

Seed du lieu demo tu TokyoLife. Script se chon 10 category co it nhat 10 san pham public va tao 10 san pham cho moi category:

```powershell
npm run seed:tokyolife
```

Kiem tra so luong du lieu trong MongoDB:

```powershell
npm run db:check
```

Ket qua sau khi seed:

```json
{
  "users": 1,
  "categories": 10,
  "subcategories": 10,
  "products": 100,
  "productreviews": 0,
  "productsizes": 10,
  "productweights": 10,
  "recentlyviewds": 0,
  "carts": 0,
  "mylists": 0,
  "orders": 0,
  "homebanners": 10,
  "imageuploads": 0
}
```

## Env

File dang dung:

- `server/.env`
- `client/.env`
- `admin/.env`

Ba file `.env` nay chi dung local va da duoc ignore. Khi can cau hinh may moi, copy tu:

- `server/.env.example`
- `client/.env.example`
- `admin/.env.example`

Frontend Vite dung prefix `VITE_`:

```env
VITE_API_URL=http://localhost:8000
VITE_BASE_URL=http://localhost:8000
```

Backend can:

```env
PORT=8000
DB_NAME=kono_shop
CONNECTION_STRING=<mongodb-atlas-uri>
JSON_WEB_TOKEN_SECRET_KEY=<jwt-secret>
```

Khong dua credential MongoDB/Firebase/Cloudinary len README hoac commit public.

## Dependency note

- React giu o `18.2.0`.
- `react-router-dom` dang o `6.30.3`.
- MUI giu major 5, dang o `5.18.0`.
- `axios` dang o `1.18.1`.
- `firebase` dang o `10.14.1`.
- `swiper` dang o `14.0.1`.
- Vite dung `6.4.3` vi Node hien tai la `20.12.2`; Vite 8 yeu cau Node moi hon.
- Da go `react-scripts`, `react-swipeable-views`, `@mui/styled-engine-sc`, `styled-components` o client va `react-image-lightbox` o admin.

## Tam thoi bo qua

Luong thanh toan online/VNPay dang de xu ly sau. Nut VNPay tren client da bi disable tam thoi; COD van la luong checkout hien co.
