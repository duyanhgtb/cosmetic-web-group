const firebaseConfig = {
  apiKey: "AIzaSyDeGR6sA6Pg3c0Ss8918BftoslB0hY-WVQ",
  authDomain: "cosmetic-web-b574f.firebaseapp.com",
  projectId: "cosmetic-web-b574f",
  storageBucket: "cosmetic-web-b574f.firebasestorage.app",
  messagingSenderId: "232495207931",
  appId: "1:232495207931:web:7fcbf2ae40afc173e0275e"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const originalSetItem = localStorage.setItem;

localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    const syncKeys = {
        'productsDatabase': 'products',
        'ordersDatabase': 'orders',
        'usersDatabase': 'users',
        'inventoryVouchersDatabase': 'vouchers',
        'chatMessagesDatabase': 'messages'
    };
    if (syncKeys[key]) {
        try {
            const parsedData = JSON.parse(value);
            db.collection('app_data').doc(syncKeys[key]).set({
                data: parsedData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(err => console.error("Firebase write error for " + key, err));
        } catch (e) {
            console.error("Error parsing/writing data for " + key, e);
        }
    }
};

const syncKeys = {
    'products': { localKey: 'productsDatabase', callback: () => { if (window.renderProducts) window.renderProducts(); if (window.renderProductsTable) window.renderProductsTable(); } },
    'orders': { localKey: 'ordersDatabase', callback: () => { if (window.renderOrders) window.renderOrders(); if (window.renderOrdersTable) window.renderOrdersTable(); if (window.renderDashboard) window.renderDashboard(); if (window.renderSalesInvoices) window.renderSalesInvoices(); } },
    'users': { localKey: 'usersDatabase', callback: () => { if (window.renderUsers) window.renderUsers(); if (window.renderUsersTable) window.renderUsersTable(); } },
    'vouchers': { localKey: 'inventoryVouchersDatabase', callback: () => { if (window.renderVouchers) window.renderVouchers(); if (window.renderInventoryTable) window.renderInventoryTable(); if (window.renderPurchaseInvoices) window.renderPurchaseInvoices(); } },
    'messages': { localKey: 'chatMessagesDatabase', callback: () => { if (window.loadAndRenderChatHistory) window.loadAndRenderChatHistory(); if (window.renderChatMessages) window.renderChatMessages(); if (window.renderAdminChatMessages) window.renderAdminChatMessages(); } }
};

Object.keys(syncKeys).forEach(docId => {
    const config = syncKeys[docId];
    db.collection('app_data').doc(docId).onSnapshot(doc => {
        if (doc.exists) {
            const remoteData = doc.data().data;
            if (remoteData) {
                originalSetItem.call(localStorage, config.localKey, JSON.stringify(remoteData));
                config.callback();
            }
        } else {
            const localVal = localStorage.getItem(config.localKey);
            if (localVal) {
                try {
                    db.collection('app_data').doc(docId).set({
                        data: JSON.parse(localVal),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } catch(e) {}
            }
        }
    }, err => {
        console.error("Firebase read error for " + docId, err);
    });
});

const defaultProducts = [
    { id: 'p1', title: 'Serum Tinh Chất Trà Xanh', category: 'Chăm sóc da', price: 850000, oldPrice: 1200000, img: 'images/luxury_serum_1776404500065.png', stock: 50, skinTypes: ["dầu", "hỗn hợp", "nhạy cảm"], description: "Kháng viêm, kiểm soát bã nhờn, se khít lỗ chân lông và làm dịu nốt mụn.", brand: "Innisfree" },
    { id: 'p2', title: 'Phấn Mắt Hoàng Kim', category: 'Trang điểm', price: 1200000, img: 'images/eyeshadow_palette_1776404482564.png', stock: 35, skinTypes: ["mọi loại da"], description: "Nhũ mắt ánh kim bám màu lâu trôi, làm nổi bật đôi mắt cuốn hút.", brand: "Chanel" },
    { id: 'p3', title: 'Son Môi Peripera Syrupy Đỏ Cherry', category: 'Trang điểm', price: 299000, oldPrice: 450000, img: 'images/lipstick_mockup_1776404467315.png', stock: 120, skinTypes: ["mọi loại da"], description: "Dưỡng ẩm cao, tạo hiệu ứng căng mọng môi ngọt ngào như cherry.", brand: "Peripera" },
    { id: 'p4', title: 'Nước Hoa Black Noir Special', category: 'Nước hoa', price: 2500000, img: 'images/perfume_black_1776407736858.png', stock: 15, skinTypes: ["mọi loại da"], description: "Hương thơm quyến rũ, nồng nàn sang trọng, lưu hương lên đến 12 giờ.", brand: "Chanel" },
    { id: 'p5', title: 'Kem Dưỡng Ẩm Aqua Cream', category: 'Chăm sóc da', price: 1100000, img: 'images/skincare_cream_1776407395965.png', stock: 40, skinTypes: ["khô", "hỗn hợp"], description: "Cấp nước sâu cho tế bào da, làm mát và duy trì độ ẩm mịn suốt 24 giờ.", brand: "La Roche-Posay" },
    { id: 'p6', title: 'Phấn Nước Cushion Che Phủ Cao', category: 'Trang điểm', price: 950000, oldPrice: 1300000, img: 'images/makeup_cushion_1776407690842.png', stock: 65, skinTypes: ["dầu", "hỗn hợp"], description: "Lớp nền mỏng nhẹ, độ che phủ cực cao và kiềm dầu hiệu quả cả ngày.", brand: "Clio" },
    { id: 'p7', title: 'Kem Nền Dưỡng Ẩm Velvet Foundation', category: 'Trang điểm', price: 780000, oldPrice: 1100000, img: 'images/makeup_foundation_1776407427843.png', stock: 80, skinTypes: ["khô", "hỗn hợp"], description: "Lớp trang điểm nền satin mịn màng, bổ sung tinh chất dưỡng ẩm ngăn mốc nền.", brand: "Clio" },
    { id: 'p8', title: 'Nước Hoa Ocean Fresh EDP', category: 'Nước hoa', price: 1850000, img: 'images/perfume_blue_1776407706582.png', stock: 22, skinTypes: ["mọi loại da"], description: "Hương biển thanh mát, sảng khoái và tràn đầy năng lượng tươi trẻ.", brand: "Davidoff" },
    { id: 'p9', title: 'Tinh Dầu Nước Hoa Velvet Rose', category: 'Nước hoa', price: 2100000, img: 'images/perfume_bottle_1776407471451.png', stock: 18, skinTypes: ["mọi loại da"], description: "Hương hoa hồng nhung kiêu sa, ngọt ngào quyến rũ, giữ mùi lâu.", brand: "Lancôme" },
    { id: 'p10', title: 'Nước Hoa Blossom Love Pink', category: 'Nước hoa', price: 1950000, img: 'images/perfume_pink_1776407722598.png', stock: 25, skinTypes: ["mọi loại da"], description: "Tone hương hoa cỏ trái cây ngọt dịu nhẹ, thích hợp dùng hàng ngày.", brand: "Dior" },
    { id: 'p11', title: 'Sữa Rửa Mặt Thảo Mộc Calendula', category: 'Chăm sóc da', price: 450000, oldPrice: 650000, img: 'images/skincare_cleanser_1776407677565.png', stock: 90, skinTypes: ["dầu", "hỗn hợp", "nhạy cảm"], description: "Làm sạch sâu bã nhờn, kháng khuẩn từ hoa cúc Calendula lành tính.", brand: "Kiehl's" },
    { id: 'p12', title: 'Tinh Chất Phục Hồi Miracle Essence', category: 'Chăm sóc da', price: 1350000, img: 'images/skincare_essence_1776407411838.png', stock: 30, skinTypes: ["khô", "nhạy cảm"], description: "Phục hồi hàng rào bảo vệ da, giảm kích ứng, mẩn đỏ tức thì.", brand: "Estée Lauder" },
    { id: 'p13', title: 'Son Tint Bóng Peripera Ink Mood', category: 'Trang điểm', price: 320000, img: 'images/lipstick_mockup_1776404467315.png', stock: 110, skinTypes: ["mọi loại da"], description: "Chất son bóng nhẹ không bết dính, giữ màu tint bền đẹp cả ngày.", brand: "Peripera" },
    { id: 'p14', title: 'Phấn Mắt 9 Ô Clio Pro Eye Palette', category: 'Trang điểm', price: 680000, img: 'images/eyeshadow_palette_1776404482564.png', stock: 45, skinTypes: ["mọi loại da"], description: "Bảng mắt đa năng gồm các tone màu nhũ và lì cực kỳ dễ phối trang điểm.", brand: "Clio" },
    { id: 'p15', title: 'Kem Dưỡng Sáng Da Vita-C Cream', category: 'Chăm sóc da', price: 520000, oldPrice: 750000, img: 'images/skincare_cream_1776407395965.png', stock: 55, skinTypes: ["khô", "hỗn hợp"], description: "Làm mờ vết thâm mụn, dưỡng sáng đều màu da và kích thích collagen.", brand: "Goodal" },
    { id: 'p16', title: 'Nước Hoa Unisex Ocean Breeze', category: 'Nước hoa', price: 2200000, img: 'images/perfume_blue_1776407706582.png', stock: 20, skinTypes: ["mọi loại da"], description: "Tone nước hoa tươi mát phóng khoáng dùng được cho cả nam và nữ.", brand: "Davidoff" },
    { id: 'p17', title: 'Sữa Rửa Mặt Cho Da Mụn Acnes Cleanser', category: 'Chăm sóc da', price: 380000, img: 'images/skincare_cleanser_1776407677565.png', stock: 75, skinTypes: ["dầu", "nhạy cảm"], description: "Chứa Salicylic Acid (BHA) giúp giảm mụn, ngừa ổ viêm và kiềm dầu.", brand: "Acnes" },
    { id: 'p18', title: 'Kem Nền Clio Kill Cover Liquid', category: 'Trang điểm', price: 890000, img: 'images/makeup_foundation_1776407427843.png', stock: 40, skinTypes: ["dầu", "hỗn hợp"], description: "Che khuyết điểm hoàn hảo, chống trôi nước và mồ hôi hiệu quả.", brand: "Clio" },
    { id: 'p19', title: 'Tinh Chất Tái Tạo Da Peptide Essence', category: 'Chăm sóc da', price: 1600000, img: 'images/skincare_essence_1776407411838.png', stock: 28, skinTypes: ["khô", "nhạy cảm"], description: "Chống lão hóa, nâng cơ mặt và mờ nếp nhăn li ti nhờ phức hợp Peptide.", brand: "The Ordinary" },
    { id: 'p20', title: 'Nước Hoa Nữ Sweet Pink EDP', category: 'Nước hoa', price: 1750000, img: 'images/perfume_pink_1776407722598.png', stock: 32, skinTypes: ["mọi loại da"], description: "Phong cách nữ tính ngọt ngào với hương thơm thanh tao của hoa anh đào.", brand: "Dior" }
];
let productsDB = JSON.parse(localStorage.getItem('productsDatabase')) || [];
let dbNeedsUpdate = false;

if (productsDB.length === 0) {
    productsDB = [...defaultProducts];
    dbNeedsUpdate = true;
} else {
    productsDB = productsDB.map(p => {
        let changed = false;
        if (p.stock === undefined) {
            p.stock = 50;
            changed = true;
        }
        if (p.cost === undefined) {
            p.cost = Math.floor(p.price * 0.6);
            changed = true;
        }
        const matched = defaultProducts.find(dp => dp.id === p.id);
        if (p.skinTypes === undefined) {
            p.skinTypes = matched ? matched.skinTypes : ["mọi loại da"];
            changed = true;
        }
        if (p.description === undefined) {
            p.description = matched ? matched.description : "Sản phẩm chăm sóc sắc đẹp chính hãng chất lượng cao.";
            changed = true;
        }
        if (p.brand === undefined) {
            p.brand = matched ? matched.brand : "The Beauty";
            changed = true;
        }
        if (p.oldPrice === undefined && matched && matched.oldPrice !== undefined) {
            p.oldPrice = matched.oldPrice;
            changed = true;
        }
        if (changed) {
            dbNeedsUpdate = true;
        }
        return p;
    });
}

if (dbNeedsUpdate) {
    localStorage.setItem('productsDatabase', JSON.stringify(productsDB));
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initApp();
    hidePageLoader();
});
function hidePageLoader() {
    const loader = document.querySelector('.page-loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('fade-out');
        }, 600); // Elegant brief pause
    }
}
function initTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    ToastManager.show(`Đã chuyển sang giao diện ${newTheme === 'dark' ? 'Tối' : 'Sáng'}`, 'info');
}
window.toggleTheme = toggleTheme;

function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
        icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
        icon.title = theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối';
    }
}

function initApp() {
    console.log('THE BEAUTY App Initialized');
    const cartManager = new CartManager();
    const authManager = new AuthManager();
    const wishlistManager = new WishlistManager();
    const uiManager = new UIManager();
    const sliderManager = new SliderManager();
    window.cartManager = cartManager;
    window.authManager = authManager;
    window.wishlistManager = wishlistManager;
    window.uiManager = uiManager;
    window.sliderManager = sliderManager;
    ToastManager.init();
    window.alert = function(msg) {
        ToastManager.show(msg, msg.includes('thành công') || msg.includes('Lưu') ? 'success' : (msg.includes('Không thể') || msg.includes('chưa chính xác') || msg.includes('quyền') ? 'error' : 'info'));
    };
    window.quickViewManager = new QuickViewManager();
    window.tryOnManager = new TryOnManager();
    window.sidebarFilter = new SidebarFilter();
    if (window.renderProducts) {
        window.renderProducts();
    }
}

class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cartInfo')) || [];
        this.cartBadge = document.getElementById('cart-badge');
        this.cartItemsContainer = document.getElementById('cart-items-container');
        this.cartTotalPrice = document.getElementById('cart-total-price');
        this.updateUI();
    }

    addItem(product) {
        if (localStorage.getItem('isAdmin') === 'true') {
            alert('Tài khoản Quản trị viên không thể thực hiện chức năng mua hàng!');
            return;
        }
        const productsDB = JSON.parse(localStorage.getItem('productsDatabase')) || [];
        const dbProd = productsDB.find(p => p.id === product.id);
        const currentQtyInCart = this.cart.find(item => item.id === product.id)?.quantity || 0;
        
        if (dbProd) {
            const availableStock = dbProd.stock !== undefined ? dbProd.stock : 50;
            if (currentQtyInCart + 1 > availableStock) {
                alert(`Không thể thêm! Số lượng trong giỏ (${currentQtyInCart + 1}) vượt quá số lượng tồn kho còn lại (${availableStock}).`);
                return;
            }
        }

        const existingItem = this.cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        this.save();
        this.updateUI();
        window.uiManager.openCart();
    }

    removeItem(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.save();
        this.updateUI();
    }

    updateQuantity(id, delta) {
        const item = this.cart.find(item => item.id === id);
        if (item) {
            if (delta > 0) {
                const productsDB = JSON.parse(localStorage.getItem('productsDatabase')) || [];
                const dbProd = productsDB.find(p => p.id === id);
                if (dbProd) {
                    const availableStock = dbProd.stock !== undefined ? dbProd.stock : 50;
                    if (item.quantity + delta > availableStock) {
                        alert(`Không thể tăng! Số lượng vượt quá số lượng tồn kho còn lại (${availableStock}).`);
                        return;
                    }
                }
            }
            item.quantity += delta;
            if (item.quantity <= 0) {
                this.removeItem(id);
            } else {
                this.save();
                this.updateUI();
            }
        }
    }

    save() {
        localStorage.setItem('cartInfo', JSON.stringify(this.cart));
    }

    updateUI() {
        if (this.cartBadge) {
            const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            this.cartBadge.textContent = count;
            this.cartBadge.style.display = count > 0 ? 'flex' : 'none';
        }
        if (this.cartItemsContainer) {
            if (this.cart.length === 0) {
                this.cartItemsContainer.innerHTML = '<div class="cart-empty">Giỏ hàng đang trống.</div>';
                if (this.cartTotalPrice) this.cartTotalPrice.textContent = '0 ₫';
                return;
            }

            let html = '';
            let total = 0;
            this.cart.forEach(item => {
                const subtotal = item.price * item.quantity;
                total += subtotal;
                html += `
                    <div class="cart-item">
                        <img src="${item.img}" alt="${item.title}">
                        <div class="cart-item-info">
                            <div class="cart-item-title">${item.title}</div>
                            <div class="cart-item-price">${new Intl.NumberFormat('vi-VN').format(item.price)} ₫</div>
                            <div class="cart-item-qty-controls">
                                <button onclick="window.cartManager.updateQuantity('${item.id}', -1)">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="window.cartManager.updateQuantity('${item.id}', 1)">+</button>
                            </div>
                        </div>
                        <span class="material-icons remove-item" onclick="window.cartManager.removeItem('${item.id}')">close</span>
                    </div>
                `;
            });
            this.cartItemsContainer.innerHTML = html;
            if (this.cartTotalPrice) {
                this.cartTotalPrice.textContent = new Intl.NumberFormat('vi-VN').format(total) + ' ₫';
            }
        }
    }
}

class AuthManager {
    constructor() {
        this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        this.authIcon = document.getElementById('auth-icon');
        this.authText = document.getElementById('auth-text');
        this.updateUI();
    }

    updateUI() {
        const usersDB = JSON.parse(localStorage.getItem('usersDatabase')) || [];
        const loggedEmail = localStorage.getItem('loggedInEmail');
        const user = usersDB.find(u => u.email === loggedEmail);
        const displayName = user ? user.name.split(' ')[0] : 'Tài khoản';
        const isAdmin = localStorage.getItem('isAdmin') === 'true';

        if (this.authIcon) {
            if (isAdmin) {
                this.authIcon.textContent = 'admin_panel_settings';
                this.authIcon.title = 'Trang Quản Trị';
                this.authIcon.parentElement.href = 'admin.html';
                if (this.authText) this.authText.textContent = 'Admin';
            } else if (this.isLoggedIn) {
                this.authIcon.textContent = 'person';
                this.authIcon.title = 'Hồ Sơ';
                this.authIcon.parentElement.href = 'profile.html';
                if (this.authText) this.authText.textContent = displayName;
            } else {
                this.authIcon.textContent = 'person_outline';
                this.authIcon.title = 'Đăng Nhập';
                this.authIcon.parentElement.href = 'login.html';
                if (this.authText) this.authText.textContent = 'Đăng nhập';
            }
        }
    }

    logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInEmail');
        localStorage.removeItem('isAdmin');
        window.location.href = 'login.html';
    }
}

class UIManager {
    constructor() {
        this.cartDrawer = document.getElementById('cart-drawer');
        this.cartOverlay = document.getElementById('cart-overlay');
        this.cartIcon = document.getElementById('cart-icon');
        this.closeCartBtn = document.getElementById('close-cart');
        this.wishlistDrawer = document.getElementById('wishlist-drawer');
        this.wishlistOverlay = document.getElementById('wishlist-overlay');
        this.wishlistIcon = document.getElementById('wishlist-icon');
        this.closeWishlistBtn = document.getElementById('close-wishlist');
        this.moreUtilityLink = document.getElementById('more-utility-link');
        this.moreDropdown = document.getElementById('more-dropdown');

        this.initEvents();
    }

    initEvents() {
        if (this.cartIcon) this.cartIcon.addEventListener('click', () => this.openCart());
        if (this.closeCartBtn) this.closeCartBtn.addEventListener('click', () => this.closeCart());
        if (this.cartOverlay) this.cartOverlay.addEventListener('click', () => this.closeCart());

        if (this.wishlistIcon) this.wishlistIcon.addEventListener('click', () => this.openWishlist());
        if (this.closeWishlistBtn) this.closeWishlistBtn.addEventListener('click', () => this.closeWishlist());
        if (this.wishlistOverlay) this.wishlistOverlay.addEventListener('click', () => this.closeWishlist());

        if (this.moreUtilityLink && this.moreDropdown) {
            this.moreUtilityLink.addEventListener('click', (e) => {
                e.stopPropagation();
                this.moreDropdown.classList.toggle('active');
            });

            document.addEventListener('click', () => {
                this.moreDropdown.classList.remove('active');
            });
        }
    }

    openCart() {
        this.closeWishlist();
        if (this.cartDrawer) this.cartDrawer.classList.add('active');
        if (this.cartOverlay) this.cartOverlay.style.display = 'block';
    }

    closeCart() {
        if (this.cartDrawer) this.cartDrawer.classList.remove('active');
        if (this.cartOverlay) this.cartOverlay.style.display = 'none';
    }

    openWishlist() {
        this.closeCart();
        if (this.wishlistDrawer) this.wishlistDrawer.classList.add('active');
        if (this.wishlistOverlay) this.wishlistOverlay.style.display = 'block';
    }

    closeWishlist() {
        if (this.wishlistDrawer) this.wishlistDrawer.classList.remove('active');
        if (this.wishlistOverlay) this.wishlistOverlay.style.display = 'none';
    }

    switchStoreTab(tabId) {
        document.querySelectorAll('.store-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.store-tab-content').forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        const targetBtn = Array.from(document.querySelectorAll('.store-tab-btn')).find(btn => btn.getAttribute('onclick').includes(tabId));
        if (targetBtn) targetBtn.classList.add('active');
        const targetContent = document.getElementById(`store-${tabId}`);
        if (targetContent) {
            targetContent.classList.add('active');
            targetContent.style.display = 'block';
        }
    }
}

class SliderManager {
    constructor() {
        this.wrapper = document.getElementById('slider-wrapper');
        this.prevBtn = document.getElementById('slider-prev-btn');
        this.nextBtn = document.getElementById('slider-next-btn');
        this.dotsContainer = document.getElementById('slider-dots');
        
        if (!this.wrapper) return; // Only run on pages containing the slider

        this.slides = Array.from(this.wrapper.querySelectorAll('.slide'));
        this.currentIndex = 0;
        this.slideInterval = null;

        this.initSlider();
    }

    initSlider() {
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevSlide());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextSlide());
        if (this.dotsContainer) {
            const dots = Array.from(this.dotsContainer.querySelectorAll('.slider-dot'));
            dots.forEach(dot => {
                dot.addEventListener('click', (e) => {
                    const index = parseInt(e.target.getAttribute('data-index'));
                    this.goToSlide(index);
                });
            });
        }
        this.startAutoSlide();
        this.wrapper.parentElement.addEventListener('mouseenter', () => this.stopAutoSlide());
        this.wrapper.parentElement.addEventListener('mouseleave', () => this.startAutoSlide());
    }

    goToSlide(index) {
        if (index < 0) {
            index = this.slides.length - 1;
        } else if (index >= this.slides.length) {
            index = 0;
        }
        
        this.currentIndex = index;
        this.wrapper.style.transform = `translateX(-${index * 100}%)`;
        if (this.dotsContainer) {
            const dots = Array.from(this.dotsContainer.querySelectorAll('.slider-dot'));
            dots.forEach((dot, idx) => {
                if (idx === index) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }

    nextSlide() {
        this.goToSlide(this.currentIndex + 1);
    }

    prevSlide() {
        this.goToSlide(this.currentIndex - 1);
    }

    startAutoSlide() {
        this.stopAutoSlide();
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    stopAutoSlide() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
    }
}

class WishlistManager {
    constructor() {
        this.wishlist = JSON.parse(localStorage.getItem('wishlistInfo')) || [];
        this.badge = document.getElementById('wishlist-badge');
        this.container = document.getElementById('wishlist-items-container');
        this.updateUI();
    }

    isFavorite(id) {
        return this.wishlist.some(item => item.id === id);
    }

    toggleItem(id) {
        if (localStorage.getItem('isAdmin') === 'true') {
            alert('Tài khoản Quản trị viên không thể sử dụng danh sách yêu thích!');
            return;
        }
        const index = this.wishlist.findIndex(item => item.id === id);
        if (index > -1) {
            this.wishlist.splice(index, 1);
        } else {
            const product = window.products ? window.products.find(p => p.id === id) : null;
            if (product) {
                this.wishlist.push(product);
            }
        }
        this.save();
        this.updateUI();
        if (window.renderProducts) {
            window.renderProducts();
        }
    }

    removeItem(id) {
        this.wishlist = this.wishlist.filter(item => item.id !== id);
        this.save();
        this.updateUI();
        if (window.renderProducts) {
            window.renderProducts();
        }
    }

    save() {
        localStorage.setItem('wishlistInfo', JSON.stringify(this.wishlist));
    }

    updateUI() {
        if (this.badge) {
            const count = this.wishlist.length;
            this.badge.textContent = count;
            this.badge.style.display = count > 0 ? 'flex' : 'none';
        }
        if (this.container) {
            if (this.wishlist.length === 0) {
                this.container.innerHTML = '<div class="wishlist-empty">Không có sản phẩm yêu thích nào.</div>';
                return;
            }

            let html = '';
            this.wishlist.forEach(item => {
                html += `
                    <div class="wishlist-item">
                        <img src="${item.img}" alt="${item.title}">
                        <div class="wishlist-item-info">
                            <div class="wishlist-item-title">${item.title}</div>
                            <div class="wishlist-item-price">${new Intl.NumberFormat('vi-VN').format(item.price)} ₫</div>
                            <button class="wishlist-add-cart-btn" onclick="window.cartManager.addItem({id:'${item.id}', title:'${item.title}', price:${item.price}, img:'${item.img}'}); window.wishlistManager.removeItem('${item.id}');">Thêm Vào Giỏ</button>
                        </div>
                        <span class="material-icons remove-item" onclick="window.wishlistManager.removeItem('${item.id}')">close</span>
                    </div>
                `;
            });
            this.container.innerHTML = html;
        }
    }
}
class ToastManager {
    static init() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        this.container = container;
    }
    
    static show(message, type = 'success') {
        if (!this.container) this.init();
        
        const toast = document.createElement('div');
        toast.className = `toast-item ${type}`;
        
        let icon = 'info';
        if (type === 'success') icon = 'check_circle';
        if (type === 'error') icon = 'error';
        
        toast.innerHTML = `
            <span class="material-icons">${icon}</span>
            <span>${message}</span>
        `;
        
        this.container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(120%)';
        }, 2500);
        
        setTimeout(() => {
            toast.remove();
        }, 2800);
    }
}
window.ToastManager = ToastManager;
class QuickViewManager {
    constructor() {
        this.init();
    }
    
    init() {
        let overlay = document.getElementById('qv-modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'qv-modal-overlay';
            overlay.className = 'qv-modal-overlay';
            overlay.innerHTML = `
                <div class="qv-modal-content">
                    <span class="material-icons close-qv-modal" id="close-qv">close</span>
                    <div class="qv-img-container">
                        <img id="qv-product-img" src="" alt="Product Image">
                    </div>
                    <div class="qv-details">
                        <span class="qv-brand" id="qv-product-brand">BRAND</span>
                        <h2 class="qv-title" id="qv-product-title">Tên sản phẩm</h2>
                        <div class="qv-price-row">
                            <span class="qv-price" id="qv-product-price">0 ₫</span>
                            <span class="qv-stock" id="qv-product-stock">Còn lại: 0</span>
                        </div>
                        <p class="qv-desc" id="qv-product-desc">Mô tả ngắn của sản phẩm.</p>
                        <div class="qv-meta" id="qv-product-skins">Phù hợp loại da: Da dầu, da khô</div>
                        <div class="qv-qty-row">
                            <span class="qv-qty-label">Số lượng:</span>
                            <div class="qv-qty-selector">
                                <button onclick="window.quickViewManager.adjustQty(-1)">-</button>
                                <span id="qv-qty-val">1</span>
                                <button onclick="window.quickViewManager.adjustQty(1)">+</button>
                            </div>
                        </div>
                        <div class="qv-actions">
                            <button class="qv-add-cart-btn" id="qv-add-cart-btn">Thêm vào giỏ hàng</button>
                            <div class="qv-wishlist-btn" id="qv-wishlist-btn">
                                <span class="material-icons">favorite_border</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        
        this.overlay = overlay;
        this.qtyVal = 1;
        this.activeProduct = null;
        
        document.getElementById('close-qv').addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
    }
    
    open(productId) {
        const productsDB = JSON.parse(localStorage.getItem('productsDatabase')) || [];
        const product = productsDB.find(p => p.id === productId);
        if (!product) return;
        
        this.activeProduct = product;
        this.qtyVal = 1;
        document.getElementById('qv-qty-val').textContent = this.qtyVal;
        
        document.getElementById('qv-product-img').src = product.img;
        document.getElementById('qv-product-brand').textContent = product.brand || 'The Beauty';
        document.getElementById('qv-product-title').textContent = product.title;
        
        const priceEl = document.getElementById('qv-product-price');
        if (product.oldPrice && product.oldPrice > product.price) {
            priceEl.innerHTML = `
                <span style="font-size:0.9rem; color:#888; text-decoration:line-through; font-weight:500; margin-right:8px;">${new Intl.NumberFormat('vi-VN').format(product.oldPrice)} ₫</span>
                <span style="color:var(--primary); font-weight:800;">${new Intl.NumberFormat('vi-VN').format(product.price)} ₫</span>
            `;
        } else {
            priceEl.innerHTML = `<span>${new Intl.NumberFormat('vi-VN').format(product.price)} ₫</span>`;
        }
        
        document.getElementById('qv-product-stock').textContent = `Còn lại: ${product.stock !== undefined ? product.stock : 50}`;
        document.getElementById('qv-product-desc').textContent = product.description || 'Sản phẩm chăm sóc sức đẹp cao cấp chính hãng.';
        
        const skins = product.skinTypes ? product.skinTypes.join(', ') : 'mọi loại da';
        document.getElementById('qv-product-skins').textContent = `Phù hợp loại da: ${skins.charAt(0).toUpperCase() + skins.slice(1)}`;
        const isFav = window.wishlistManager ? window.wishlistManager.isFavorite(product.id) : false;
        const wlBtn = document.getElementById('qv-wishlist-btn');
        wlBtn.innerHTML = `<span class="material-icons">${isFav ? 'favorite' : 'favorite_border'}</span>`;
        wlBtn.onclick = () => {
            if (window.wishlistManager) {
                window.wishlistManager.toggleItem(product.id);
                const isFavNow = window.wishlistManager.isFavorite(product.id);
                wlBtn.innerHTML = `<span class="material-icons">${isFavNow ? 'favorite' : 'favorite_border'}</span>`;
            }
        };
        const cartBtn = document.getElementById('qv-add-cart-btn');
        if (product.stock <= 0) {
            cartBtn.textContent = 'Hết hàng';
            cartBtn.disabled = true;
            cartBtn.style.background = '#d2d2d2';
        } else {
            cartBtn.textContent = 'Thêm vào giỏ hàng';
            cartBtn.disabled = false;
            cartBtn.style.background = 'var(--primary)';
            cartBtn.onclick = () => {
                if (window.cartManager) {
                    for(let i = 0; i < this.qtyVal; i++) {
                         window.cartManager.addItem({
                             id: product.id,
                             title: product.title,
                             price: product.price,
                             img: product.img
                         });
                    }
                    this.close();
                }
            };
        }
        
        this.overlay.classList.add('active');
    }
    
    adjustQty(delta) {
        const newQty = this.qtyVal + delta;
        const stock = this.activeProduct ? (this.activeProduct.stock !== undefined ? this.activeProduct.stock : 50) : 50;
        if (newQty >= 1 && newQty <= stock) {
            this.qtyVal = newQty;
            document.getElementById('qv-qty-val').textContent = this.qtyVal;
        } else if (newQty > stock) {
            ToastManager.show(`Vượt quá số lượng tồn kho còn lại (${stock})`, 'error');
        }
    }
    
    close() {
        this.overlay.classList.remove('active');
    }
}
window.QuickViewManager = QuickViewManager;
class TryOnManager {
    constructor() {
        this.init();
    }
    
    init() {
        let overlay = document.getElementById('tryon-modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'tryon-modal-overlay';
            overlay.className = 'tryon-modal-overlay';
            overlay.innerHTML = `
                <div class="tryon-modal-content">
                    <span class="material-icons close-qv-modal" id="close-tryon">close</span>
                    <h3 style="margin-top:0; margin-bottom:15px; font-weight:800; font-size:1.2rem; text-transform:uppercase;">Thử Màu Son Môi Ảo (AR Try-On)</h3>
                    <div class="tryon-view-container">
                        <video class="tryon-video" id="tryon-video" autoplay playsinline muted style="display:none;"></video>
                        <img class="tryon-image" id="tryon-image" src="images/brand_story_img_1776407208755.png" alt="Try On Model">
                        <div class="lip-tint-overlay" id="lip-overlay"></div>
                    </div>
                    
                    <div class="tryon-swatches-row">
                        <span class="tryon-swatches-title">Chọn sắc màu son:</span>
                        <div class="tryon-swatches" id="tryon-swatches-container">
                        </div>
                    </div>
                    
                    <div class="tryon-actions">
                        <button class="btn-tryon-action btn-tryon-secondary" id="btn-tryon-source" onclick="window.tryOnManager.toggleSource()">Sử dụng Camera</button>
                        <button class="btn-tryon-action btn-tryon-primary" id="btn-tryon-close" onclick="window.tryOnManager.close()">Đóng lại</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        
        this.overlay = overlay;
        this.video = document.getElementById('tryon-video');
        this.image = document.getElementById('tryon-image');
        this.lipOverlay = document.getElementById('lip-overlay');
        this.stream = null;
        this.useWebcam = false;
        
        document.getElementById('close-tryon').addEventListener('click', () => this.close());
        
        this.shades = [
            { name: 'Đỏ Cherry bóng', hex: '#d62d51' },
            { name: 'Cam đào San Hô', hex: '#e67e22' },
            { name: 'Hồng Đất Velvet', hex: '#ff7675' },
            { name: 'Đỏ mận chín', hex: '#800020' }
        ];
        
        this.activeShade = null;
        this.renderSwatches();
    }
    
    renderSwatches() {
        const container = document.getElementById('tryon-swatches-container');
        if (!container) return;
        
        container.innerHTML = this.shades.map((shade, idx) => `
            <div class="tryon-swatch-item ${idx === 0 ? 'active' : ''}" 
                 style="background-color: ${shade.hex};" 
                 title="${shade.name}" 
                 onclick="window.tryOnManager.selectShade('${shade.hex}', this)">
            </div>
        `).join('');
        
        this.activeShade = this.shades[0].hex;
    }
    
    selectShade(hex, swatchElement) {
        this.activeShade = hex;
        document.querySelectorAll('.tryon-swatch-item').forEach(el => el.classList.remove('active'));
        if (swatchElement) swatchElement.classList.add('active');
        
        this.applyTint();
        ToastManager.show(`Đã chọn son màu: ${this.shades.find(s=>s.hex===hex).name}`, 'info');
    }
    
    applyTint() {
        if (this.activeShade) {
            this.lipOverlay.style.backgroundColor = this.activeShade;
            this.lipOverlay.style.opacity = '0.48';
        }
    }
    
    toggleSource() {
        const btn = document.getElementById('btn-tryon-source');
        if (!this.useWebcam) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
                .then(stream => {
                    this.stream = stream;
                    this.video.srcObject = stream;
                    this.video.style.display = 'block';
                    this.image.style.display = 'none';
                    this.video.play();
                    this.useWebcam = true;
                    btn.textContent = 'Dùng ảnh người mẫu';
                    this.applyTint();
                    this.lipOverlay.style.top = '60%'; 
                    ToastManager.show('Đã kết nối Webcam AR!', 'success');
                })
                .catch(err => {
                    console.error(err);
                    ToastManager.show('Không truy cập được camera. Đã dùng ảnh mẫu!', 'error');
                });
        } else {
            this.stopWebcam();
            this.video.style.display = 'none';
            this.image.style.display = 'block';
            this.useWebcam = false;
            btn.textContent = 'Sử dụng Camera';
            this.lipOverlay.style.top = '55%'; 
            this.applyTint();
        }
    }
    
    stopWebcam() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }
    
    open() {
        this.overlay.classList.add('active');
        this.applyTint();
    }
    
    close() {
        this.overlay.classList.remove('active');
        this.stopWebcam();
        this.video.style.display = 'none';
        this.image.style.display = 'block';
        this.useWebcam = false;
        const btn = document.getElementById('btn-tryon-source');
        if (btn) btn.textContent = 'Sử dụng Camera';
    }
}
window.TryOnManager = TryOnManager;
class SidebarFilter {
    constructor() {
        this.init();
    }
    
    init() {
        let overlay = document.getElementById('filter-sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'filter-sidebar-overlay';
            overlay.className = 'filter-sidebar-overlay';
            
            let sidebar = document.createElement('div');
            sidebar.id = 'filter-sidebar';
            sidebar.className = 'filter-sidebar';
            sidebar.innerHTML = `
                <div class="filter-sidebar-header">
                    <h3>Bộ Lọc Sản Phẩm</h3>
                    <span class="material-icons" id="close-filter-sidebar" style="cursor:pointer;">close</span>
                </div>
                
                <div class="filter-group">
                    <h4>Lọc Theo Khoảng Giá</h4>
                    <div class="filter-price-slider">
                        <input type="range" class="price-slider-input" id="price-slider" min="100000" max="3000000" step="50000" value="3000000" oninput="window.sidebarFilter.updatePriceLabel(this.value)">
                        <div class="price-values">
                            <span>100K ₫</span>
                            <span id="price-slider-val" style="color:var(--primary); font-weight:800;">3.000.000 ₫</span>
                        </div>
                    </div>
                </div>
                
                <div class="filter-group">
                    <h4>Lọc Theo Thương Hiệu</h4>
                    <div class="filter-brand-list">
                        <label class="filter-brand-label"><input type="checkbox" value="Clio" class="brand-filter-cb"> Clio</label>
                        <label class="filter-brand-label"><input type="checkbox" value="Chanel" class="brand-filter-cb"> Chanel</label>
                        <label class="filter-brand-label"><input type="checkbox" value="Dior" class="brand-filter-cb"> Dior</label>
                        <label class="filter-brand-label"><input type="checkbox" value="Peripera" class="brand-filter-cb"> Peripera</label>
                        <label class="filter-brand-label"><input type="checkbox" value="Innisfree" class="brand-filter-cb"> Innisfree</label>
                        <label class="filter-brand-label"><input type="checkbox" value="Goodal" class="brand-filter-cb"> Goodal</label>
                    </div>
                </div>
                
                <div class="filter-sidebar-footer">
                    <button class="filter-btn btn-clear-filter" onclick="window.sidebarFilter.clearFilters()">Xóa Lọc</button>
                    <button class="filter-btn btn-apply-filter" onclick="window.sidebarFilter.applyFilters()">Áp Dụng</button>
                </div>
            `;
            
            document.body.appendChild(overlay);
            document.body.appendChild(sidebar);
        }
        
        this.overlay = overlay;
        this.sidebar = document.getElementById('filter-sidebar');
        
        document.getElementById('close-filter-sidebar').addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());
        
        this.maxPrice = 3000000;
        this.selectedBrands = [];
    }
    
    open() {
        this.overlay.style.display = 'block';
        setTimeout(() => this.sidebar.classList.add('active'), 50);
    }
    
    close() {
        this.sidebar.classList.remove('active');
        setTimeout(() => this.overlay.style.display = 'none', 300);
    }
    
    updatePriceLabel(value) {
        document.getElementById('price-slider-val').textContent = new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
        this.maxPrice = parseInt(value);
    }
    
    applyFilters() {
        const brandCbs = document.querySelectorAll('.brand-filter-cb');
        this.selectedBrands = [];
        brandCbs.forEach(cb => {
            if (cb.checked) this.selectedBrands.push(cb.value);
        });
        
        window.maxFilterPrice = this.maxPrice;
        window.selectedFilterBrands = this.selectedBrands;
        
        if (window.renderProducts) {
            window.renderProducts();
        }
        this.close();
        ToastManager.show('Đã áp dụng bộ lọc nâng cao!', 'success');
    }
    
    clearFilters() {
        document.getElementById('price-slider').value = 3000000;
        this.updatePriceLabel(3000000);
        document.querySelectorAll('.brand-filter-cb').forEach(cb => cb.checked = false);
        this.selectedBrands = [];
        
        window.maxFilterPrice = 3000000;
        window.selectedFilterBrands = [];
        
        if (window.renderProducts) {
            window.renderProducts();
        }
        this.close();
        ToastManager.show('Đã xóa tất cả bộ lọc!', 'info');
    }
}
window.SidebarFilter = SidebarFilter;
