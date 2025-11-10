const wrapper = document.querySelector(".sliderWrapper");
const menuItems = document.querySelectorAll(".menuItem");

const products = [
  {
    id: 1,
    title: "X Lows SNOW",      // X Lows SNOW
    price: 5000,
    colors: [
      { code: "gray", img: "./img/air.png" },       // changed from "black" -> "gray"
      { code: "black", img: "./img/air2.png" }      // changed from "darkblue" -> "black"
    ]
  },
  {
    id: 2,
    title: "Alter ROGUE",    // Alter ROGUE
    price: 6200,
    colors: [
      { code: "black", img: "./img/jordan.png" },  // changed from "lightgray" -> "black"
      { code: "#fff5d7", img: "./img/jordan2.png" } // changed from "green" -> cream-like hex
    ]
  },
  {
    id: 3,
    title: "Alter GLACIER",        // Alter GLACIER
    price: 4500,
    colors: [
      { code: "white", img: "./img/blazer.png" },  // changed from "lightgray" -> "white"
      { code: "black", img: "./img/blazer2.png" }  // changed from "green" -> "black"
    ]
  },
  {
    id: 4,
    title: "Aeon v2 SIERRA",        // Aeon v2 SIERRA
    price: 5400,
    colors: [
      { code: "yellow", img: "./img/crater.png" },   // changed from "black" -> "yellow"
      { code: "peachpuff", img: "./img/crater2.png" } // changed from "lightgray" -> skin-like ("peachpuff")
    ]
  },
  {
    id: 5,
    title: "X Lows TWISTER",        // X Lows TWISTER
    price: 3999,
    colors: [
      { code: "peachpuff", img: "./img/hippie.png" }, // changed from "gray" -> "peachpuff" (peach)
      { code: "blue", img: "./img/hippie2.png" }      // changed from "black" -> "blue"
    ]
  }
];

// ---------- DOM references ----------
let chosenProduct = products[0];

const currentProductImg = document.querySelector(".productImg");
const currentProductTitle = document.querySelector(".productTitle");
const currentProductPrice = document.querySelector(".productPrice");
const colorBoxes = document.querySelectorAll(".color");
const sizeBoxes = document.querySelectorAll(".size");
const productButton = document.querySelector(".productButton");
const payment = document.querySelector(".payment");
const closeBtn = document.querySelector(".close");

// ---------- Helpers ----------
// Format number as Indian Rupee currency (e.g. ₹5,000)
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

// Normalize image path: if missing extension, append .png (defensive)
function normalizeImgPath(path) {
  if (!path) return "./img/placeholder.png";
  if (/\.(png|jpe?g|webp|svg|gif)$/i.test(path)) return path;
  return path + ".png";
}

// Safe set image with fallback
function setImageSafe(imgElement, src) {
  imgElement.src = normalizeImgPath(src);
  // onerror fallback to placeholder
  imgElement.onerror = () => {
    imgElement.onerror = null;
    imgElement.src = "./img/placeholder.png";
  };
}

// Update UI for a product
function updateProductUI(product) {
  chosenProduct = product;
  currentProductTitle.textContent = product.title || "";
  // If product.price is string/invalid, try parse; otherwise fallback to 0
  const priceNumber = typeof product.price === "number" ? product.price : Number(product.price) || 0;
  currentProductPrice.textContent = inrFormatter.format(priceNumber);

  // set main image to first color img, or placeholder
  const firstImg = product.colors && product.colors[0] ? product.colors[0].img : "./img/placeholder.png";
  setImageSafe(currentProductImg, firstImg);

  // update color boxes (show/hide depending on how many colors product has)
  colorBoxes.forEach((box, idx) => {
    const info = product.colors && product.colors[idx];
    if (info) {
      box.style.display = "inline-block";
      box.style.backgroundColor = info.code || "#ccc";
      box.dataset.img = normalizeImgPath(info.img || "./img/placeholder.png");
      box.removeAttribute("hidden");
      box.style.outline = ""; // reset outline
    } else {
      box.style.display = "none";
      box.removeAttribute("data-img");
      box.setAttribute("hidden", "true");
    }
  });
}

// ---------- Event wiring ----------
// Menu items (change slide and update product)
menuItems.forEach((item, idx) => {
  item.addEventListener("click", () => {
    // Move slider (works when slides correspond to menu items)
    wrapper.style.transform = `translateX(${-100 * idx}vw)`;

    // Use product at same index; if missing, fallback to first
    const product = products[idx] || products[0];
    updateProductUI(product);
  });
});

// Color boxes click (change main image)
colorBoxes.forEach((box) => {
  box.addEventListener("click", () => {
    const img = box.dataset.img;
    if (img) setImageSafe(currentProductImg, img);

    // visual selection
    colorBoxes.forEach(b => (b.style.outline = ""));
    box.style.outline = "3px solid rgba(0,0,0,0.18)";
  });
});

// Sizes selection
sizeBoxes.forEach((s) => {
  s.addEventListener("click", () => {
    sizeBoxes.forEach(x => { x.style.backgroundColor = ""; x.style.color = ""; });
    s.style.backgroundColor = "black";
    s.style.color = "white";
  });
});

// Payment modal open/close
if (productButton && payment) {
  productButton.addEventListener("click", () => {
    payment.style.display = "flex";
  });
}
if (closeBtn && payment) {
  closeBtn.addEventListener("click", () => {
    payment.style.display = "none";
  });
}

// Failsafe: if main image errors, fallback placeholder
if (currentProductImg) {
  currentProductImg.addEventListener("error", () => {
    currentProductImg.src = "./img/placeholder.png";
  });
}

// ---------- Initialize UI on load ----------
updateProductUI(chosenProduct);

// ---------- Payment Integration ----------
const payButton = document.getElementById('payButton');
if (payButton) {
  payButton.addEventListener('click', () => {
    const customerName = document.getElementById('customerName')?.value;
    const customerEmail = document.getElementById('customerEmail')?.value;
    const customerPhone = document.getElementById('customerPhone')?.value;
    const customerAddress = document.getElementById('customerAddress')?.value;

    // Basic validation
    if (!customerName || !customerEmail || !customerPhone || !customerAddress) {
      alert('Please fill in all fields');
      return;
    }

    // Email validation
    if (!customerEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    // Get selected size
    const selectedSize = document.querySelector('.size[style*="background-color: black"]')?.textContent || '42';

    // Store order data for next page
    const orderData = {
      productName: chosenProduct.title,
      price: chosenProduct.price,
      size: selectedSize,
      customerInfo: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress
      }
    };

    localStorage.setItem('pendingOrder', JSON.stringify(orderData));
    
    // Redirect to card details page
    window.location.href = 'card-details.html';
  });
}
