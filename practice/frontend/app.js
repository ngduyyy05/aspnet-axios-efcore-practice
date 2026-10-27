// Axios instance dùng chung, trỏ tới Back-end ASP.NET Core
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

const els = {
  form: document.getElementById("product-form"),
  id: document.getElementById("id"),
  name: document.getElementById("name"),
  price: document.getElementById("price"),
  quantity: document.getElementById("quantity"),
  submit: document.getElementById("submit-btn"),
  cancel: document.getElementById("cancel-btn"),
  list: document.getElementById("list"),
  msg: document.getElementById("msg"),
};

function showError(err) {
  els.msg.textContent =
    "Lỗi: " + (err.response ? `${err.response.status} ${err.response.statusText}` : err.message);
}

// ---------- GET: lấy danh sách ----------
async function loadProducts() {
  try {
    const res = await api.get("/products");
    els.msg.textContent = "";
    els.list.innerHTML = "";
    res.data.forEach((p) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${p.price}</td>
        <td>${p.quantity}</td>
        <td>
          <button data-edit="${p.id}" class="secondary">Sửa</button>
          <button data-del="${p.id}" class="danger">Xóa</button>
        </td>`;
      els.list.appendChild(tr);
    });
  } catch (err) {
    showError(err);
  }
}

// ---------- GET: lấy 1 sản phẩm theo id (để đổ vào form sửa) ----------
async function startEdit(id) {
  try {
    const res = await api.get(`/products/${id}`);
    els.id.value = res.data.id;
    els.name.value = res.data.name;
    els.price.value = res.data.price;
    els.quantity.value = res.data.quantity;
    els.submit.textContent = "Cập nhật";
    els.cancel.hidden = false;
  } catch (err) {
    showError(err);
  }
}

function resetForm() {
  els.form.reset();
  els.id.value = "";
  els.submit.textContent = "Thêm";
  els.cancel.hidden = true;
}

// ---------- POST (thêm) và PUT (sửa) ----------
els.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    name: els.name.value.trim(),
    price: parseFloat(els.price.value),
    quantity: parseInt(els.quantity.value, 10),
  };

  try {
    if (els.id.value) {
      await api.put(`/products/${els.id.value}`, { id: Number(els.id.value), ...payload });
    } else {
      await api.post("/products", payload);
    }
    resetForm();
    loadProducts();
  } catch (err) {
    showError(err);
  }
});

// ---------- DELETE ----------
async function deleteProduct(id) {
  if (!confirm("Xóa sản phẩm này?")) return;
  try {
    await api.delete(`/products/${id}`);
    loadProducts();
  } catch (err) {
    showError(err);
  }
}

els.list.addEventListener("click", (e) => {
  const editId = e.target.dataset.edit;
  const delId = e.target.dataset.del;
  if (editId) startEdit(editId);
  if (delId) deleteProduct(delId);
});

els.cancel.addEventListener("click", resetForm);

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

loadProducts();
