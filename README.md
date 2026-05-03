# ⚔️ NEON BLADE

**Thể loại:** Game hành động chém chặt góc nhìn từ trên xuống (2D Top-Down Melee Action)  
**Công nghệ:** JavaScript thuần + HTML5 Canvas  
**Nền tảng:** Trình duyệt web (Chrome, Firefox, Edge)

---

## 📖 Giới thiệu

Neon Blade là game sinh tồn hành động tốc độ cao với phong cách cyberpunk neon. Người chơi điều khiển nhân vật sử dụng kiếm năng lượng để chiến đấu với các đợt quái vật xuất hiện liên tục. Game tập trung vào hệ thống chiến đấu combo mượt mà, phản hồi hình ảnh mạnh mẽ, và độ khó tăng dần theo thời gian.

### Đặc điểm nổi bật

- Hệ thống **combo 3 đòn** (nhẹ → vừa → nặng) với hiệu ứng khác nhau mỗi đòn
- **Charged Attack** — giữ chuột để tích lực, thả ra tạo vòng chém 360°
- **Dash** — lướt nhanh né đòn, bất tử trong lúc lướt
- **3 loại quái vật** với AI riêng biệt: Nhanh, Tanker, Bắn xa
- Hiệu ứng hình ảnh phong phú: particle, screen shake, neon glow, damage number
- Hệ thống điểm số với combo multiplier (lên đến ×4.0)
- Giao diện đầy đủ: Menu chính, HUD gameplay, Pause, Game Over

---

## 🚀 Cách chạy

### Cách 1: Mở trực tiếp
```
Mở file index.html bằng trình duyệt → Chơi ngay
```

### Cách 2: Dùng Live Server (khuyến nghị)
```
1. Mở folder dự án bằng VS Code
2. Cài extension "Live Server" (nếu chưa có)
3. Click chuột phải vào index.html → Open with Live Server
```

> **Không cần cài đặt gì thêm.** Không cần Node.js, không cần npm, không cần server. Game chạy hoàn toàn trên trình duyệt.

---

## 🎮 Điều khiển

| Phím | Hành động |
|------|-----------|
| **W / A / S / D** | Di chuyển lên / trái / xuống / phải |
| **Chuột** | Ngắm hướng (nhân vật luôn quay về phía chuột) |
| **Click chuột trái** | Tấn công (click liên tục để combo) |
| **Giữ chuột trái** | Tích lực → thả ra = Chém xoáy 360° |
| **Shift** | Lướt (Dash) — né đòn, bất tử khi lướt |
| **ESC** | Tạm dừng / Tiếp tục |
| **Enter / Space** | Bắt đầu game (ở menu) |

---

## ⚔️ Hệ thống chiến đấu

### Combo 3 đòn

Nhấn chuột trái liên tiếp trong vòng 0.8 giây để tạo chuỗi combo:

| Đòn | Tầm đánh | Sát thương | Đặc điểm |
|-----|----------|------------|----------|
| **Đòn 1** | 55px | 12 | Chém nhanh, tầm ngắn |
| **Đòn 2** | 65px | 15 | Tầm trung |
| **Đòn 3** | 80px | 25 | Tầm xa, đẩy lùi mạnh, screen shake lớn |

Nếu để quá 0.8 giây giữa các đòn, combo sẽ reset về đòn 1.

### Chém xoáy (Charged Attack)

1. **Giữ** chuột trái — vòng tròn vàng bắt đầu charge quanh nhân vật
2. **Đợi** ~0.8 giây — khi vòng tròn nhấp nháy = đã sẵn sàng
3. **Thả** chuột — chém xoáy 360° (tầm 90px, sát thương 40, đánh tất cả quái xung quanh)

### Lướt (Dash)

- Nhấn **Shift** để lướt nhanh theo hướng di chuyển
- **Bất tử** trong suốt thời gian lướt (né qua đạn và quái)
- Tiêu tốn **30 stamina**, hồi chiêu **0.8 giây**
- Stamina tự hồi **18/giây** khi không lướt

### Combo Multiplier

Mỗi lần đánh trúng quái, combo counter tăng lên. Đánh liên tục không ngừng để duy trì combo:

| Combo | Hệ số nhân |
|-------|-----------|
| 0–4 hit | ×1.0 |
| 5–9 hit | ×1.5 |
| 10–19 hit | ×2.0 |
| 20–29 hit | ×3.0 |
| 30+ hit | ×4.0 |

Combo sẽ **reset về 0** nếu không đánh trúng gì trong **2 giây**.

---

## 👾 Các loại quái vật

| Loại | Màu | Tốc độ | HP | Sát thương | Điểm | Hành vi |
|------|-----|--------|----|-----------:|------:|---------|
| **Fast** | 🟢 Xanh lá | Nhanh (160) | 25 | 8 | 100 | Chạy thẳng vào người chơi |
| **Tank** | 🔴 Đỏ | Chậm (70) | 80 | 18 | 250 | Di chuyển chậm nhưng rất trâu |
| **Ranged** | 🩷 Hồng | Trung bình (90) | 35 | 10 | 200 | Giữ khoảng cách, bắn đạn |

### Quy luật xuất hiện

- **0–20 giây:** Chỉ có quái Fast
- **20–50 giây:** 60% Fast + 40% Tank
- **50 giây trở đi:** 45% Fast + 30% Tank + 25% Ranged
- Tốc độ spawn tăng dần từ 2.5 giây/con xuống 0.6 giây/con trong 3 phút
- Tối đa **40 quái** trên màn hình cùng lúc

---

## 🖥️ Giao diện

### Main Menu
- Logo "NEON BLADE" với hiệu ứng neon glow
- Nền tối với lưới kẻ và hạt particle trôi nổi
- Nút START GAME và CONTROLS
- Hướng dẫn điều khiển ở dưới cùng

### Gameplay HUD
- **HP bar** (trên-trái): xanh lá → vàng → đỏ theo máu, nhấp nháy khi máu thấp
- **Stamina bar** (dưới HP): thanh cyan hiển thị năng lượng hiện tại
- **Điểm số + Thời gian** (trên-phải)
- **Skill icons** (dưới-trái): hiển thị trạng thái Dash và Charged Attack
- **Combo counter** (giữa-phải): số combo + hệ số nhân, hiệu ứng pop khi tăng
- **Vùng trung tâm (~70%)** được giữ trống hoàn toàn cho gameplay

### Pause Menu
- Lớp phủ tối 70% lên gameplay
- Panel kính mờ (glassmorphism) hiển thị thống kê hiện tại
- Nút RESUME và RESTART

### Game Over
- Lớp phủ tối 80% + ánh sáng đỏ mờ
- "GAME OVER" với hiệu ứng neon đỏ
- Điểm số cuối cùng (vàng, phát sáng)
- Thống kê: thời gian sống sót, số quái đã hạ, combo cao nhất
- Nút PLAY AGAIN và MAIN MENU

---

## 🎨 Phong cách hình ảnh

- **Theme:** Cyberpunk neon trên nền tối
- **Bảng màu chính:**
  - Nền: `#020617` (xanh đen đậm)
  - Tím neon: `#a855f7` (nhân vật, combo, UI chính)
  - Cyan neon: `#06b6d4` (stamina, hiệu ứng dash)
  - Xanh lá neon: `#22c55e` (HP, quái Fast)
  - Đỏ neon: `#ef4444` (damage, quái Tank, Game Over)
  - Vàng neon: `#eab308` (combo counter, charged attack, điểm số)
- **Hiệu ứng:** glow, particle trails, screen shake, hit flash, floating damage numbers

---

## 📁 Cấu trúc dự án

```
neon-blade-game/
├── index.html              # Trang chính — mở file này để chơi
├── README.md               # Tài liệu hướng dẫn (file này)
└── js/
    ├── utils.js             # Hằng số, hàm toán học, screen shake, damage numbers
    ├── particles.js         # Hệ thống hạt (tia lửa, vệt chém, nổ, hạt nền)
    ├── player.js            # Điều khiển nhân vật (di chuyển, dash, HP, stamina)
    ├── enemies.js           # 3 loại quái, AI, hệ thống spawn, đạn bắn xa
    ├── combat.js            # Hệ thống combo, charged attack, xử lý va chạm, điểm
    ├── hud.js               # Thanh HP/stamina, combo counter, skill icon, menu UI
    └── game.js              # Vòng lặp chính, xử lý input, quản lý trạng thái game
```

### Mô tả từng file

| File | Dòng code | Chức năng chính |
|------|-----------|-----------------|
| `utils.js` | ~130 | CONFIG chứa tất cả hằng số game (tốc độ, damage, màu sắc), các hàm toán học (lerp, clamp, dist, angle), ScreenShake, HitFlash, FloatingTexts |
| `particles.js` | ~170 | Hệ thống particle với các preset: burst, slashArc, hitSparks, deathExplosion. Hạt nền ambient trôi nổi |
| `player.js` | ~180 | Di chuyển WASD + mouse aim, dash với invincibility, nhận damage + knockback, trail effect, charge indicator |
| `enemies.js` | ~240 | 3 loại quái (Fast/Tank/Ranged) với AI riêng, spawner tăng dần, enemy separation, hệ thống projectile |
| `combat.js` | ~260 | Combo chain 3 hit, charged spin attack, arc-based hit detection, combo multiplier, score tracking |
| `hud.js` | ~310 | Vẽ HP/stamina bar (smooth animation), skill icons, combo counter (pop effect), menu/pause/game over UI |
| `game.js` | ~220 | Game loop (requestAnimationFrame + delta time), input handling, state machine 4 trạng thái, canvas scaling |

**Tổng: ~1510 dòng code**

---

## 🛠️ Công nghệ sử dụng

| Công nghệ | Mục đích |
|-----------|----------|
| **JavaScript (ES6+)** | Logic game, AI, physics, UI |
| **HTML5 Canvas 2D** | Render toàn bộ đồ họa game |
| **requestAnimationFrame** | Vòng lặp game 60 FPS |
| **Delta Time** | Đảm bảo tốc độ game nhất quán bất kể FPS |
| **CSS** | Chỉ dùng cho body background và cursor |

**Không sử dụng bất kỳ framework hay thư viện nào.** Toàn bộ là JavaScript thuần — không React, không Phaser, không Three.js, không jQuery.

---

## ⚙️ Thông số kỹ thuật

| Thông số | Giá trị |
|----------|---------|
| Độ phân giải canvas | 1024 × 768 px |
| FPS mục tiêu | 60 FPS |
| Delta time cap | 50ms (tránh lỗi physics khi tab bị ẩn) |
| Số particle tối đa | ~200 đồng thời |
| Số quái tối đa | 40 trên màn hình |
| Tổng dung lượng | ~45 KB (không nén) |

---

## 📋 Yêu cầu hệ thống

- **Trình duyệt:** Chrome 90+, Firefox 90+, hoặc Edge 90+ (Chromium)
- **Thiết bị:** Máy tính có bàn phím và chuột
- **Internet:** Không cần (chỉ cần mở file local)
- **Hệ điều hành:** Bất kỳ (Windows, macOS, Linux)

---

## 🎯 Mẹo chơi

1. **Luôn di chuyển** — đứng yên là chết. Quái sẽ bao vây bạn nếu không liên tục thay đổi vị trí.
2. **Ưu tiên combo** — duy trì combo streak để nhân điểm ×4.0. Một đòn ×4.0 cho điểm bằng 4 đòn thường.
3. **Dùng Dash để né projectile** — đạn của quái Ranged gây 10 damage. Dash xuyên qua không mất máu.
4. **Tiết kiệm stamina** — đừng spam dash. Để dành cho lúc bị bao vây.
5. **Charged Attack khi bị vây** — khi quái đến từ mọi phía, giữ chuột → chém 360° là cách thoát tốt nhất.
6. **Ưu tiên hạ quái Ranged** — chúng gây phiền nhất từ xa. Dash vào + combo 3 đòn = hạ gọn.
7. **Hit 3 để đẩy lùi Tank** — đòn thứ 3 knockback mạnh, giúp tạo khoảng cách với Tank.

---

## 📄 Tài liệu liên quan

| Tài liệu | Mô tả |
|-----------|--------|
| `SRS_NeonBlade.docx` | Tài liệu đặc tả yêu cầu phần mềm (IEEE 830-1998) |
| `TestCases_NeonBlade.xlsx` | 45 test cases phân theo 5 functional requirements |

---

## 👨‍💻 Tác giả

- **Tên:** [Tên sinh viên]
- **Mã SV:** [Mã sinh viên]
- **Môn học:** [Tên môn học]
- **Giảng viên:** [Tên giảng viên]
- **Học kỳ:** 2025–2026

---

*Dự án được phát triển phục vụ mục đích học tập.*